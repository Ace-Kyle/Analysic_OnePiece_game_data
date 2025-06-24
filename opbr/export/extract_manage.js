import JSON_DATA from "../io/json_data.js";
import Helper from "../help/helper.js";
import CharacterInfo from "../modal/character/character_info.js";
import ExportPatten from "./export_patten.js";

class ExtractManager {

    static TableData = Object.freeze({
        Character:      {key: 'chara_id',     tableName: JSON_DATA.TYPE.CHARACTER},
        Profile:        {key: 'profile_id',   tableName: JSON_DATA.TYPE.CHARACTER_PROFILE},
        CharacterSkill: {key: 'skill1_id',    tableName: JSON_DATA.TYPE.SKILL},
        Medal:          {key: 'medal_id',     tableName: JSON_DATA.TYPE.MEDAL},
        CharacterTag:   {key: 'chara_tag_id', tableName: JSON_DATA.TYPE.CHARACTER_TAG},
        MedalTag:       {key: 'medal_tag_id', tableName: JSON_DATA.TYPE.MEDAL_TAG},
    })


    /**
     *
     * @param tableData table want to be compare
     * @param {JSON_DATA.Version|string} version current or previous one
     * @returns {Array}
     */
    static all_id_of(tableData, version){
        //get all instances of specific table (in sim.json -JSON file)
        return JSON_DATA.listOf(tableData.tableName, version).map(item => (item[tableData.key]));
    }

    /**
     *
     * @param {ExtractManager.TableData|Object} typeOfData
     * @returns {Array}
     */
    static getNewInstancesOnly(typeOfData){
        let newInstances = ExtractManager.all_id_of(typeOfData, JSON_DATA.Version.Current);
        let oldInstances = ExtractManager.all_id_of(typeOfData, JSON_DATA.Version.Previous);
        return Helper.differenceBetweenArrays(oldInstances, newInstances);
    }
    static all_CharacterProfile(){
        let PROFILE = JSON_DATA.listOf(this.TableData.Profile.tableName)
        let id, profiles = []

        for (let profile of PROFILE){
            id = profile[this.TableData.Profile.key]
            if (id){
                profiles.push(ExportPatten.of(new CharacterInfo(id), ExportPatten.Patten.PROFILE) )
            }
        }
        console.log(`[ExtractManager] Found ${profiles.length} profile(s)`)
        return profiles
    }
}
//run
//let result = ExtractManager.getNewInstancesOnly(ExtractManager.TableData.Character)
//let result = ExtractManager.all_CharacterProfile();
function test001(params){
   console.log(params === undefined);
   console.log(params === null);
}
test001()
