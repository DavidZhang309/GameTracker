import { OSUDataService } from '../services/OSUDataService';
import { Router } from 'express';

export class OSURouter {
    service = new OSUDataService();
    router = new Router();

    public constructor() {
        this.router.route('/beatmaps').get((req, res) => { this.apiGetBeatmaps(req, res); });
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

        this.service.getBeatmaps(beatmaps, function(data) {
            response.send(data);
        });
    }
}