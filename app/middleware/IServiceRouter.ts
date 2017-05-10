import { Router } from 'express';
import { BaseDataService } from '../services/BaseDataService';

export interface IServiceRouter {
    service: BaseDataService;
    router: Router;
    liteRender: boolean;
}