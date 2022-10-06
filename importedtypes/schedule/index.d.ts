import { PlayoffAllianceScore } from "./alliance";
import { ScheduledMatch } from "./match";
import { TeamScore, TeamsData } from "./team";
export declare type Schedule = {
    type: "PRACTICE" | "QUALIFICATIONS";
    teams: TeamsData;
    matches: ScheduledMatch[];
    rounds: number;
    currentMatchNum: number;
    leaderboard: TeamScore[];
};
export declare type PlayoffSchedule = {
    type: "PLAYOFFS";
    alliances: {
        [name: string]: {
            teams: number[];
        };
    };
    matches: ScheduledMatch[];
    rounds: number;
    currentMatchNum: number;
    leaderboard: PlayoffAllianceScore[];
};