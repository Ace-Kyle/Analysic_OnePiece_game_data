import Subject from "./Subject.js";
import {MEDAL_MANAGER} from "../manager/medal-manager.js";
import {MEDAL_INSTANCE} from "./medal.js";
import {Utils2} from "../util/utils2.js";
import {MEDAL_TAG_MANAGER} from "../manager/medal-tag-manager.js";
import {MEDAL_TAG_INSTANCE} from "./medal-tag.js";

export default class MedalSet extends Subject{
    constructor() {
        super();
        this.currentSet = [null, null, null];

        this.tags = new Map();      // Map<tag_id, count>
        this.abilities = new Map(); // Map<ability_id, count>
    }

    /**
     * Replace/add medal in the current set
     * @param {number|Medal} medal_id
     * @param {number} position
     */
    addMedal(medal_id, position){
        this.validatePosition(position)
        this.currentSet[position] = medal_id;
        this.medalSetChanged() // Notify observers about the change
    }
    removeMedalAt(position) {
        this.validatePosition(position)
        this.currentSet[position] = null;
        this.medalSetChanged() // Notify observers about the change
    }

    /**
     * Get medal at a specific position in the current set
     * @param {number} position
     * @returns {Medal}
     */
    getMedalAt(position) {
        this.validatePosition(position)
        return this.currentSet[position];
    }
    validatePosition(position) {
        if(!(position >= 0 && position <= 2)) {
            console.error("The medal position is out of bounds. It must be from 0 - 2");
            return false;
        }
        return true;
    }

    /**
     * Get unique traits from the current set of medals event if there are duplicates.
     * @returns {Map<number, number>} Map of ability_id and count Map<ability_id, count>
     */
    getAbilityFromUniqueTraits() {
        let list = new Map();
        let medal;
        this.currentSet.forEach(medal_id => {
            medal = MEDAL_MANAGER.getMedalById(medal_id);
            if(medal) {
                let ability_id = MEDAL_INSTANCE.getUniqueTraitId(medal);
                list.set(
                    ability_id,                      // Use trait_id as key
                    (list.get(ability_id) ?? 0) + 1) // Increment count for this trait_id
            }

        })
        return list;
    }

    /**
     * Get all tags from the current set of medals. Only add tags from unique medals.
     * @returns {Map<number, number>}
     */
    getTags() {
        let list = new Map();
        let medal;
        //only add tags from unique medals
        let uniqueMedals = new Set(this.currentSet.filter(medal => medal !== null));

        uniqueMedals.forEach(medal_id => {
            medal = MEDAL_MANAGER.getMedalById(medal_id);
            if(medal) {
                let tag_ids = MEDAL_INSTANCE.getListTagIds(medal); //array of tag IDs

                // Iterate through each tag_id and update the count in the list
                tag_ids.forEach( tag_id => {
                    list.set(
                        tag_id,                      // Use tag_id as key
                        (list.get(tag_id) ?? 0) + 1) // Increment count for this tag_id
                })

            }
        })
        return list;
    }
    /**
     * Get active tags from the current set. Active tags are those that appear at least twice.
     * @returns {Map} Map of tag_id and count
     */
    getActiveTags() {
        let activeTags = structuredClone(this.tags); //deep clone the tags map
        activeTags.forEach((count, tag_id) => {
            if(count < 2) {
                activeTags.delete(tag_id);
            }
        })
        return activeTags;
    }

    /**
     * Set ability for active medal tags base on their count.
     * @returns {Map<number, number>} Map of ability_id and count Map<ability_id, count>
     */
    getAbilityFromActiveMedalTags() {
        let abilityFromTags = new Map();
        const activeTags = this.getActiveTags();

        //console.log('>>Begin collecting abilities from active tags:', activeTags.size);

        activeTags.forEach((count, tag_id) => {
            let medalTag = MEDAL_TAG_MANAGER.getMedalTagById(tag_id);
            let ability_id = 0;
            if(medalTag) {

                //console.log('- Found tag:', medalTag);

                ability_id = MEDAL_TAG_INSTANCE.getAbilityBasedOnTagCount(medalTag, count);
                if (ability_id) {
                    abilityFromTags.set(
                        ability_id,                                // Use tag_id as key
                        (abilityFromTags.get(ability_id) ?? 0) + 1 // Increment count for this ability_id
                    );
                } else {
                    console.warn(`ability_id=${ability_id} does not have an associated ability for count ${count}.`);
                }
            } else {
                console.warn(`Medal tag with ID ${tag_id} is not suitable.`);
            }
        })

        return abilityFromTags;
    }

    medalSetChanged() {
        // This method should be called when the medal set is changed
        // It will update the tags and abilities based on the current set of medals
        this.tags = this.getTags();

        //combine abilities from unique traits and active tags
        this.abilities = this.collectAllAbilities();

        this.notifyObservers(); // Notify observers about the change
    }

    /**
     * Collect all abilities from the current set of medals (from unique traits and active tags).
     * @returns {Map<number, number>} Map of ability_id and count Map<ability_id, count>
     */
    collectAllAbilities() {
        // Collect all abilities from the current set of medals
        return Utils2.merge2Maps(
            this.getAbilityFromUniqueTraits(),
            this.getAbilityFromActiveMedalTags());
    }

    //support Observer pattern
    notifyObservers() {
        // Notify observers about the change in the medal set
        // This method should be implemented in a subclass or by the observer pattern
        super.notifyObservers(this)
        console.log("Medal set updated: ->", this.currentSet.toString());
    }
    show() {
        return `MedalSet: [${this.currentSet
            .map(medal_id => {
                if (medal_id === null) return 'null';
                let medal = MEDAL_MANAGER.getMedalById(medal_id);
                //console.log(`Found medal with ID=${medal_id}: `, medal);
                return medal ? MEDAL_INSTANCE.getName(medal) : `Unknown(${medal_id})`;
            })
            .join(', ')}]`;
    }

    getAbilityOfCurrentSet() {
        return this.abilities;
    }
    getTagOfCurrentSet() {
        return this.tags;
    }
}