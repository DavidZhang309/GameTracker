import { OSUDataService } from '../services/OSUDataService';
import { Router } from 'express';

export class OSURouter {
    service = new OSUDataService();
    router = Router();

    public constructor() {
        this.router.route('/beatmaps').get((req, res) => { this.apiGetBeatmaps(req, res); });
        //this.router.route('/profile/:u').get((req, res) => { this.profilePage(req, res); });
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
}