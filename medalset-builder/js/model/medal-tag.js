import {CONFIG} from "../util/Config.js";

export default class MedalTag {
    /**
     * Represents a medal tag.
     * @param {Object} medal_tag - The medal tag data.
     * @param {number} medal_tag.medal_tag_id - The unique ID of the medal tag.
     * @param {string} [medal_tag.name] - The name of the medal tag.
     * @param {string} [medal_tag.name_vi] - The Vietnamese name of the medal tag.
     * @param {number} [medal_tag.tag_category] - The category of the medal tag.
     * @param {number} [medal_tag.sort_id] - The sort order of the medal tag.
     * @param {number|null} [medal_tag.set2_ability_id] - The ability ID for pair affects, if any.
     * @param {number|null} [medal_tag.set3_ability_id] - The ability ID for trio affects, if any.
     */
    constructor(medal_tag = {}) {
        this.medal_tag_id = medal_tag.medal_tag_id;
        this.name = medal_tag.name ?? '';
        this.name_vi = medal_tag.name_vi ?? '';
        this.tag_category = medal_tag.tag_category ?? 0; //default to 0 if not provided
        this.sort_id = medal_tag.sort_id ?? 0;
        this.set2_ability_id = medal_tag.set2_ability_id ?? null; //pair affect
        this.set3_ability_id = medal_tag.set3_ability_id ?? null; //trio affect
    }

    getPairAbility(medalTag) {
        return medalTag.set2_ability_id;
    }
    getTrioAbility(medalTag) {
        return medalTag.set3_ability_id;
    }

    /**
     * Get the ability based on the number of unique medals having this tag.
     * @param {Object} medalTag
     * @param {number} count - The number of unique medals with this tag.
     * @returns {number|null}
     */
    getAbilityBasedOnTagCount(medalTag, count) {
        switch (count) {
            case 2: // Pair
                return this.getPairAbility(medalTag);
            case 3: // Trio
                return this.getTrioAbility(medalTag);
            default:
                return null; // No ability for other categories
        }
    }

    getName(medalTag, language = CONFIG.default_language) {
        return medalTag.name || 'Empty name'; // English
        /*switch (language) {
            case 'vi':
                return medalTag.name_vi || 'Tên trống'; // Vietnamese
            default:
                return medalTag.name || 'Empty name'; // English
        }*/
    }
}
export const MEDAL_TAG_INSTANCE = new MedalTag();