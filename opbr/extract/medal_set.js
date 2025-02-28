import Medal from "./medal.js";
import MedalTag from "./medal_tag.js";
import MedalAffectType from "./medal_affect_type.js";

export default class MedalSet extends Medal{

    medal1; medal2; medal3;

    effect_extra = [];
    // Map<medal_tag_id, amount>
    effect_tags = new Map();
    effect_tag_des = {
        skill1:[],
        skill2:[],
        damage_inc:[],
        damage_dec:[],
        capture_speed:[],
        doge:[]
    }

    constructor(medal1_id, medal2_id, medal3_id) {
        super();
        this.medal1 = new Medal(medal1_id);
        this.medal2 = new Medal(medal2_id);
        this.medal3 = new Medal(medal3_id);
        this.effect_tags = this.#getTagEffects()

        this.#setEffectsFromTag()
        this.#setExtraEffects()

    }
    #getTagEffects(){
        // step1: merge all tags
        // Map<medal_tag_id, amount>
        let effects = new Map()
        let list = [this.medal1, this.medal2, this.medal3];

        for (let medal of list){
            let tags = medal.tag_ids
            tags.forEach(tag_id => {
                effects.set(
                    tag_id,
                    (effects.get(tag_id)?? 0) +1
                )}
            );
        }
        return effects;

    }
    #setEffectsFromTag(){
        //for export information about this set
       this.effect_tags.forEach((amount, tag_id) => {

           let medalTag = new MedalTag(tag_id);
           let effect;
           //check if pair-effect or trio-effect
           if (amount > 1){
               switch(tag_id){
                   case 2: effect = medalTag.effect_pair;break;
                   case 3: effect = medalTag.effect_trio;break;
               }
           }
           /*check if category name is of common tag effect
           view more at:
            - instance field 'effect_tag_des' in this class and
            - static field 'pattern' in MedalAffectType class*/
           let commonPattern = MedalAffectType.pattern
           switch(medalTag.getCategoryName()){
               case commonPattern.skill1:       this.effect_tag_des.skill1.push(effect);break;
               case commonPattern.skill2:       this.effect_tag_des.skill2.push(effect);break;
               case commonPattern.damage_inc:   this.effect_tag_des.damage_inc.push(effect);break;
               case commonPattern.damage_dec:   this.effect_tag_des.damage_dec.push(effect);break;
               case commonPattern.capture_speed:this.effect_tag_des.capture_speed.push(effect);break;
               case commonPattern.doge:         this.effect_tag_des.doge.push(effect);break;
               default:                         if (effect) this.effect_extra.push(effect);
           }
       })
    }
    #setExtraEffects(){
        //merge all from "unique trait" and "effects" which are not classified with 'setEffectsFromTag' function
        let listMedal = [this.medal1, this.medal2, this.medal3];
        listMedal.forEach((medal) => {this.effect_extra.push(medal.unique_trait_des)})
    }
}