import {JSON_DATA_TMP} from "../data/read_from_json.js";
import Ability from "./ability.js";
import MedalTag from "./medal_tag.js";
import Local_JSON from "../data/local_JSON.js";

export default class Medal {
    static TYPE = Object.freeze({
        NORMAL: 'NORMAL',
        EVENT: 'EVENT',
        COLORED: 'COLORED',
        UNKNOWN: 'UNKNOWN',
    })
    medal_id
    name
    is_event
    icon_name
    unique_trait_id
    tag_ids;
    type;
    //get detail directly
    unique_trait_des;
    tag_names;

    constructor(medal_id){
        this.medal_id = medal_id;
        let foundMedal = Medal.findInstance(medal_id);
        if(foundMedal){
            this.name = foundMedal["name"];
            this.icon_name = foundMedal["icon_name"];
            this.is_event = foundMedal["is_event"] || false;
            this.unique_trait_id = foundMedal["ability_id"];
            this.tag_ids = foundMedal["tag_ids"];
            this.type = Medal.typeOfMedal(foundMedal);
            //get detail directly
            this.unique_trait_des = this.uniqueTrait();
            this.tag_names = this.tagNames();
        }
    }
    uniqueTrait(){ return Ability.getTraitOf(this.unique_trait_id)[0]}
    tagNames(){ return MedalTag.tagNamesOf(this.tag_ids)}

    //method
    getName(medal_id){}

    static findInstance(medal_id){
        let MEDALS = JSON_DATA_TMP['medal']
        for(let medal of MEDALS){
            if(medal['medal_id'] === medal_id){ return medal }
        }
    }
    static typeOfMedal(medal){
        if (medal.hasOwnProperty('is_event') && medal['is_event']){                 return Medal.TYPE.EVENT}
        if (medal.hasOwnProperty('original_id')){                                   return Medal.TYPE.COLORED}
        if (!(medal.hasOwnProperty('is_event') || medal.hasOwnProperty('original_id'))){  return Medal.TYPE.NORMAL}
        return Medal.TYPE.UNKNOWN
    }
    static filterByTypeOf(type){
        const MEDALS = Local_JSON.listOf(Local_JSON.TYPE.MEDAL)
        let filtered = []
        for(let medal of MEDALS){
            if(this.typeOfMedal(medal) === type){ filtered.push(medal); }
        }
        return filtered
    }

}


//test
/*
const FIND_MEDAL_ID = 310100049
let foundMedal = new Medal(FIND_MEDAL_ID)
console.log(foundMedal)
console.log('Unique trait is:', foundMedal.uniqueTrait())
console.log('Tag names are:', foundMedal.tagNames())*/
