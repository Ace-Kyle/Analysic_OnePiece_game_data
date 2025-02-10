import {JSON_DATA_TMP} from "./read_from_json.js";

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

    static local_data = JSON_DATA_TMP;
    static listOf(type){
        if(! Object.values(JSON_DATA.TYPE).includes(type)){ throw new Error(`Unknown type "${type}"`); }
        return JSON_DATA.local_data[type]
    }

}