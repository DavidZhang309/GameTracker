import * as querystring from 'querystring';
import { BaseDataService } from "./BaseDataService";
var config = require('../config.json');

export class SteamDataService extends BaseDataService {
    public getAPIHost() {
        return config.steam_api_host;
    }

    protected querySteamAPI(api: string, args: object): Promise<Object> {
        let path = api + '?k=' + config.osu_api_key;
        // build query string
        let q = querystring.stringify(args);
        if(q != '') {
            path += '&' + q;
        }

        return new Promise((resolve, reject) => {
            super.queryAPI(path, true).then((data) => {
                resolve(data);
            });
        });
    }
}