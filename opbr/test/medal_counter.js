import JSON_DATA from "../io/json_data.js";
import Medal from "../model/medal/medal.js";

//count number of unique trait of all medals
//for optimize io when make Medal Builder project
function countUniqueTrait(){
    let MEDAL = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL)
    let listOfTraits = new Set();
    let des;

    MEDAL.forEach(medal => {
        des = new Medal(medal.medal_id).unique_trait_des
        listOfTraits.add(des)
    })

    let arrayOfUniqueTraits = Array.from(listOfTraits);
    arrayOfUniqueTraits.sort()

    console.log(`::All of medals have: ${listOfTraits.size} unique traits`);
    arrayOfUniqueTraits.forEach((trait, index) => {
        console.log(`-${index}::${trait}`)
    })
}

//run
//Foxy = 20324
//Broggy = 20300
countUniqueTrait()