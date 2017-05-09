import { IServiceRouter } from './middleware/IServiceRouter';
import { TrackerRouter } from './middleware/TrackerRouter';
import { SteamRouter } from './middleware/SteamRouter';
import { OSURouter } from './middleware/OSURouter';

export const services = {
    '/osu': new OSURouter(),
    '/steam': new SteamRouter(),
    '/': new TrackerRouter()
}

export const detailed500error = process.env.NODE_ENV != 'production';
export const generic500error = 'Unable to process request';
