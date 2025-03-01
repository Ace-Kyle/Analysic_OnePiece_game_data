
import Ability from "./ability.js";
import JSON_DATA from "../data/json_data.js";
import MedalAffectType from "./medal_affect_type.js";

export default class MedalTag {
    name;
    medal_tag_id=0;
    sort_id; tag_category;
    effect_trio; effect_pair;

    constructor(tag_id){
        this.medal_tag_id = tag_id;

        //find and init if found
        let found = MedalTag.findWithId(this.medal_tag_id);
        this.name           = found['name']
        this.sort_id        = found['sort_id']
        this.tag_category   = found['tag_category']
        this.effect_pair    = new Ability(found['set2_ability_id']).affects
        this.effect_trio    = new Ability(found['set3_ability_id']).affects

    }
    static findWithId(id) {
        //from [medal_tag] table
        let MEDAL_TAG = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_TAG)
        for (let medal_tag of MEDAL_TAG) {
            if (medal_tag['medal_tag_id'] === id) return medal_tag;
        }
    }
    getCategoryName() {
        //from [medal_affect_type] table/object
        return new MedalAffectType(this.tag_category).name
    }

    static tagNamesOf(tags=[]){
        let foundTags = []
        for (let tag of tags) {
            foundTags.push(new MedalTag(tag).name);
        }
        return foundTags;
    }
}

//test
/*
let findMedalTag = new MedalTag(9);
console.log(findMedalTag)
console.log(findMedalTag.getCategoryName())*/
