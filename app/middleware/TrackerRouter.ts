import { Router } from 'express';
import { TrackerDataService } from '../services/TrackerDataService';
import { IServiceRouter } from './IServiceRouter';

export class TrackerRouter implements IServiceRouter {
    service = new TrackerDataService();
    router = Router();

    public constructor() {
        
    }
}