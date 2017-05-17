import { Router } from 'express';
import { sprintf } from 'sprintf-js';
import { IServiceRouter } from './IServiceRouter';
import { OSUDataService } from '../services/OSUDataService';
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
        let beatmaps = request.query.b;
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
        let userID = request.params['u'];
        
        let user_info;
        let top_perf;
        let top_perf_view = [];
        let recent_plays;
        let recent_plays_view = [];

        Promise.all([
            this.service.getProfile(userID),
            this.service.getTopPerformances(userID, 100),
            this.service.getRecentPlays(userID, 50)
        ]).then((results) => {
            user_info = results[0];
            top_perf = results[1];
            recent_plays = results[2];

            let beatmapIDs = [];
            for(let i = 0; i < top_perf.length; i++) {
                beatmapIDs.push(top_perf[i].beatmap_id);
            }
            for(let i = 0; i < recent_plays.length; i++) {
                beatmapIDs.push(recent_plays[i].beatmap_id);
            }

            beatmapIDs = ArrayUtil.distinct(beatmapIDs);

            return this.service.getBeatmaps(beatmapIDs);
        }).then((beatmaps) => {
            let intl_count = INTL_NAMES.slice().map((name) => { return { name: name, count: 0 }; });
            let genre_count = GENRE_NAMES.slice().map((name) => { return { name: name, count: 0 }; });
            let length_sum = 0;
            let bpm_sum = 0;
            let acc_sum = 0;
            let fc_count = 0;
            let weight_sum = 0;

            for(let i = 0; i < top_perf.length; i++) {
                let perf_info = top_perf[i];
                let beatmap_id = perf_info.beatmap_id;
                let beatmap_info = beatmaps[beatmap_id];

                let modFlagData = parseInt(perf_info.enabled_mods);
                let modFlags = MOD_NAMES.filter((item, index) => {
                    // AND, either 0 or 2^n from bit set
                    return (modFlagData & Math.pow(2, index)) > 0; 
                });

                let dateParts = perf_info.date.split(/[- :]/);
                let date = new Date(Date.UTC(
                    parseInt(dateParts[0]), 
                    parseInt(dateParts[1])-1, 
                    parseInt(dateParts[2]), 
                    parseInt(dateParts[3]), 
                    parseInt(dateParts[4]), 
                    parseInt(dateParts[5])
                ));

                let weighting = Math.pow(0.95, i);
                let total_secs = parseInt(beatmap_info.total_length);

                let hitCount = [ 
                    parseInt(perf_info.count300),
                    parseInt(perf_info.count100),
                    parseInt(perf_info.count50),
                    parseInt(perf_info.countmiss)
                ];

                let hits = hitCount.reduce((accumulator, val, index) => {
                    return accumulator + val * HITVALUE[index];
                }, 0);
                let totalHits = hitCount.reduce((acc, val) => { return acc + val; }, 0) * 300;
                let acc = (hits / totalHits) * 100;

                intl_count[parseInt(beatmap_info.language_id)].count += 1;
                genre_count[parseInt(beatmap_info.language_id)].count += 1;
                bpm_sum += parseInt(beatmap_info.bpm) * weighting;
                length_sum += total_secs * weighting;
                acc_sum += acc * weighting;

                fc_count += perf_info.maxcombo == beatmap_info.max_combo ? 1 : 0;
                weight_sum += weighting;

                top_perf_view.push({
                    perf_info: top_perf[i],
                    beatmap_info: beatmaps[beatmap_id],
                    custom_info: {
                        time_str: sprintf('%02d:%02d', total_secs / 60, total_secs % 60),
                        weighted_pp: (top_perf[i].pp * weighting).toFixed(4),
                        weighting_percent: (weighting * 100).toFixed(2),
                        fc_percent_html: perf_info.maxcombo == beatmap_info.max_combo ? 
                            "<b>FC</b>" : 
                            (parseInt(perf_info.maxcombo) * 100 / parseInt(beatmap_info.max_combo)).toFixed(0) + '%',
                        acc: acc ,
                        no_mod: modFlagData == 0,
                        mods: modFlags.join(','),
                        time_ago: time_ago.ago(date)
                    }
                });
            }

            intl_count = intl_count.filter((item) => { return item.count > 0; });
            genre_count = genre_count.filter((item) => { return item.count > 0; });
            let avg_length = length_sum / weight_sum;

            for(let i = 0; i < recent_plays.length; i++) {
                let beatmap_id = recent_plays[i].beatmap_id;
                recent_plays_view.push({
                    beatmap_info: beatmaps[beatmap_id],
                    play_info: recent_plays[i]
                })
            }

            response.render('pages/osu/osu_profile', {
                user_info: user_info,
                top_performances: top_perf_view,
                top_perf_aggregate: {
                    count: top_perf_view.length,
                    intl_count: intl_count,
                    genre_count: genre_count,
                    avg_bpm: (bpm_sum / weight_sum).toFixed(2),
                    avg_acc: (acc_sum / weight_sum).toFixed(2),
                    avg_length: sprintf('%02d:%02d', avg_length / 60, avg_length % 60),
                    fc_count: fc_count
                },
                recent_plays: recent_plays_view,
                text_only: this.liteRender
            });
        }).catch((error) => {
            next(error);
        });
    }
}