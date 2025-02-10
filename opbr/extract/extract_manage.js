import JSON_DATA from "../data/json_data.js";

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
    static allOf(tableData, version){
        //get all instances of specific table (in sim.json -JSON file)
        return JSON_DATA.listOf(tableData.tableName, version).map(item => (item[tableData.key]));
    }

    /**
     *
     * @param {ExtractManager.TableData|Object} typeOfData
     * @returns {Array}
     */
    static getNewInstancesOnly(typeOfData){
        let newInstances = ExtractManager.allOf(typeOfData, JSON_DATA.Version.Current);
        let oldInstances = ExtractManager.allOf(typeOfData, JSON_DATA.Version.Previous);
        return Helper.differenceBetweenArrays(oldInstances, newInstances);
    }
}
