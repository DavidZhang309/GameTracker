import { IServiceRouter } from './middleware/IServiceRouter';
import { TrackerRouter } from './middleware/TrackerRouter';
import { SteamRouter } from './middleware/SteamRouter';
import { OSURouter } from './middleware/OSURouter';

export const services = {
    '/osu': OSURouter,
    '/steam': SteamRouter,
    '/': TrackerRouter
}