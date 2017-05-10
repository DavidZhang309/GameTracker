import { IServiceRouter } from './middleware/IServiceRouter';
import { TrackerRouter } from './middleware/TrackerRouter';
import { SteamRouter } from './middleware/SteamRouter';
import { OSURouter } from './middleware/OSURouter';

export const services = {
    '/m/osu': new OSURouter(true),
    '/m/steam': new SteamRouter(),
    '/m/': new TrackerRouter(true),
    '/osu': new OSURouter(false),
    '/steam': new SteamRouter(),
    '/': new TrackerRouter(false)
}

export const detailed500error = process.env.NODE_ENV != 'production';
export const generic500error = 'Unable to process request';
