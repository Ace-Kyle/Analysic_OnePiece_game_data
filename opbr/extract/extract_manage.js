import JSON_DATA from "../data/json_data.js";

class ExtractManager {

    static ID_Key = Object.freeze({
        Character:'chara_id',
        Profile:'profile_id',
        CharacterSkill:'skill1_id',
        Medal:'medal_id',
        CharacterTag:'chara_tag_id',
        MedalTag:'medal_tag_id',
    })

    static allOf(id_key){
        //get all instances of specific table (in sim.json -JSON file)
        return JSON_DATA.listOf(JSON_DATA.TYPE.CHARACTER).map(item => (item[id_key]));
    }
    static getNewInstancesOnly(id_key){
        let newInstances = ExtractManager.allOf(id_key);
        let oldInstances = ExtractManager.allOf(id_key);
    }
}
let result= ExtractManager.allOf(ExtractManager.ID_Key.Character)
console.log(`Have ${result.length} character(s)`)
console.log(result)