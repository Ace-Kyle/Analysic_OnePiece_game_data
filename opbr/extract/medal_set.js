import Medal from "./medal.js";
import MedalTag from "./medal_tag.js";
import MedalAffectType from "./medal_affect_type.js";
import ExportPatten from "./export_patten.js";

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

    //for filter from effect_extra again
    #filterPattern = {
        skill1:         new RegExp(".*of Skill 1.*"),
        skill2:         new RegExp(".*of Skill 2.*"),
        capture_speed:  new RegExp(".*Boost capture speed by.* "),
        damage_inc:     new RegExp(".*Increase damage dealt by.*"),
        damage_dec:     new RegExp(".*Reduce damage received by.*"),
        doge:           new RegExp(".*dodge*"),
    }

    constructor(medal1_id, medal2_id, medal3_id) {
        super();
        this.medal1 = new Medal(MedalSet.trimMedalId(medal1_id));
        this.medal2 = new Medal(MedalSet.trimMedalId(medal2_id));
        this.medal3 = new Medal(MedalSet.trimMedalId(medal3_id));
        this.effect_tags = this.#getTagEffects()

        this.#setEffectsFromTag()
        this.#setExtraEffects()
        this.#filterClassifiableEffectsFromExtraEffect()

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
               switch(amount){
                   case 2: effect = medalTag.effect_pair;break;
                   case 3: effect = medalTag.effect_trio;break;
               }
               /*check if category name is of common tag effect
           view more at:
            - instance field 'effect_tag_des' in this class and
            - static field 'pattern' in MedalAffectType class*/
               findCategory: {
                   if (MedalAffectType.isCategoryOf(effect.affect_type, MedalAffectType.pattern.skill1)){
                       this.effect_tag_des.skill1.push(effect.detail); break findCategory;
                   }
                   if (MedalAffectType.isCategoryOf(effect.affect_type, MedalAffectType.pattern.skill2)){
                       this.effect_tag_des.skill2.push(effect.detail); break findCategory;
                   }
                   if (MedalAffectType.isCategoryOf(effect.affect_type, MedalAffectType.pattern.capture_speed)){
                       this.effect_tag_des.capture_speed.push(effect.detail); break findCategory;
                   }
                   if (MedalAffectType.isCategoryOf(effect.affect_type, MedalAffectType.pattern.damage_inc)){
                       this.effect_tag_des.damage_inc.push(effect.detail); break findCategory;
                   }
                   if (MedalAffectType.isCategoryOf(effect.affect_type, MedalAffectType.pattern.damage_dec)){
                       this.effect_tag_des.damage_dec.push(effect.detail); break findCategory;
                   }
                   //add to extra effect if not any above
                   if (effect) this.effect_extra.push(effect.detail);
               }
               }

       })
    }
    #setExtraEffects(){
        //merge all from "unique trait" and "effects" which are not classified with 'setEffectsFromTag' function
        let listMedal = [this.medal1, this.medal2, this.medal3];
        listMedal.forEach((medal) => {this.effect_extra.push(medal.unique_trait_des)})
    }

    //some effects from Unique trait can be moved to category of effect_tag_des
    #filterClassifiableEffectsFromExtraEffect(){
        let notMatchAnyPattern = []

        this.effect_extra.forEach(effect => {
            findPattern: {
                if (this.#filterPattern.skill1.test(effect))        { this.effect_tag_des.skill1.push(effect);        break findPattern;}
                if (this.#filterPattern.skill2.test(effect))        { this.effect_tag_des.skill2.push(effect);        break findPattern;}
                if (this.#filterPattern.damage_inc.test(effect))    { this.effect_tag_des.damage_inc.push(effect);    break findPattern;}
                if (this.#filterPattern.damage_dec.test(effect))    { this.effect_tag_des.damage_dec.push(effect);    break findPattern;}
                if (this.#filterPattern.capture_speed.test(effect)) { this.effect_tag_des.capture_speed.push(effect); break findPattern;}
                if (this.#filterPattern.doge.test(effect))          { this.effect_tag_des.doge.push(effect);          break findPattern;}
                notMatchAnyPattern.push(effect);
            }
        })
        //assign with effects which doesn't match any pattern
        this.effect_extra = notMatchAnyPattern;
    }
    static trimMedalId(id){
        if (Number.isInteger(id)) return id;
        if (typeof id === 'string' && id.includes('img_icon_medal')) return parseInt(id.replace('img_icon_medal_',''), 10);
        throw new Error('MedalId must be integer');
    }
    formatTagNames(){
        let formatted = []
        this.effect_tags.forEach((amount, tag_id) => {
            let tagName = new MedalTag(tag_id).name
            formatted.push(`${amount} | ${tagName}`)
        })
        return formatted.length>0? formatted.join('\n'): ''
    }

    //enhance version
    #setEffectsFromTag2(){
        //for export information about this set
        this.effect_tags.forEach((amount, tag_id) => {

            let medalTag = new MedalTag(tag_id);
            let effect;
            //check if pair-effect or trio-effect
            if (amount > 1){
                switch(amount){
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
                case commonPattern.dodge:         this.effect_tag_des.doge.push(effect);break;
                default:                         if (effect) this.effect_extra.push(effect);
            }
        })
    }
}

/*let medal1 = 'img_icon_medal_310200207';
let medal2 = 'img_icon_medal_310110236';
let medal3 = 'img_icon_medal_310110100';
let MEDAL_SET = new MedalSet(medal1, medal2, medal3);*/

let medalOfSet = "img_icon_medal_310110109\timg_icon_medal_310110135\timg_icon_medal_310200076"
let medals = medalOfSet.split("\t", 3)
medals = medals.map(medal => MedalSet.trimMedalId(medal))
let MEDAL_SET = new MedalSet(medals[0], medals[1], medals[2]);

//console.log(ExportPatten.of(MEDAL_SET ,ExportPatten.Patten.MEDAL_SET))
//console.log(MEDAL_SET.formatTagNames())

//console.log(medals);
