import JSON_DATA from "../io/json_data.js";
import Character from "../model/character/character.js";
import Export2JSON from "../io/write_to_json.js";
import ExportPatten from "../export/export_patten.js";

/*const sampleData = {
    name:'Roger',
    nickname:'King of Pirates',
    class:'Attacker',
    element:'Green',
    rarity:'EX',
    chara_id:4000025
}*/

//saveToFile(sampleData)
function extractAllCharacters(){

    let CHARAS = JSON_DATA.listOf(JSON_DATA.TYPE.CHARACTER)

    let extractedCharas = [];
    let extractedSkills = []
    let chara, skills;
    //main steps
    let extractedNum = 0, maxNum = 400;
    for (let i = 0; i < CHARAS.length; i++) {
        //stop if there is enough maximum
        if (extractedNum >= maxNum) break;

        chara = new Character(Character.getCharaIdFrom(CHARAS[i]))
        if (chara.is_playable){ //only model playable characters
            //push to CHARACTER
            extractedCharas.push(ExportPatten.of(chara, ExportPatten.Patten.CHARACTER));
            //push to SKILL
            skills = Object.values(chara.skills).map(skill => ExportPatten.of(skill, ExportPatten.Patten.SKILL));
            extractedSkills.push(...skills);

            extractedNum++;
        }
    }
    //export CHARACTERS json to file
    Export2JSON.saveToFile(extractedCharas,Export2JSON.Export2File.CHARACTER);
    //export SKILL json to file
    Export2JSON.saveToFile(extractedSkills,Export2JSON.Export2File.SKILL);
    console.log(`Done! Extracted ${extractedNum} character(s)`);
}

//run
extractAllCharacters();
//TODO current using