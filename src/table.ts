import { Schedule } from "../importedtypes/schedule"
import PDFDocumentWithTables from "../lib/table"

let stations = ["red1", "red2", "red3", "blue1", "blue2", "blue3"]

export default function addTable(schedule: Schedule, doc: PDFDocumentWithTables, highlightTeam?: number) {
    const table = {
        headers: [
            { label: "Time", property: "time" },
            ...stations.map(station => ({ label: station.toUpperCase(), property: `${station}Display` }))
        ],
        datas: schedule.matches.map(m => {
            let teamsDisplay = {}
            for (const station of stations) {
                if (m.surrogates.includes(m[station])) {
                    teamsDisplay[`${station}Display`] = `${m[station]}*`
                } else {
                    teamsDisplay[`${station}Display`] = m[station].toString()
                }
            }

            return {
                time: new Date(m.scheduledTimestamp).toLocaleTimeString(),
                ...teamsDisplay
            }
        }),
    }

    doc.fontSize(30).table(table, {
        width: 572,
        x: 20,
        y: 110,
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
            if (highlightTeam != null) {
                if (Object.values(row).map(t => (t as any).replace("*", "")).includes(highlightTeam.toString())) {
                    if ((Object.values(row) as string[]).find(t => t.startsWith(highlightTeam.toString()))?.includes("*")) {
                        indexColumn === 0 && doc.addBackground(rectRow, 'yellow', 0.5)
                    } else {
                        indexColumn === 0 && doc.addBackground(rectRow, 'green', 0.5)
                    }
                }
            }
        }
    })
}