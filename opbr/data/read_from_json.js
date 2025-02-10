import fs from 'fs'
class ReadFromJson {

    //get JSOn from game and add them to defined path, with:
    //current: current version from game
    //previous: previous version of current one when game has new update
    static JsonPath = Object.freeze({
        CURRENT:'../res/from_game/data_current/sim.json',
        PREVIOUS:'../res/from_game/data_previous/sim.json',
    })

    static fromJsonFile(filePath){
        try {
            console.time("readJSON_in")
            const RAW = fs.readFileSync(filePath, 'utf-8')
            const jsonData = JSON.parse(RAW)
            console.timeEnd("readJSON_in")
            return jsonData

        } catch (e) {
            console.warn("Error when reading JSON file")
            console.warn(e.toString())
        }
    }

}
function fromJsonFile(filePath){
    try {
        console.time("readJSON_in")
        const RAW = fs.readFileSync(filePath, 'utf-8')
        const jsonData = JSON.parse(RAW)
        console.timeEnd("readJSON_in")
        return jsonData

    } catch (e) {
        console.warn("Error when reading JSON file")
        console.warn(e.toString())
    }
}

// testing data
const PATH = "../res/sim.json"
const JSON_DATA_TMP = fromJsonFile(PATH)
//console.log(data["charas"][10])

//run
export {JSON_DATA_TMP};