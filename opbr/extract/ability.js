import {JSON_DATA_TMP} from "../data/read_from_json.js";
import Local_JSON from "../data/local_JSON.js";

//trait of medal, character; tag_effect of medal
export default class Ability {
    ability_id
    detail
    constructor(ability_id){
        this.ability_id = ability_id;
        this.detail = Ability.getTraitOf(ability_id)
    }

    static getTraitOf(ability_id){
        //found in "ability" object
        const TRAITS = Local_JSON.listOf(Local_JSON.TYPE.ABILITY)
        let traits = []
        //let found = 0

        for (let trait of TRAITS){
            if (trait['ability_id'] === ability_id){
                let effects = trait['affects']
                for (let effect of effects){
                    traits.push(effect['detail'])
                }
                break;
            }
        }
        return traits
    }

}

//test
//console.log(new Ability(93702))