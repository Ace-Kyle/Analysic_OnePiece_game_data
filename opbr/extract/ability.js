
import JSON_DATA from "../data/json_data.js";

//trait of medal, character; tag_effect of medal
export default class Ability {
    ability_id
    affects
    constructor(ability_id){
        this.ability_id = ability_id;
        this.affects = Ability.findInstanceOf(this.ability_id)

    }


    getDetails(){
        return this.affects.map((trait) => trait.detail)
    }
    static findInstanceOf(ability_id){
        //found in "ability" object
        const TRAITS = JSON_DATA.listOf(JSON_DATA.TYPE.ABILITY)
        let traits = [], usefulInfo
        //let found = 0

        for (let trait of TRAITS){
            if (trait['ability_id'] === ability_id){
                let effects = trait['affects']

                for (let effect of effects){
                    usefulInfo = {
                        affect_type: effect['affect_type'],
                        detail: effect['affects'],
                    }
                    traits.push(usefulInfo)
                }
                break;
            }
        }
        return traits
    }

}

//test
//console.log(new Ability(93702))