import JSON_DATA from "../data/json_data.js";

//trait of medal, character; tag_effect of medal
export default class Ability {
    ability_id
    affects = {
        affect_type: -1,
        detail: [],
    }
    constructor(ability_id, isGetAffectsNow=true){
        this.ability_id = ability_id;
        this.affects = isGetAffectsNow? Ability.#findInstanceOf(this.ability_id):[]
    }


    getDetails(){
        return this.affects.map((trait) => trait.detail)
    }

    //iterate through array of ability and return found one
    static #findInstanceOf(ability_id){
        //found in "ability" object
        const TRAITS = JSON_DATA.listOf(JSON_DATA.TYPE.ABILITY)
        let traits = []
        //let found = 0

        for (let trait of TRAITS){
            if (trait['ability_id'] === ability_id){
                traits = this.getInstanceOf(trait).affects
                break;
            }
        }
        return traits
    }
    // get Ability object of found trait instead of iterating all array of object again
    static getInstanceOf(foundTraitObject){
        let effects = foundTraitObject['affects']

        let ability = new Ability(foundTraitObject.ability_id, false)
        ability.affects = effects.map(effect => ({
            affect_type: effect['affect_type'],
            detail: effect['detail'],
        }))

        return ability
    }

    /**
     *
     * @param trait_ids Character.trait_ids
     * @returns {{trait0: *[], trait1: *[], trait2: *[], trait3: *[]}}
     */
    static getTraitDescriptionFor(trait_ids){
        const TRAITS = JSON_DATA.listOf(JSON_DATA.TYPE.ABILITY)
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
            if(ability_id !== undefined && Object.values(trait_ids).includes(ability_id)){

                let description = this.getInstanceOf(trait).getDetails()
                found++
                switch (ability_id){
                    case trait_ids.trait0: traits.trait0 = description; break;
                    case trait_ids.trait1: traits.trait1 = description; break;
                    case trait_ids.trait2: traits.trait2 = description; break;
                    case trait_ids.trait3: traits.trait3 = description; break;
                    default: console.error('Cannot found trait with id: ' + ability_id)
                }
            }
        }
        return traits
    }

}

//test
//console.log(new Ability(93702))