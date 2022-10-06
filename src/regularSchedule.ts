import { execFileSync } from "child_process"
import { addLayout } from "./layout"
import PDFDocumentWithTables from "../lib/table"
import addTable from "./table"
import { Schedule } from "../importedtypes/schedule"
import { TeamsData } from "../importedtypes/schedule/team"
import { ScheduledMatch } from "../importedtypes/schedule/match"
import { getTeamNumbers } from "."
import fs from "fs"
import crypto from "crypto"

export function generateRegularScheduleFiles(
    teams: TeamsData,
    roundCount: number,
    teamsPerAlliance: number,
    startTime: Date,
    timeBetweenMatches: number,
    type: "PRACTICE" | "QUALIFICATIONS",
    title: string,
    footer: string
    ) {
    const output = execFileSync("./matchmaker/MatchMaker.exe", [
        "-t", teams.length.toString(),
        "-r", roundCount.toString(),
        "-g",
        "-a", teamsPerAlliance.toString(),
        "-s",
        "-u", "3"

    ]).toString()

    const schedule: Schedule = {
        currentMatchNum: 0,
        leaderboard: [],
        matches: [],
        rounds: roundCount,
        teams: teams,
        type
    }

    for (const matchString of output.split('\r\n').filter(s => s.length > 0)) {
        const i = matchString.indexOf(' ')
        const matchNum = parseInt(matchString.slice(0, i))
        const matchData = matchString.slice(i + 1).split(' ')

        let time = startTime
        for (let b = 1; b < matchNum; b++) {
            time = new Date(time.getTime() + timeBetweenMatches)
        }

        const match: Partial<ScheduledMatch> = {
            matchNum,
            scheduledTimestamp: time.getTime(),
            surrogates: []
        }
        const alliances = ["RED", "BLUE"]
        for (let z = 0; z < alliances.length; z++) {
            const alliance = alliances[z]
            for (let x = 1; x <= teamsPerAlliance; x++) {
                const dataIndex = ((x - 1) + (z * teamsPerAlliance)) * 2
                const teamIndex = parseInt((matchData[dataIndex])) - 1
                let team = getTeamNumbers(teams)[teamIndex]
                if (matchData[dataIndex + 1] === "1") {
                    match.surrogates!.push(team)
                }
                match[`${alliance.toLowerCase()}${x}`] = team
            }
        }

        schedule.matches.push(match as ScheduledMatch)
    }

    fs.writeFileSync("files/scheduleData.json", JSON.stringify(schedule, null, 4))
    fs.writeFileSync("files/teamRadios.nvmre", getTeamNumbers(schedule.teams).map(t => {
        const salt = crypto.randomBytes(4).toString('hex');
        const password = crypto.randomBytes(10).toString('hex');
        return `${t},${t}_${salt},${password}`
    }).join("\n"))

    const masterDoc = new PDFDocumentWithTables({
        size: "LETTER",
        margin: 0
    })
    masterDoc.pipe(fs.createWriteStream('files/master-schedule.pdf'))

    addLayout(masterDoc, `${title} | master`, footer)
    addTable(schedule, masterDoc)

    masterDoc.end()

    const teamsDoc = new PDFDocumentWithTables({
        size: "LETTER",
        margin: 0
    })
    teamsDoc.pipe(fs.createWriteStream('files/teams-schedule.pdf'))

    for (const team of getTeamNumbers(teams)) {
        addLayout(teamsDoc, `${title} | Team ${team}`, footer)
        addTable(schedule, teamsDoc, team)

        teamsDoc.addPage()
    }

    teamsDoc.end()


}