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
    let extractedNum = 0, maxNum = 10;
    let extractedCharas = [];
    let chara;

    for (let i = 0; i < CHARAS.length; i++) {
        //stop if there is enough maximum
        if (extractedNum >= maxNum) break;

        chara = new Character(Character.getCharaIdFrom(CHARAS[i]))
        if (chara.isPlayableCharacter() && chara.chara_id >400000750){
            extractedCharas.push(ExportPatten.of(chara, ExportPatten.Patten.CHARACTER));
            //extractedCharas.push(chara);
            extractedNum++;
        }
    }
    Export2JSON.saveToFile(extractedCharas,Export2JSON.Export2File.CHARACTER);
    console.log('DONE')
}

//run
extractAllCharacters();