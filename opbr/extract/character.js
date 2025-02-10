import {JSON_DATA_TMP} from "../data/read_from_json.js";
import CharacterSkill from "./character_skill.js";

export default class Character {
    static #NOT_FOUND_DATA = "NOT_FOUND"
    static Rarity = Object.freeze({
        EX:'EX',
        BF:'BF',
        STEPUP:'Step-Up',
    })

    chara_data = {}
    chara_id
    name; nickname;
    filename;
    is_double_chara=false;
    is_playable=false;

    class_id; class_name;
    change_class_id1; change_class_id2;

    element_id; element_name; is_change_element;
    tag_ids = []
    tag_des = []

    trait_ids = {
        trait0: -1,
        trait1: -1,
        trait2: -1,
        trait3: -1,
    }
    //trait3 is "boost trait"
    traits_des = {
        trait0: [],
        trait1: [],
        trait2: [],
        trait3: [],
    }
    skills = {}
    team_skill_id;
    rarity;

    constructor(chara_id) {
        //check if found character
        let chara = this.getCharaById(chara_id);
        this.chara_data = chara;
        if (chara) {
            this.is_playable = Character.isPlayableCharacter(this.chara_data)
            this.chara_id = chara_id
            this.name = chara['name']
            this.nickname = chara['nickname']
            this.filename = chara['filename']
            this.person_id = chara['person_id']?? null
            this.sub_person_id = chara['sub_person_id']?? null
            this.is_double_chara = this.isDoubleCharacter()

            this.class_id = chara['role_id']
            this.change_class_id1 = this.getChangeClass1()
            this.change_class_id2 = this.getChangeClass2()

            this.element_id = chara['class_id']
            this.class_name = this.getClassOf(this.chara_id)
            this.element_name = this.getElementOf(this.chara_id)
            this.is_change_element = this.isChangeElement();

            this.tag_ids = chara['tag_ids']
            this.tag_des = this.getTagDescription()

            this.trait_ids = this.getListTraitId(chara)
            this.traits_des = this.getTraits()
            this.skills = this.getListSkill(chara)
            this.team_skill_id = chara['team_skill_id']
            this.rarity = this.getRarityOf()

        }

    }
    getRarityOf(){
        if (this.team_skill_id > 110) return Character.Rarity.EX //EX: team_skill_id 111-114
        if (Object.hasOwn(this.chara_data,'is_legend')) return Character.Rarity.BF //BF
        return Character.Rarity.STEPUP //Step-Up
    }
    getClassOf(){
        //from [chara_role] table
        const CLASSES = JSON_DATA_TMP["chara_role"]
        let classType
        for(let classInfo of CLASSES){
            if (classInfo["role_id"] === this.class_id) classType = classInfo["name"]
        }
        return classType.replaceAll('(s)','') || this.#NOT_FOUND_DATA
    }
    getElementOf(){
        //from [chara_class] table
        const ELEMENTS = JSON_DATA_TMP["chara_class"]
        let elementType
        for(let elementInfo of ELEMENTS){
            if (elementInfo["class_id"] === this.element_id) elementType = elementInfo["name"]
        }
        return elementType || this.#NOT_FOUND_DATA
    }
    getTagDescription(){
        //from [chara_tag] table
        const TAGS = JSON_DATA_TMP["chara_tag"]
        let tags = []
        let ids = this.tag_ids;
        let tagId, found = 0

        for(let tag of TAGS){
            if (found >= ids.length) break;//exit when all tags have been found
                tagId = tag["chara_tag_id"]
            if (ids.includes(tagId)){
                tags.push(tag["name"])
                found++
            }
        }
        if(found ===0) console.warn('Complete getTagDescription() with no tags at start')
        return tags
    }
    getTraits(){

        const TRAITS = JSON_DATA_TMP["ability"]
        let traits = {
            trait0:[],
            trait1:[],
            trait2:[],
            trait3:[],
        }
        let ability_id = -1, found = 0

        for (let trait of TRAITS){
            if (found === Object.keys(traits).length) break;

            //check if equal id
            ability_id = trait['ability_id']
            if(ability_id !== undefined && Object.values(this.trait_ids).includes(ability_id)){

                let description = this.traitDescriptionOf(trait)
                found++
                switch (ability_id){
                    case this.trait_ids.trait0: traits.trait0 = description; break;
                    case this.trait_ids.trait1: traits.trait1 = description; break;
                    case this.trait_ids.trait2: traits.trait2 = description; break;
                    case this.trait_ids.trait3: traits.trait3 = description; break;
                    default: console.error('Cannot found trait with id: ' + ability_id)
                }
            }
        }
        return traits
    }
    traitDescriptionOf(trait){
        let description = []
        for (let des of trait["affects"]){
            description.push(des["detail"])
        }
        return description
    }
    getListTraitId(chara){
        let traits = {}
        //NOTE: use [abillity] instead of [ability]
        traits.trait0 = chara['abillity0_id'] || -1
        traits.trait1 = chara['abillity1_id'] || -1
        traits.trait2 = chara['abillity2_id'] || -1
        traits.trait3 = chara['potential_ability_id2'] || -1

        return traits
    }
    getCharaById(id){
        //from [charas] table
        const CHARAS = JSON_DATA_TMP["charas"]
        for(let chara of CHARAS){
            if (chara["chara_id"] === id) return chara
        }
        throw new Error(`Not found characters with id=${id}`)
    }

    checkNullData(data){if(data === undefined) throw new Error("Null data from JSON file")}
    getListSkill(chara){
        let list = {}, id;
        let list_ids = CharacterSkill.getListSkillIds(chara, this.is_double_chara)

        for (let skill_num in list_ids){
            if ((id = list_ids[skill_num]) > 0) {
                list[skill_num] = new CharacterSkill(id, skill_num)
            }else{
                throw new Error(`Invalid skill_id=${id}`)
            }
        }

        /*let skill1_id = CharacterSkill.getFromChara_skill_1(chara)
        let skill2_id = CharacterSkill.getFromChara_skill_2(chara)
        let skill2s_id = CharacterSkill.getFromChara_skill_2s(chara)
        let skill3_id = CharacterSkill.getFromChara_skill_3(chara)

        if (skill1_id){list.skill_1 = new CharacterSkill(skill1_id, CharacterSkill.SkillNumber.SKILL_1)}
        if (skill2_id){list.skill_2 = new CharacterSkill(skill2_id, CharacterSkill.SkillNumber.SKILL_2)}
        if (skill2s_id){list.skill_2s = new CharacterSkill(skill2s_id, CharacterSkill.SkillNumber.SKILL_2S)}
        if (skill3_id){list.skill_3 = new CharacterSkill(skill3_id, CharacterSkill.SkillNumber.SKILL_3)}*/

        return list;
    }
    isPlayableCharacterWithSkill(){
        //except BOSS characters
        if (!Character.isPlayableCharacter(this.chara_data)) return false;
        for(let skill of Object.values(this.skills)){
            if (!skill.is_valid) return false;
        }
        return true;
    }
    static isPlayableCharacter(chara){
        return !(chara.name === '???' || chara.chara_id > 400007000 || Object.hasOwn(chara, 'chara_type')
        || (Object.hasOwn(chara, 'character_info') && chara['character_info'] >=1))
    }
    isChangeElement(){ return Object.hasOwn(this.chara_data, 'is_change_class')}
    getChangeClass1(){
        return Object.hasOwn(this.chara_data,'change_role_id1')? this.chara_data['change_role_id1'] : null;
    }
    getChangeClass2(){
        return Object.hasOwn(this.chara_data,'change_role_id2')? this.chara_data['change_role_id2'] : null;
    }
    isDoubleCharacter(){
        return (
            Object.hasOwn(this.chara_data,'change_modelname') &&
            Object.hasOwn(this.chara_data,'sub_person_id')
        )
    }

    static getCharaIdFrom(chara){ return chara['chara_id']}
}
//test
let FIND_CHARA_ID = 400000581
console.log(new Character(FIND_CHARA_ID).getRarityOf())
