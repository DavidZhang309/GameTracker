import * as fs from 'fs';
import { Router } from 'express';
var config = require('../config.json');

export class OSUMockAPIRouter {
    router = Router();

    public constructor() {
        this.router.route('/:api').get(this.mockAPI);
    }

    private mockAPI(request, response) {
         let data = fs.readFileSync(config.osu_mockapi_dir + '/' + request.params['api'] + '.json'); 
         response.send(data);
    }
}