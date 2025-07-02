import {CONFIG} from "../util/Config.js";

class Ability {
    // Define the structure of an ability
    ability_id;
    affect_type;
    affect_param1; affect_param2;
    detail; detail_vi;

    /**
     * get description of ability by language
     * returns {string} description of ability
     */
    getDescription(ability, language = CONFIG.default_language) {
        switch (language) {
            case 'vi':
                return ability.detail_vi ?? 'Mô tả trống'; //Vietnamese
            default:
                return ability.detail ?? 'Empty description'; //English
        }
    }

    getDescriptionTest(){
        return this.ability_id;
    }

    /**
     * @param ability
     * @returns {number}
     */
    getAffectType(ability) {
        return ability.affect_type || 0; // Default to 0 if not specified
    }

    /**
     * Get the first affect parameter of the ability
     * @param ability
     * @returns {number}
     */
    getAffectMeasure(ability) {
        return ability.affect_param1 || 0; // Default to 0 if not specified
    }
}
export const ABILITY_INSTANCE = new Ability();