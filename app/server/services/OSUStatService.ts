import { sprintf } from 'sprintf-js';

import { IPerformanceData, IBeatmap } from './OSUDataService';

const HITVALUE = [ 300, 100, 50, 0 ];

export class OSUStatService {
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
            weighting: weighting,
            time: {
                totalSeconds: total_secs,
                minutes: total_secs / 60, 
                seconds: total_secs % 60
            },
            weightedPP: (data.pp * weighting),
            fcPercent: data.maxcombo * 100 / parseInt(beatmapData.max_combo),
            accuracy: acc
        };
    }
}

export interface IPerformanceStats {
    data: IPerformanceData;
    weighting: number;
    time: {
        totalSeconds: number,
        minutes: number,
        seconds: number
    };
    weightedPP: number;
    fcPercent: number;
    accuracy: number;
}