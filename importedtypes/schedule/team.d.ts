export declare type TeamsData = [team: number, name: string][];
export declare type TeamScore = {
    team: number;
    rankingScore: number;
    avgMatchScore: number;
    avgHangarScore: number;
    avgAutoScore: number;
    record: {
        win: number;
        loss: number;
        tie: number;
    };
    matchesPlayed: number;
    totalRankingPoints: number;
};