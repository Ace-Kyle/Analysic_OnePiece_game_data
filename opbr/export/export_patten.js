import Character from "../modal/character/character.js";
import CharacterSkill from "../modal/character/character_skill.js";
import Medal from "../modal/medal/medal.js";
import CharacterInfo from "../modal/character/character_info.js";
import Helper from "../help/helper.js";
import MedalSet from "../modal/medal/medal_set.js";

export default class ExportPatten {
    static Patten = Object.freeze({
        CHARACTER: 'chara',
        SKILL: 'chara_skill',
        MEDAL: 'medal',
        MEDAL_SET: 'medal_set',
        PROFILE: 'detail_profile',

        CHARACTER_RANKING: 'character_ranking',
    })
    static of(data, type){
        switch (type){
            case this.Patten.CHARACTER: return this.#character(data);
            case this.Patten.SKILL:     return this.#skill(data);
            case this.Patten.MEDAL:     return this.#medal(data);
            case this.Patten.MEDAL_SET: return this.#medal_set(data);
            case this.Patten.PROFILE:   return this.#character_profile(data);
            case this.Patten.CHARACTER_RANKING: return this.#character_ranking(data);
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
            tag_des: Helper.formatArrayAsMarkdownList(chara.tag_des),

            trait0: Helper.formatArrayAsMarkdownList(chara?.traits_des?.trait0 ??[]),
            trait1: Helper.formatArrayAsMarkdownList(chara.traits_des.trait1),
            trait2: Helper.formatArrayAsMarkdownList(chara.traits_des.trait2),
            trait3: Helper.formatArrayAsMarkdownList(chara.traits_des.trait3),

            team_skill_id: chara.team_skill_id,

            skill1_id: chara.skills[CharacterSkill.SkillNumber.SKILL_1].skill_id,
            skill2_id: chara.skills[CharacterSkill.SkillNumber.SKILL_2].skill_id,
            skill1s_id: chara.skills[CharacterSkill.SkillNumber.SKILL_1S]?.skill_id ??'',
            skill2s_id: chara.skills[CharacterSkill.SkillNumber.SKILL_2S]?.skill_id ??'',
        }
    }
    static #character_ranking(chara){
        //add param later
        //let chara = new Character()
        return {
            chara_id: chara.chara_id,
            name: chara.name,
            nickname: chara.nickname,
            filename: chara.filename,
            class_name: chara.class_name,
            element_name: chara.element_name,
            rarity: chara.rarity,
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
            special_effect: Helper.formatArrayAsMarkdownList(skill.special_effect),
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
            tag_names:    Helper.formatArrayAsMarkdownList(medal.tag_names),
        }
    }
    static #medal_set(medal_set){
        //medal_set = new MedalSet(1, 2, 3)
        return {
            medal1_id: medal_set.medal1.medal_id,
            medal2_id: medal_set.medal2.medal_id,
            medal3_id: medal_set.medal3.medal_id,
            effect_extra: medal_set.effect_extra,
            effect_tag: medal_set.effect_tag_des,
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