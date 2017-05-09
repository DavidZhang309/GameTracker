import { Router, Request, Response, NextFunction } from 'express';
import { TrackerDataService } from '../services/TrackerDataService';
import { IServiceRouter } from './IServiceRouter';

export class TrackerRouter implements IServiceRouter {
    service = new TrackerDataService();
    router = Router();

    public constructor() {
        this.router.get('/', (request, response) => { this.pageOverview(request, response); });

        this.router.route('/api/item/:item')
            .get((request, response, next) => { (<any>request).is_api = true; this.apiGetItem(request, response, next); })
            .put((request, response, next) => { (<any>request).is_api = true; this.apiAddItem(request, response, next); });
    }

    protected apiGetItem(request: Request, response: Response, next: NextFunction) {
        // get filter
        let filter = { };
        if (request.query['id'] != null && parseInt(request.query['id']) != NaN ) {
            filter['item_id'] = parseInt(request.query['id']);
        } else if (request.query['search'] != null) {
            filter['name'] = { $regex: request.query['search'] };
        } else {
            response.send({ error: 'bad arguments' });
        }
        
        this.service.getItem(filter).then((docs) => {
            response.send(docs);
        }).catch((err) => {
            next(err);  
        })
    }

    protected apiAddItem(request: Request, response: Response, next: NextFunction) {
        let data = { //mongodb format
            $currentdate: { date_added: true }
        }
        
        try {
            let id = parseInt(request.query['id']);
            //TODO: add properties

            if (id == NaN) { throw 'bad arg'; }
        } catch (err) {
            response.send({ error: 'bad arguments' });
        }

        this.service.updateItem(data).then(() => {
            response.send({ });
        }).catch((err) => { 
            next(err);
        });
    }

    protected pageOverview(request, response) {
        response.render('pages/tracker/overview', { });
    }
}