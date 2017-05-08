import { Router, Request, Response } from 'express';
import { TrackerDataService } from '../services/TrackerDataService';
import { IServiceRouter } from './IServiceRouter';

export class TrackerRouter implements IServiceRouter {
    service = new TrackerDataService();
    router = Router();

    public constructor() {
        this.router.get('/api/item', (request, response) => { this.apiGetItem(request, response); });
        //this.router.put('/api/item/:item', (request, response) => { this.apiAddItem(request, response); });
    }

    protected apiGetItem(request: Request, response: Response) {
        try {
            let filter = { };
            if (request.param('id') != null) {
                filter['item_id'] = parseInt(request.param('id'));
            } else if (request.param('search') != null) {
                filter['name'] = { $regex: request.param('search') };
            }

            this.service.getItem(filter).then((docs) => {
                response.send(docs);
            }).catch((err) => {
                response.send({ error: 'unknown error' });    
            })  
        } catch (err) {
            response.send({ error: 'bad arguments' });
        }
    }

    // protected apiAddItem(request: Request, response: Response) {

    // }
}