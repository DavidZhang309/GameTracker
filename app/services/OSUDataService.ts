var config = require('../config.json');
var https = require('https');
var MongoClient = require('mongodb').MongoClient;

export class OSUDataService {
    public getBeatmapFromAPI(beatmapID, callback) {
        https.get({
            host: 'osu.ppy.sh',
            path: '/api/get_beatmaps?k=' + config.osu_api_key + '&b=' + beatmapID,
        }, function(httpResponse) {
            let data = '';
            httpResponse.on('data', function(chunk) {
                data += chunk;
            });
            httpResponse.on('end', function() {
                let result = JSON.parse(data);
                if (result.length == 0) {
                    callback(null);
                } else {
                    callback(result[0]);
                }
            });
        });
    }

    public getBeatmapFromCache(connection, beatmapID, callback) {
        let bCollection = connection.collection('osu_beatmaps');
        bCollection.find({
            beatmap_id: beatmapID
            //beatmap_id: { $in: beatmaps }
        }).toArray(function(err, docs){
            if (docs.length == 0) {
                callback(null);
            } else {
                callback(docs[0]);
            }
        });
    }

    public updateBeatmapCache(connection, beatmapID, beatmapData) {
        let bCollection = connection.collection('osu_beatmaps');
        bCollection.replaceOne({
            beatmap_id: beatmapID
        }, beatmapData, {
            upsert: true //insert if does not exist
        });
    }

    public getBeatmap(connection, beatmapID, callback) {
        let svc = this;
        svc.getBeatmapFromCache(connection, beatmapID, function (data) {
            if (data == null) {
                svc.getBeatmapFromAPI(beatmapID, function(data) {
                    svc.updateBeatmapCache(connection, beatmapID, data);
                    callback(data);
                });
            } else {
                callback(data);
            }
        })
    }

    //TODO: handle error cases
    public getBeatmaps(beatmaps, callback) {
        let svc = this;
        MongoClient.connect(config.mongodb_connection, function(err, db) {
            let result = { };
            for(let i = 0; i < beatmaps.length; i++) {
                svc.getBeatmap(db, beatmaps[i], function(data) {
                    result[beatmaps[i]] = data;
                    if (Object.keys(result).length == beatmaps.length) { 
                        callback(result);
                    }
                });
            }
        });
    }
}