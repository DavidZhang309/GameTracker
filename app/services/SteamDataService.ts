import * as querystring from 'querystring';
import { BaseDataService } from "./BaseDataService";
var config = require('../config.json');

export class SteamDataService extends BaseDataService {
    public getAPIHost() {
        return config.steam_api_host;
    }

    protected querySteamAPI(api: string, args: object): Promise<string> {
        let path = api + '?key=' + config.steam_api_key;
        // build query string
        let q = querystring.stringify(args);
        if(q != '') {
            path += '&' + q;
        }

        return super.queryAPI(path, true);
    }

    public getPlayerSummaries(user_id: string): Promise<any[]> {
        return this.querySteamAPI('/ISteamUser/GetPlayerSummaries/v0002/', {
            format: 'json',
            steamids: user_id
        }).then((data) => {
            let result = JSON.parse(data);
            if (result != null) {
                return result.response.players;
            } else {
                return [];
            }
        }); 
    }

    public getOwnedGames(user_id: string): Promise<any[]> {
        return this.querySteamAPI('/IPlayerService/GetOwnedGames/v0001/', {
            include_appinfo: 1,
            format: 'json',
            steamid: user_id
        }).then((response) => {
            let gamesData = JSON.parse(response);
            if (gamesData != null) {
                return gamesData.response.games;
            } else {
                return [];
            }
        });
    }
}