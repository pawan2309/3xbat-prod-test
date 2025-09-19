import { Queue, Worker, Job } from 'bullmq';
export declare const cricketOddsQueue: Queue<any, any, string, any, any, string>;
export declare const cricketScorecardQueue: Queue<any, any, string, any, any, string>;
export declare const cricketFixturesQueue: Queue<any, any, string, any, any, string>;
export declare const cricketTVQueue: Queue<any, any, string, any, any, string>;
export declare const casinoDataQueue: Queue<any, any, string, any, any, string>;
export interface CricketOddsJobData {
    eventId: string;
    priority?: number;
    retryCount?: number;
}
export interface CricketScorecardJobData {
    marketId: string;
    priority?: number;
    retryCount?: number;
}
export interface CricketFixturesJobData {
    priority?: number;
    retryCount?: number;
}
export interface CricketTVJobData {
    eventId: string;
    priority?: number;
    retryCount?: number;
}
export interface CasinoDataJobData {
    gameType: string;
    priority?: number;
    retryCount?: number;
}
export declare function createWorkers(): {
    cricketOddsWorker: Worker<CricketOddsJobData, any, string>;
    cricketScorecardWorker: Worker<CricketScorecardJobData, any, string>;
    cricketFixturesWorker: Worker<CricketFixturesJobData, any, string>;
    cricketTVWorker: Worker<CricketTVJobData, any, string>;
    casinoDataWorker: Worker<CasinoDataJobData, any, string>;
};
export declare function addCricketOddsJob(eventId: string, priority?: number): Promise<Job<any, any, string>>;
export declare function addCricketScorecardJob(marketId: string, priority?: number): Promise<Job<any, any, string>>;
export declare function addCricketFixturesJob(priority?: number): Promise<Job<any, any, string>>;
export declare function addCricketTVJob(eventId: string, priority?: number): Promise<Job<any, any, string>>;
export declare function addCasinoDataJob(gameType: string, priority?: number): Promise<Job<any, any, string>>;
export declare function getQueueStatus(): Promise<{
    name: string;
    waiting: any[];
    active: any[];
    completed: any[];
    failed: any[];
    delayed: any[];
}[]>;
export declare function closeQueues(): Promise<void>;
declare const _default: {
    createWorkers: typeof createWorkers;
    addCricketOddsJob: typeof addCricketOddsJob;
    addCricketScorecardJob: typeof addCricketScorecardJob;
    addCricketFixturesJob: typeof addCricketFixturesJob;
    addCricketTVJob: typeof addCricketTVJob;
    addCasinoDataJob: typeof addCasinoDataJob;
    getQueueStatus: typeof getQueueStatus;
    closeQueues: typeof closeQueues;
};
export default _default;
//# sourceMappingURL=apiRequestQueue.d.ts.map