import { Router, Request, Response, NextFunction } from 'express';
import { IServiceRouter } from './IServiceRouter';
import { SteamDataService } from '../services/SteamDataService';

export class SteamRouter implements IServiceRouter {
    service = new SteamDataService();
    router = Router();
    liteRender: boolean;

    public constructor(liteRender: boolean) {
        this.liteRender = liteRender;

        this.router.get('/profile/:user', (request, response, next) => { this.profilePage(request, response, next) });
    }

    protected profilePage(request: Request, response: Response, next: NextFunction) {
        let user_id = request.param('user');
        
        let infoPromise = this.service.getPlayerSummaries(user_id);
        let gamesListPromise = this.service.getOwnedGames(user_id);

        Promise.all([infoPromise, gamesListPromise]).then((data) => {
            let players = data[0];
            let games = data[1];

            if (players.length == 0) {  
                response.render('pages/404');
                return;
            }
            let playerInfo = players[0];


            // Transform to view data
            for(let i = 0; i < games.length; i++) {
                let game = games[i];
                game.hours_forever = (parseInt(game.playtime_forever) / 60.0).toFixed(1);
            }

            // sort
            games.sort((a, b) => {
                return a.playtime_forever < b.playtime_forever ? 1 : -1;
            });

            // render
            response.render('pages/steam/steam_profile', {
                player_info: playerInfo,
                games_list: games,
                text_only: this.liteRender
            });
        }).catch((error) => {
            next(error);
        });
    }
}