import fs from "fs"
import path from "path"
import prompts from "prompts"
import { TeamsData } from "../importedtypes/schedule/team"
import { generateRegularScheduleFiles } from "./regularSchedule"

(async () => {
    const type = (await prompts({
        type: 'select',
        name: 'value',
        message: 'Select schedule type',
        choices: [
            { title: 'Practice', value: "PRACTICE" },
            { title: 'Qualifications', value: "QUALIFICATIONS" },
            { title: 'Playoffs', value: 'PLAYOFFS' }
          ]
      })).value as "PRACTICE" | "QUALIFICATIONS"| "PLAYOFFS"
      if (type === "PLAYOFFS") return //TODO Change for playoffs
    const roundCount = (await prompts({
        type: 'number',
        name: 'value',
        message: 'How many rounds to generate',
    })).value
    const teamsPerAlliance = (await prompts({
        type: 'number',
        name: 'value',
        message: 'How many teams per alliance',
        initial: 3
    })).value
    const startTime = (await prompts({
        type: 'date',
        name: 'value',
        message: 'Schedule start',
        initial: new Date()
    })).value
    const minutesBetweenMatches = (await prompts({
        type: 'number',
        name: 'value',
        message: 'Minutes between matches',
      })).value
    const timeBetweenMatches = minutesBetweenMatches * 60 * 1000
    const title = `FRC ${type} Schedule ${startTime.toLocaleDateString('en-US')}`
    const footer = `ROBOTICON 2022 + NevermoreFMS | Generated on ${new Date().toLocaleString()}`
    const teams = fs.readFileSync(path.join(__dirname, "../teams.csv"), { encoding: 'utf8' }).split("\n").map(t => t.split(",")).map(t => [parseInt(t[0]), t[1]]) as TeamsData

    if (!fs.existsSync("files")){
        fs.mkdirSync("files");
    }

    generateRegularScheduleFiles(
        teams,
        roundCount,
        teamsPerAlliance,
        startTime,
        timeBetweenMatches,
        type,
        title,
        footer
    )

    
})()

export function getTeamNumbers(teams: TeamsData): number[] { return teams.map(t => t[0]) }
export function getTeamName(teams: TeamsData, team: number): string | undefined { return teams.find(t => t[0] === team)?.[1] }