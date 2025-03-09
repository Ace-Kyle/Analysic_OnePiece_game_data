import ReadFromJson from "./read_from_json.js";


export default class JSON_DATA {
    static TYPE = Object.freeze({
        ABILITY:            'ability',

        MEDAL:              'medal',
        MEDAL_TAG:          'medal_tag',
        MEDAL_AFFECT_TYPE:  'medal_affect_type',

        CHARACTER:          'charas',
        CLASS:              'chara_role',
        ELEMENT:            'chara_class',
        SKILL:              'chara_skill',
        CHARACTER_TAG:      'chara_tag',
        CHARACTER_PROFILE:  'detail_profile',
    });
    static Version = Object.freeze({
        Current: ReadFromJson.JsonPath.CURRENT,
        Previous: ReadFromJson.JsonPath.PREVIOUS,
    })

    static local_data = {
        currentData:null,
        previousData:null,
    };

    static listOf(type, version=this.Version.Current){
        if(! Object.values(this.TYPE).includes(type)){ throw new Error(`Unknown type "${type}"`); }

        //the keys must be the same ones of local_data field
        let cacheKey = version === this.Version.Current? 'currentData':'previousData';
        if (this.local_data[cacheKey] === null){
            this.local_data[cacheKey] = ReadFromJson.readTheOnlyJsonOfFolder(version)
            //this.local_data[cacheKey] = {}
        }
        return this.local_data[cacheKey][type]
    }

}