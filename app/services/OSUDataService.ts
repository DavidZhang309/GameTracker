var config = require('../config.json');
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

export class OSUDataService {
    protected queryAPI(api, args, callback) {
        // build path
        let path = api + '?k=' + config.osu_api_key;
        let queryKeys = Object.keys;
        for(let i = 0; i < queryKeys.length; i++) {
            path += '&' + queryKeys[i] + '=' + args[queryKeys[i]];
        }

        // query api
        https.get({
            host: 'osu.ppy.sh',
            path: path,
        }, function(httpResponse) {
            let data = '';
            httpResponse.on('data', function(chunk) {
                data += chunk;
            });
            httpResponse.on('end', function() {
                callback(JSON.parse(data));
            });
        });
    }

    private getBeatmapFromAPI(beatmapID, callback) {
        this.queryAPI('/api/get_beatmaps', {
            b: beatmapID
        }, function(data) {
            if (data.length == 0) {
                callback(null);
            } else {
                callback(data[0]);
            } 
        });
    }

    private getBeatmapsFromCache(connection, beatmapIDs, callback) {
        let bCollection = connection.collection('osu_beatmaps');
        bCollection.find({
            beatmap_id: { $in: beatmapIDs }
        }).toArray(function(err, docs){
            callback(docs);
        });
    }

    private updateBeatmapCache(connection, beatmapID, beatmapData) {
        let bCollection = connection.collection('osu_beatmaps');
        bCollection.replaceOne({
            beatmap_id: beatmapID
        }, beatmapData, {
            upsert: true //insert if does not exist
        });
    }

    //TODO: handle error cases
    public getBeatmaps(beatmapIDs, callback) {
        MongoClient.connect(config.mongodb_connection, (err, db) => {
            this.getBeatmapsFromCache(db, beatmapIDs, (data) => {
                // get missing beatmaps
                let missing = beatmapIDs.filter((beatmapID) => {
                    for(let i = 0; data.length; i++) {
                        if (beatmapID == data[i].beatmap_id) { return false; }
                    }
                    return true;
                });
                

                async.mapSeries(missing, (beatmapID, asyncCallback) => {
                    this.getBeatmapFromAPI(beatmapID, (data) => {
                        this.updateBeatmapCache(db, beatmapID, data);
                        asyncCallback(data);
                    })
                }, (err, missingData) => {
                    let resultData = data.concat(missingData);
                    let result = { };
                    for(let i = 0; i < resultData.length; i++) {
                        result[resultData[i].beatmap_id] = resultData[i];
                    }  
                    callback(result);
                });
            })

        });
    }
}