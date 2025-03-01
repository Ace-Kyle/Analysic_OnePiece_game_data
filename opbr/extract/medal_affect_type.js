import JSON_DATA from "../data/json_data.js";

export default class MedalAffectType {
    static AFFECT_TYPE_DATA = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL_AFFECT_TYPE)
    id;
    name;
    //add category for Doge effect, because original JSON is lack of. Its tag_category value = 3
    static #categoryNameForDoge = 'Dodge'
    //just get useful tag name
    static pattern= {
        skill1        :'Skill 1',
        skill2        :'Skill 2',
        damage_inc    :'Damage Increase',
        damage_dec    :'Damage Reduction',
        capture_speed :'Capture Speed',
        dodge          :MedalAffectType.#categoryNameForDoge
    }

    //tag_category from [medal_tag] table
    constructor(tag_category) {
        let found = MedalAffectType.findInstance(tag_category);

        this.id = found['id'];
        this.name = found['name'];
    }

    static findInstance(tag_category){
        for(let type of this.AFFECT_TYPE_DATA){
            //because id=1 is 'Cooldown' name, and it includes some other categories, such as: Skill 1, skill 2, etc.
            //which make the result of category may be false
            if( type['id'] !== 1 &&
                type['type_ids'].includes(tag_category)
            ){ return type}
        }
        // tag_category of Doge is 3 (not defined in original JSON
        // id=1000 is self-defined rule for avoid duplicating with current id in JSON :))
        if (tag_category === 3) return {
            id: 1000,
            name: this.#categoryNameForDoge,
        }
        throw  new Error('Cannot find instance of: '+tag_category);
    }
    static getGeneralPattern(type_ids){
        // 'type_ids' is array of 'tag_category'
        let pattern= {
            skill1:null,
            skill2:'Skill 2',
            damage_inc:'Damage Increase',
            damage_dec:'Damage Reduction',
            capture_speed:'Capture Speed',
        }
    }

    /**check category name by "affect_type" from [ability] table
     *
     * @param type_id number
     * @param category_name MedalAffectType.pattern
     * @returns {boolean}
     */
    static isCategoryOf(type_id, category_name){
        let type = this.AFFECT_TYPE_DATA.find(type=>type.name === category_name)['type_ids']??[];
        return type.includes(type_id)
    }

}