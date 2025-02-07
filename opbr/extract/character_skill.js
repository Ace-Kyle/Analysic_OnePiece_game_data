import {JSON_DATA} from "../data/read_from_json.js";
export default class CharacterSkill {
    static SKILL_TYPE = Object.freeze({
        SKILL_1: "skill_1",
        SKILL_2: "skill_2",
        SKILL_2S: "skill_2s",
        SKILL_3: "skill_3",
    })
    skill_id;
    type;
    name;
    detail;
    cooldown;
    filename;
    constructor(skill_id, type) {
        let found = CharacterSkill.findInstance(skill_id);
        if (found) {
            this.skill_id = skill_id;
            this.name = found['name'];
            this.detail = found['detail'];
            this.cooldown = this.getCooldown(found);
            this.filename = found['filename'];
            this.type = type
        }
    }
    static findInstance(skill_id) {
        //console.log('find skill_id=', skill_id);
        let SKILLS = JSON_DATA['chara_skill']

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
    static getFromChara_skill_1(chara){return chara['skill1_id'] || null}
    static getFromChara_skill_2(chara){return chara['skill2_id'] || null}
    static getFromChara_skill_2s(chara){return chara['skill2s_id'] || null}
    static getFromChara_skill_3(chara){return chara['skill3_id'] || null}

}