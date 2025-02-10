import Local_JSON from "../data/local_JSON.js";
import Character from "../extract/character.js";
import Export2JSON from "../data/write_to_json.js";
import ExportPatten from "../extract/export_patten.js";

const sampleData = {
    name:'Roger',
    nickname:'King of Pirates',
    class:'Attacker',
    element:'Green',
    rarity:'EX',
    chara_id:4000025
}

function exportPattenOf(chara){
    //add 'chara' param later
    //let chara= new Character();
    //add skill info later
    console.log('READ to chara_id=', chara.chara_id);
    return ExportPatten.of(chara, ExportPatten.Patten.CHARACTER)
}

//saveToFile(sampleData)
function extractAllCharacters(){

    let CHARAS = Local_JSON.listOf(Local_JSON.TYPE.CHARACTER)

    let extractedCharas = [];
    let extractedSkills = []
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