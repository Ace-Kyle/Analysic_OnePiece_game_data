import fs from 'fs'
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
function findSimilarTo(findName){
    const CHARAS = JSON_DATA["charas"]
    let found = 0
    for (let chara of CHARAS) {
        if (chara["name"] !== undefined && chara["name"].includes(findName)) {
            console.log(chara["name"])
            found++
        }

    }
    console.log(found>0? "Done!": "Cant find anything")
}
// testing data
const PATH = "../res/sim.json"
const JSON_DATA = fromJsonFile(PATH)
//console.log(data["charas"][10])

//run
//findSimilarTo("Roger")
export {JSON_DATA};