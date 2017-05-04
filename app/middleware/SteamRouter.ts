import { Router } from 'express';
import { IServiceRouter } from './IServiceRouter';
import { SteamDataService } from '../services/SteamDataService';

export class SteamRouter implements IServiceRouter {
    service = new SteamDataService();
    router = Router();
}