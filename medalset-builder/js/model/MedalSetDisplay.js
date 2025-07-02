import {ABILITY_MANAGER} from "../manager/ability-manager.js";
import {MEDAL_TAG_MANAGER} from "../manager/medal-tag-manager.js";
import {ABILITY_INSTANCE} from "./ability.js";
import Observer from "./Observer.js";
import {MEDAL_TAG_INSTANCE} from "./medal-tag.js";

export default class MedalSetDisplay extends Observer {

    /**
     * use Observer pattern
     * @param {MedalSet} medalSet
     */
    constructor(medalSet) {
        super();
        //Data to display
        this.listTagName = new Map(); // Map<tag_name, count>
        this.listAbility = new Map(); // Map<ability_id, count>

        //Observer pattern implementation
        this.medalSet = medalSet;
        this.medalSet.addObserver(this);
    }

    /**
     * Update the display with the current state of the MedalSet.
     * Implement Observer pattern.
     * @param {MedalSet} newMedalSetState - The MedalSet instance to display.
     */
    update(newMedalSetState) {
        this.medalSet = newMedalSetState;
        //Update the display with the new data
        this.updateTagNames()
        this.updateAbility()
    }

    /**
     * When the medal set is updated, update the tag names
     * @return {Map<string, number>} Map of tag names and their counts Map<tag_name, count>
     */
    updateTagNames() {
        // Clear the previous tag names
        this.listTagName.clear();

        if (this.medalSet) {
            this.medalSet.getTags().forEach((count, tagId) => {
                let tag = MEDAL_TAG_MANAGER.getMedalTagById(tagId)
                if (tag) {
                    this.listTagName.set(MEDAL_TAG_INSTANCE.getName(tag), count);
                }
            });
        }
        return this.listTagName;
    }

    updateAbility(){
        // Return a Map of ability descriptions
        if (this.medalSet) {
            this.listAbility = this.medalSet.collectAllAbilities();
        }
        return this.listAbility;
    }

    getAbilityDescription() {
        //TODO: Implement this method to update ability descriptions based on the current medal set
        let descriptions = [];
        this.listAbility.forEach((count, abilityId) => {
            let ability = ABILITY_MANAGER.getAbilityById(abilityId);
            if (ability) {
                let des = {
                    'des': ABILITY_INSTANCE.getDescription(ability),
                    'count': count,
                    'id': abilityId,
                }
                descriptions.push(des)
            } else {
                console.warn(`Ability with ID ${abilityId} not found.`);
            }
        });
        return descriptions;
    }



    //for debug
    showCurrentSetInfo() {
        console.log('::Start displaying current MedalSet information::');
        let result =  {
            'Medals': `[${this.medalSet ? this.medalSet.show() : 'null'}]`,

            '- Tags: ': [...Array.from(this.listTagName)],
            '- Abilities: ': [...Array.from(this.getAbilityDescription())],
        };
        console.log(result)
    }
}
