import JSON_DATA from "../../io/json_data.js";
export default class CharacterSkill {
    //pre-defined fields
    static SkillNumber = Object.freeze({
        SKILL_1: "skill_1",
        SKILL_1S: "skill_1s",
        SKILL_2: "skill_2",
        SKILL_2S: "skill_2s",
        SKILL_3: "skill_3",
    })
    static Range = Object.freeze({
        CLOSE: "CLOSE",
        MIDDLE: "MIDDLE",
        LONG: "LONG",
        EXTRA_LONG: "EXTRA_LONG",
        UNKNOWN: "UNKNOWN",
    })
    static SpecialEffect = Object.freeze({
        KnockBack:"Knockback",
        Invincible:"Invincible",
        InstantMove:"InstantMove",
        IgnoreObstacle:"IgnoreObstacle",
        CreateShield:"CreateShield",
    })
    static Type = Object.freeze({
        Normal: "Normal",
        HoldDown: "HoldDown",
        Counter: "Counter",
    })
    is_valid;
    skill_id;
    skill_number;
    name;
    detail;
    cooldown;
    filename;

    range; //close, mid, long, extra-long
    active_type; //normal, counter, hold-down
    special_effect; //invincible, ignore-obstacle, instant-move, knockback



    constructor(skill_id, skill_number) {
        let found = CharacterSkill.findInstance(skill_id);
        if (found) {
            this.skill_id       = skill_id;
            this.name           = found['name'] ??null;
            this.detail         = found['detail'] ??null;
            this.is_valid       = this.isValidSkill()
            this.cooldown       = this.getCooldown(found);
            this.filename       = found['filename'];
            this.skill_number   = skill_number;

            //get from detail field
            this.range          = this.getRange()
            this.active_type    = this.getActiveType()
            this.special_effect = this.getSpecialEffects()
        }
    }
    static findInstance(skill_id) {
        //console.log('find skill_id=', skill_id);
        let SKILLS = JSON_DATA.listOf(JSON_DATA.TYPE.SKILL)

        for(let skill of SKILLS){
            if (skill['skill_id'] === skill_id) return skill;
        }
        console.error(`Skill ${skill_id} not found`);
        throw new Error(`Unknown skill: ${skill_id}`);
    }

    getCooldown(skill) {
        let skill_lv = skill['skill_lv']
        let max_lv = skill_lv[skill_lv.length - 1]
        if(max_lv){ return max_lv['cool_time']}
        throw new Error(`Unknown skill: ${skill_lv}`);
    }
    getRange(){
        if (!this.is_valid) return '';
        try {
            if (this.detail.includes('An extra long-range')) return CharacterSkill.Range.EXTRA_LONG
            if (this.detail.includes('A long-range')) return CharacterSkill.Range.LONG
            if (this.detail.includes('A mid-range')) return CharacterSkill.Range.MIDDLE
            if (this.detail.includes('A close-range')) return CharacterSkill.Range.CLOSE
        } catch (e) {
            console.error('Error at skill object:', CharacterSkill.findInstance(this.skill_id));
        }
        return CharacterSkill.Range.UNKNOWN
    }
    getActiveType(){
        if (!this.is_valid) return '';
        if (this.detail.includes('When Counter Succeeds')) return CharacterSkill.Type.Counter
        if (this.detail.includes('holding down'))          return CharacterSkill.Type.HoldDown
        return CharacterSkill.Type.Normal
    }
    getSpecialEffects(){
        if (!this.is_valid) return '';
        //list of special-effects
        let list = []
        if (this.detail.includes('Become temporarily invincible after use')) list.push(CharacterSkill.SpecialEffect.Invincible)
        if (this.detail.includes('Moves torwards enemies'))                  list.push(CharacterSkill.SpecialEffect.InstantMove)
        if (this.detail.includes('Attack ignores obstacles'))                list.push(CharacterSkill.SpecialEffect.IgnoreObstacle)
        if (this.detail.includes('with a Knockback effec'))                  list.push(CharacterSkill.SpecialEffect.KnockBack)
        if (this.detail.includes('Create a shield') || this.detail.includes('Create Barrier')) list.push(CharacterSkill.SpecialEffect.CreateShield)
        return list;
    }
    isValidSkill(){
        //not from BOSS' skill
        return !(this.skill_id >= 7000000 || this.name === "???" || this.name === null)
    }
    static isValidSkill(skill_id){ return !(skill_id > 7000000)}
    static getListSkillIds(chara, isDoubleChara=false){
        let list = {}
        list[this.SkillNumber.SKILL_1] = chara['skill1_id']?? 0
        list[this.SkillNumber.SKILL_2] = chara['skill2_id']?? 0
        if (isDoubleChara){
            //skill_id of second character is skill_id of first chara + 200
            list[this.SkillNumber.SKILL_1S] = list[this.SkillNumber.SKILL_1] + 200 || 0
            list[this.SkillNumber.SKILL_2S] = list[this.SkillNumber.SKILL_2] + 200 || 0
            return list
        }
        if (Object.hasOwn(chara, 'skill2s_id')) list[this.SkillNumber.SKILL_2S] = chara['skill2s_id']?? 0
        if (Object.hasOwn(chara, 'skill3_id')) list[this.SkillNumber.SKILL_3] = chara['skill3_id']?? 0
        return list
    }

    static getFromChara_skill_1(chara){return chara['skill1_id'] || null}
    static getFromChara_skill_2(chara){return chara['skill2_id'] || null}
    static getFromChara_skill_2s(chara){return chara['skill2s_id'] || null}
    static getFromChara_skill_3(chara){return chara['skill3_id'] || null}

}