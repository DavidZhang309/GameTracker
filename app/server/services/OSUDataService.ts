import * as https from 'https';
import * as mongodb from 'mongodb';
import * as asyncJS from 'async';
import * as querystring from 'querystring';
import { BaseDataService } from './BaseDataService';

var config = require('../config.json');
var MongoClient = mongodb.MongoClient;

const PERFORMANCE_QUERY_LIMIT = 100;

//TODO: handle error cases
export class OSUDataService extends BaseDataService {
    public getAPIHost() {
        return config.osu_api_host;
    }

    protected queryOSUAPI(api: string, args: any): Promise<any[]> {
        let path = api + '?k=' + config.osu_api_key;
        // build query string
        let q = querystring.stringify(args);
        if(q != '') {
            path += '&' + q;
        }
        // query
        return super.queryAPI(path, config.osu_api_issecure).then((data) => {
            return JSON.parse(data); 
        });
    }

    private getBeatmapFromAPI(beatmapID): Promise<any> {
        return this.queryOSUAPI('/api/get_beatmaps', {
            b: beatmapID
        }).then(function(data) {
            if (data.length == 0) {
                return null;
            } else {
                return data[0];
            }
        });
    }

    public getProfile(userID): Promise<any> {
        return this.queryOSUAPI('/api/get_user', {
            u: userID
        }).then(function(data) {
            if (data.length == 0) {
                return null;
            } else {
                return data[0];
            } 
        });
    }

    protected parsePerformanceData(raw): IPerformanceData {
        // parse date
        let dateParts = raw.date.split(/[- :]/);
        let date = new Date(Date.UTC(
            parseInt(dateParts[0]), 
            parseInt(dateParts[1])-1, 
            parseInt(dateParts[2]), 
            parseInt(dateParts[3]), 
            parseInt(dateParts[4]), 
            parseInt(dateParts[5])
        ) - (8 * 60 * 60 * 1000)); // UTC+8

        return {
            beatmap_id: raw.beatmap_id,
            score: parseInt(raw.score),
            maxcombo: parseInt(raw.maxcombo),
            count300: parseInt(raw.count300),
            count100: parseInt(raw.count100),
            count50: parseInt(raw.count50),
            countmiss: parseInt(raw.countmiss),
            countkatu: parseInt(raw.countkatu),
            countgeki: parseInt(raw.countgeki),
            perfect: raw.perfect == '1',
            enabled_mods: parseInt(raw.enabled_mods),
            user_id: raw.user_id,
            date: date,
            rank: raw.rank,
            pp: parseFloat(raw.pp),
        };
    }

    public getTopPerformances(userID): Promise<IPerformanceData[]> {
        return this.queryOSUAPI('/api/get_user_best', {
            u: userID,
            limit: PERFORMANCE_QUERY_LIMIT
        }).then((data: any[]) => {
            return data.map((raw) => { return this.parsePerformanceData(raw); });
        });
    }

    public getRecentPlays(userID, limit): Promise<any[]> {
        return this.queryOSUAPI('/api/get_user_recent', {
            u: userID,
            limit: limit
        }).then(function(data) {
            return data;
        });
    }

    private getBeatmapsFromCache(connection, beatmapIDs): Promise<IBeatmap[]> {
        let bCollection = connection.collection('osu_beatmaps');
        return new Promise<any[]>((resolve, reject) => {
            bCollection.find({
                beatmap_id: { $in: beatmapIDs }
            }).toArray((err, docs) => {
                resolve(docs);
            });
        });
    }

    private updateBeatmapCache(connection, beatmapID, beatmapData): Promise<void> {
        let bCollection = connection.collection('osu_beatmaps');
        return new Promise<void>((resolve, reject) => {
            bCollection.replaceOne({
                beatmap_id: beatmapID
            }, beatmapData, {
                upsert: true //insert if does not exist
            });
        });
    }

    public getBeatmaps(beatmapIDs: string[]): Promise<{ [beatmapID: string]: IBeatmap }> {
        return this.connectToDB() // Connect to db
            .then( // Get cached beatmaps and join with db connection
                (db) => this.getBeatmapsFromCache(db, beatmapIDs).then((cachedData) => [db, cachedData] as [mongodb.Db, IBeatmap[]])
            ).then(([db, cachedData]) => {
                // Get missing beatmaps
                const missingDataPromises = beatmapIDs.filter( // Get beatmap id that are not cached
                    (beatmapID) => cachedData.findIndex((data) => data.beatmap_id === beatmapID) === -1
                ).map((beatmapID) => this.getBeatmapFromAPI(beatmapID)); // Query for missing beatmaps

                // Cache new data
                missingDataPromises.forEach((query) => query.then((data) => this.updateBeatmapCache(db, data.beatmap_id, data)));

                return [cachedData, missingDataPromises] as [IBeatmap[], Promise<IBeatmap>[]];
            }).then( // wait for promises to fulfill and join data
                ([cachedData, missingDataPromises]) => Promise.all(missingDataPromises).then((queriedMaps) => cachedData.concat(queriedMaps))
            ).then( // build mapping object
                (beatmaps) => beatmaps.reduce((acc, beatmap) => { acc[beatmap.beatmap_id] = beatmap; return acc; }, { })
            );
    }
}

export interface IOSUUser {
    user_id: string;
    username: string;
    count300: string;
    count100: string;
    count50: string;
    playcount: string;
    ranked_score: string;
    total_score: string;
    pp_rank: string;
    level: string;
    pp_raw: string;
    accuracy: string;
    count_rank_ss: string;
    count_rank_s: string;
    count_rank_a: string;
    country: string;
    pp_country_rank: string;
    events: any[];
}

export interface IBeatmap {
    approved: string;
    approved_date: string;
    last_update: string;
    artist: string;
    beatmap_id: string;
    beatmapset_id: string;
    bpm: string;
    creator: string;
    difficultyrating: string;
    diff_size: string;
    diff_overall: string;
    diff_approach: string;
    diff_drain: string;
    hit_length: string;
    source: string;
    genre_id: string;
    language_id: string;
    title: string;
    total_length: string;
    version: string;
    file_md5: string;
    mode: string;
    tags: string;
    favourite_count: string;
    playcount: string;
    passcount: string;
    max_combo: string;
}

export interface IPerformanceData {
    beatmap_id: string;
    score: number;
    maxcombo: number;
    count300: number;
    count100: number;
    count50: number;
    countmiss: number;
    countkatu: number;
    countgeki: number;
    perfect: boolean;
    enabled_mods: number;
    user_id: string;
    date: Date;
    rank: string;
    pp: number;
}
