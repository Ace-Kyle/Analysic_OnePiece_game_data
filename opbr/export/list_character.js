import JSON_DATA from "../data/json_data.js";
import Character from "../extract/character.js";
import ExportPatten from "../extract/export_patten.js";

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
        if (chara.is_playable){ //only extract playable characters
            //push to CHARACTER
            extractedCharas.push(ExportPatten.of(chara, ExportPatten.Patten.CHARACTER));
            //push to SKILL
            //skills = Object.values(chara.skills).map(skill => ExportPatten.of(skill, ExportPatten.Patten.SKILL));
            //extractedSkills.push(...skills);

            extractedNum++;
        }
    }
    return extractedCharas
}

export {allCharacters};