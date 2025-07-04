import JSON_DATA from "../io/json_data.js";
import Character from "../model/character/character.js";
import ExportPatten from "./export_patten.js";

function allCharacters(){
    console.warn("It running all characters...");
    let CHARAS = JSON_DATA.listOf(JSON_DATA.TYPE.CHARACTER)

    let extractedCharas = [];
    //let extractedSkills = []
    let chara, skills;
    //main steps
    let extractedNum = 0, maxNum = 400;
    for (let i = 0; i < CHARAS.length; i++) {
        //stop if there is enough maximum
        if (extractedNum >= maxNum) break;

        chara = new Character(Character.getCharaIdFrom(CHARAS[i]))
        if (chara.is_playable){ //only model playable characters
            //push to CHARACTER
            extractedCharas.push(ExportPatten.of(chara, ExportPatten.Patten.CHARACTER_RANKING));
            //push to SKILL
            //skills = Object.values(chara.skills).map(skill => ExportPatten.of(skill, ExportPatten.Patten.SKILL));
            //extractedSkills.push(...skills);

            extractedNum++;
        }
    }
    return extractedCharas
}

export {allCharacters};