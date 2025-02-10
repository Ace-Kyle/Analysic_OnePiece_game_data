import Character from "./character.js";
import CharacterSkill from "./character_skill.js";
import Medal from "./medal.js";
import CharacterInfo from "./character_info.js";

export default class ExportPatten {
    static Patten = Object.freeze({
        CHARACTER: 'chara',
        SKILL: 'chara_skill',
        MEDAL: 'medal',
        CHARACTER_PROFILE: 'detail_profile',
    })
    static of(data, type){
        switch (type){
            case this.Patten.CHARACTER: return this.#character(data);
            case this.Patten.SKILL:     return this.#skill(data);
            case this.Patten.MEDAL:     return this.#medal(data);
            default :throw new Error('The type=' + type + 'does not exist in default pattens');
        }
    }

    static #character(chara){
        //add param later
        //let chara = new Character()
        return {
            chara_id: chara.chara_id,
            name: chara.name,
            nickname: chara.nickname,
            filename: chara.filename,
            person_id: chara.person_id ??'',
            sub_person_id: chara.sub_person_id ??'',

            class_id: chara.class_id,
            change_class_id1: chara?.change_class_id1 ??'',
            change_class_id2: chara?.change_class_id2 ??'',

            element_id: chara.element_id,
            is_change_element: chara.is_change_element,
            rarity: chara.rarity,
            tag_des: chara.tag_des.join('\n'),

            trait0: chara?.traits_des?.trait0.join('\n') ??'',
            trait1: chara.traits_des.trait1.join('\n'),
            trait2: chara.traits_des.trait2.join('\n'),
            trait3: chara.traits_des.trait3.join('\n'),

            team_skill_id: chara.team_skill_id,

            skill1_id: chara.skills[CharacterSkill.SkillNumber.SKILL_1].skill_id,
            skill2_id: chara.skills[CharacterSkill.SkillNumber.SKILL_2].skill_id,
            skill1s_id: chara.skills[CharacterSkill.SkillNumber.SKILL_1S]?.skill_id ??'',
            skill2s_id: chara.skills[CharacterSkill.SkillNumber.SKILL_2S]?.skill_id ??'',
        }
    }
    static #skill(skill){
        //add param later
        //let skill = new CharacterSkill()
        return {
            skill_id:   skill.skill_id,
            name:       skill.name,
            cooldown:   skill.cooldown,
            detail:     skill.detail,
            filename:   skill.filename,

            skill_number:   skill.skill_number,
            range:          skill.range,
            active_type:    skill.active_type,
            special_effect: skill.special_effect.join('\n'),
        }
    }
    static #medal(medal){
        //medal = new Medal();
        return {
            medal_id:   medal.medal_id,
            name:       medal.name,
            is_event:   medal.is_event,
            icon_name:  medal.icon_name,
            type:       medal.type,
            unique_trait: medal.unique_trait_des,
            tag_names:    medal.tag_names.join('\n') || '',
        }
    }
    static #character_profile(profile){
        //profile = new CharacterInfo()
        return {
            profile_id:         profile.profile_id,
            birthday:           profile.birthday,
            age:                profile.age,
            height:             profile.height,
            place_of_origin:    profile.place_of_origin,
            va :                profile.va,
        }
    }
}