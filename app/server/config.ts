import { IServiceRouter } from './middleware/IServiceRouter';
import { AuthRouter } from './middleware/AuthRouter';
import { TrackerRouter } from './middleware/TrackerRouter';
import { SteamRouter } from './middleware/SteamRouter';
import { OSURouter } from './middleware/OSURouter';

export const services = {
    '/m/osu': new OSURouter(true),
    '/m/steam': new SteamRouter(true),
    '/m/auth': new AuthRouter(true),
    '/m/': new TrackerRouter(true),
    '/osu': new OSURouter(false),
    '/steam': new SteamRouter(false),
    '/auth': new AuthRouter(false),
    '/': new TrackerRouter(false)
}

export const detailed500error = process.env.NODE_ENV != 'production';
export const generic500error = 'Unable to process request';

export const enableOSUAPI = false;

export const port = 5591;