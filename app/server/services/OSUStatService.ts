import { OSUDataService } from './OSUDataService';
import { IPerformanceData, IBeatmap } from './OSUDataService';

const HITVALUE = [ 300, 100, 50, 0 ];

export enum OsuMods {
    NoFail,
    Easy,
    NoVideo,
    Hidden,
    HardRock,
    SuddenDeath,
    DoubleTime,
    Relax,
    HalfTime,
    Nightcore,
    Flashlight,
    Autoplay,
    SpunOut,
    Relax2,
    Perfect
}


export class OSUStatService {
    public constructor(
        private dataSvc: OSUDataService
    ) { }
    
    public getPerformanceStats(data: IPerformanceData, beatmapData: IBeatmap, weighting: number): IPerformanceStats {
        // Beatmap data
        let total_secs = parseInt(beatmapData.total_length);

        // Calculate accuracy
        let hitCount = [ 
            data.count300,
            data.count100,
            data.count50,
            data.countmiss
        ];
        let hits = hitCount.reduce((accumulator, val, index) => {
            return accumulator + val * HITVALUE[index];
        }, 0);
        let totalHits = hitCount.reduce((acc, val) => { return acc + val; }, 0) * 300;
        let acc = (hits / totalHits) * 100;

        return {
            data: data,
            beatmap: beatmapData,
            weighting: weighting,

            time: {
                totalSeconds: total_secs,
                minutes: total_secs / 60, 
                seconds: total_secs % 60
            },
            noMod: data.enabled_mods === 0,
            mods: Object.keys(OsuMods)
                .filter((_, index) => (data.enabled_mods & Math.pow(2, index)) > 0)
                .map((key) => OsuMods[key]),
            isFC: data.perfect,

            weightedPP: (data.pp * weighting),
            accuracy: acc,
            fcPercent: data.maxcombo * 100 / parseInt(beatmapData.max_combo),
            isPerfect: data.perfect && hitCount[1] === 0 && hitCount[2] === 0 && hitCount[3] === 0
        };
    }
}

export interface IPerformanceStats {
    // Parameters
    data: IPerformanceData;
    beatmap: IBeatmap;
    weighting: number;

    // direct beatmap data
    isFC: boolean;
    time: {
        totalSeconds: number,
        minutes: number,
        seconds: number
    };

    mods: OsuMods[];
    noMod: boolean;

    // Calculated
    isPerfect: boolean;
    weightedPP: number;
    fcPercent: number;
    accuracy: number;
}