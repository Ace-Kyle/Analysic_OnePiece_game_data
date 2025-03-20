import JSON_DATA from "../data/json_data.js";
import Export2JSON from "../data/write_to_json.js";

function extractStructure(){
    let ABILITY = JSON_DATA.listOf(JSON_DATA.TYPE.ABILITY);
    let CHARACTER = JSON_DATA.listOf(JSON_DATA.TYPE.CHARACTER);
    let MEDAL = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL);
    let MEDAL_TAG = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_TAG);

    let structure = {}

    structure["ability"] = getSomeSampleObject(ABILITY, 3);
    structure["character"] = getSomeSampleObject(CHARACTER, 3);
    structure['medal'] = getSomeSampleObject(MEDAL, 3);
    structure['medal_tag'] = getSomeSampleObject(MEDAL_TAG, 3);

    return structure;
}
function getSomeSampleObject(data, amount=3){
    let result = []
    for(let i = 0; i < amount; i++){
        result.push(data[i]);
    }
    return result;
}

Export2JSON.saveToFile(extractStructure())