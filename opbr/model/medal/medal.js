
import Ability from "../general/ability.js";
import MedalTag from "./medal_tag.js";
import JSON_DATA from "../../io/json_data.js";

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
    unique_trait
    tag_names;

    constructor(medal_id){
        this.medal_id = medal_id;
        let foundMedal = Medal.findInstance(medal_id);
        if(foundMedal){
            this.name            = foundMedal["name"];
            this.icon_name       = foundMedal["icon_name"];
            this.is_event        = Object.hasOwn(foundMedal, 'is_event')
            this.unique_trait_id = foundMedal["ability_id"];
            this.tag_ids         = foundMedal["tag_ids"];
            this.type            = Medal.typeOfMedal(foundMedal);
            //get detail directly
            let foundUniqueTrait= new Ability(this.unique_trait_id)
            this.unique_trait     = foundUniqueTrait.affects
            this.unique_trait_des = foundUniqueTrait.getDetails().toString()
            this.tag_names        = this.tagNames();
        }
    }
    uniqueTrait(){ return new Ability(this.unique_trait_id).getDetails()}
    tagNames(){ return MedalTag.tagNamesOf(this.tag_ids)}

    //method
    getName(medal_id){}

    static findInstance(medal_id){
        let MEDALS = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL)
        for(let medal of MEDALS){
            if(medal['medal_id'] === medal_id){ return medal }
        }
        return null;
    }
    static typeOfMedal(medal){
        if (medal.hasOwnProperty('is_event') && medal['is_event']){                 return Medal.TYPE.EVENT}
        if (medal.hasOwnProperty('original_id')){                                   return Medal.TYPE.COLORED}
        if (!(medal.hasOwnProperty('is_event') || medal.hasOwnProperty('original_id'))){  return Medal.TYPE.NORMAL}
        return Medal.TYPE.UNKNOWN
    }
    static filterByTypeOf(...types){
        const MEDALS = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL)

        return MEDALS.filter(medal => {
            let type = Medal.typeOfMedal(medal);
            return types.includes(type);

        });
    }

}


//test
/*const FIND_MEDAL_ID = 310100049
let foundMedal = new Medal(FIND_MEDAL_ID)
console.log(foundMedal)
console.log('Unique trait is:', foundMedal.uniqueTrait())
console.log('Tag names are:', foundMedal.tagNames())*/
