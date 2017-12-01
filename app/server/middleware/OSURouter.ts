import { Router } from 'express';
import { sprintf } from 'sprintf-js';
import { IServiceRouter } from './IServiceRouter';
import { OSUDataService, IPerformanceData, IBeatmap } from '../services/OSUDataService';
import { OSUStatService, IPerformanceStats } from '../services/OSUStatService';
import * as time_ago_lib from 'time-ago';
import * as ArrayUtil from '../utils/array';
import * as config from '../config';

let time_ago = time_ago_lib();

const HITVALUE = [ 300, 100, 50, 0 ];
const INTL_NAMES = [
	'any',
	'other',
	'english',
	'japanese',
	'chinese',
	'instrumental',
	'korean',
	'french',
	'german',
	'swedish',
	'spanish',
	'italian'
];
const GENRE_NAMES = [
    'any',
	'unspecified',
	'video game',
	'anime',
	'rock',
	'pop',
	'other',
	'novelty',
    null,
	'hip hop',
	'electronic'
]
const MOD_NAMES = [
    'NoFail',
    'Easy',
    'NoVideo',
    'Hidden',
    'HardRock',
    'SuddenDeath',
    'DoubleTime',
    'Relax',
    'HalfTime',
    'Nightcore',
    'Flashlight',
    'Autoplay',
    'SpunOut',
    'Relax2',
    'Perfect'
]

export class OSURouter implements IServiceRouter {
    service = new OSUDataService();
    stats = new OSUStatService();
    router = Router();
    liteRender: boolean;

    public constructor(lite: boolean) {
        this.liteRender = lite;

        if (config.enableOSUAPI) {
            this.router.route('/beatmaps').get((req, res) => { this.apiGetBeatmaps(req, res); });
        }
        this.router.route('/profile/').get((req, res) => { res.render('pages/osu/osu_profile_search'); });
        this.router.route('/profile/:u').get((req, res, next) => { this.profilePage(req, res, next); });
    }

    public apiGetBeatmaps(request, response) {
        // parse request
        let beatmaps: string[] = request.query.b;
        if (beatmaps == null) {
            response.send([]);
            return;
        } else if (!Array.isArray(beatmaps)) {
            beatmaps = [request.query.b];
        }

        this.service.getBeatmaps(beatmaps).then((data) => {
            response.send(JSON.stringify(data));
        }).catch((error) =>{ 
            console.log(error);
            response.send('[]');
         });
    }

    // server-sided pages
    public profilePage(request, response, next) {
        const userID = request.params['u'];

        Promise.all([
            this.service.getProfile(userID),
            this.service.getTopPerformances(userID, 100),
            this.service.getRecentPlays(userID, 50)
        ]).then(([user_info, top_perf, recent_plays]) => {
            // Gather beatmap IDs
            const beatmapIDs = ArrayUtil.distinct([
                ...top_perf.map((perf) => perf.beatmap_id),
                ...recent_plays.map((recent) => recent.beatmap_id),
            ]);            
            // Make query and gather needed data
            return this.service.getBeatmaps(beatmapIDs).then((beatmaps) => ({
                user_info: user_info,
                performances: top_perf.map((perf, index) => ({
                    weighting: Math.pow(0.95, index),
                    data: perf,
                    stats: this.stats.getPerformanceStats(perf, beatmaps[perf.beatmap_id], Math.pow(0.95, index)),
                    beatmap: beatmaps[perf.beatmap_id]
                })),
                recent: recent_plays.map((recent_play) => ({
                    data: recent_play,
                    beatmap: beatmaps[recent_play.beatmap_id]
                }))
            }));
        }).then((data) => {
            response.render('pages/osu/osu_profile', {
                text_only: this.liteRender,
                user_info: data.user_info,

                top_performances: data.performances.map((perf, i) => ({
                    perf_info: perf.data,
                    beatmap_info: perf.beatmap,

                    position: i + 1,
                    pp: perf.data.pp.toFixed(4),
                    beatmap_id: perf.beatmap.beatmap_id,
                    custom_info: {
                        time_str: sprintf('%02d:%02d', perf.stats.time.minutes, perf.stats.time.seconds),
                        weighted_pp: (perf.stats.weightedPP).toFixed(4),
                        weighting_percent: (perf.weighting * 100).toFixed(2),
                        fc_percent_html: perf.data.perfect ? "<b>FC</b>" : (perf.data.maxcombo * 100 / parseInt(perf.beatmap.max_combo)).toFixed(0) + '%',
                        acc: perf.stats.accuracy,
                        no_mod: perf.data.enabled_mods == 0,
                        mods: MOD_NAMES.filter((item, index) => {
                            // AND, either 0 or 2^n from bit set
                            return (perf.data.enabled_mods & Math.pow(2, index)) > 0; 
                        }).join(','),
                        time_ago: time_ago.ago(perf.data.date),
                        play_date_string: perf.data.date.toLocaleString()
                    }
                })),
                top_perf_aggregate: ((aggregate) => {
                    const avg_length = aggregate.length_sum / aggregate.weight_sum;
                    return {
                        count: data.performances.length,
                        intl_count: aggregate.intl_count.filter((item) => { return item.count > 0; }),
                        genre_count: aggregate.genre_count.filter((item) => { return item.count > 0; }),
                        avg_bpm: (aggregate.bpm_sum / aggregate.weight_sum).toFixed(2),
                        avg_acc: (aggregate.acc_sum / aggregate.weight_sum).toFixed(2),
                        avg_length: sprintf('%02d:%02d', avg_length / 60, avg_length % 60),
                        fc_count: data.performances.reduce((acc, perf) => acc + (perf.data.maxcombo === parseInt(perf.beatmap.max_combo, 10) ? 1 : 0), 0)
                    };
                })(data.performances.reduce((acc, perf) => {
                    acc.intl_count[parseInt(perf.beatmap.language_id)].count += 1;
                    acc.genre_count[parseInt(perf.beatmap.genre_id)].count += 1;
                    acc.bpm_sum += parseInt(perf.beatmap.bpm) * perf.weighting;
                    acc.length_sum += perf.stats.time.totalSeconds * perf.weighting;
                    acc.acc_sum += perf.stats.accuracy * perf.weighting;
                    acc.weight_sum += perf.weighting;
                    acc.fc_count += perf.data.maxcombo === parseInt(perf.beatmap.max_combo, 10) ? 1 : 0;
                    return acc;
                }, {
                    intl_count: INTL_NAMES.slice().map((name) => { return { name: name, count: 0 }; }),
                    genre_count: GENRE_NAMES.slice().map((name) => { return { name: name, count: 0 }; }),
                    length_sum: 0,
                    bpm_sum: 0,
                    acc_sum: 0,
                    fc_count: 0,
                    weight_sum: 0
                })),

                recent_plays: data.recent.map((recent_play) => ({
                    play_info: recent_play.data,
                    beatmap_info: recent_play.beatmap
                }))
            });
        }).catch((error) => {
            next(error);
        });
    }
}