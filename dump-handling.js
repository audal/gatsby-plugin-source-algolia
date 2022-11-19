const path = require("path")
const fse = require("fs-extra")

const isWithinTime = (date, hoursBeforeExpiry) => {
    const inMs = hoursBeforeExpiry * 60 * 60 * 1000;
    const timeAgo = Date.now() - inMs;
    return date > timeAgo;
}

exports.getDump = (indexName, dumpLifetime= 72) => {
    const savedIndex = path.join(process.cwd(), `.cache/algolia-dump/${indexName}.json`)
    if (fse.pathExistsSync(savedIndex)) {
        const jsonData = fse.readJsonSync(savedIndex);
        if (isWithinTime(jsonData.datetime, dumpLifetime)) {
            return jsonData.data
        }
    }
}

exports.saveDump = (indexName, data) => {
    const savedIndex = path.join(process.cwd(), `.cache/algolia-dump/${indexName}.json`)
    fse.ensureDirSync(path.join(process.cwd(), `.cache/algolia-dump/`))
    fse.writeJsonSync(savedIndex, {
        datetime: Date.now(),
        data
    })
}
