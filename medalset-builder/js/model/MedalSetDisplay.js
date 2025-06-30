class MedalSetDisplay extends Observer {

    //use Observer pattern
    constructor(medalSet) {
        super();
        //Data to display
        this.listTagName = new Map(); // Map<tag_name, count>
        this.listAbility = new Map();

        //Observer pattern implementation
        this.medalSet = medalSet;
        this.medalSet.addObserver(this);
    }

    /**
     * Update the display with the current state of the MedalSet.
     * Implement Observer pattern.
     * @param {MedalSet} data - The MedalSet instance to display
     */
    update(data) {
        this.medalSet = data;
        //Update the display with the new data
        this.updateTagNames()
        this.updateAbilityDescriptions()
    }

    /**
     * When the medal set is updated, update the tag names
     * @return {Map<string, number>} Map of tag names and their counts Map<tag_name, count>
     */
    updateTagNames() {
        // Return a Map of tag names
        if (this.medalSet) {
            this.medalSet.getTags().forEach((count, tagId) => {
                let tag = MEDAL_TAG_MANAGER.getMedalTagById(tagId)
                if (tag) {
                    this.listTagName.set(tag.getName(), count);
                }
            });
        }
        return this.listTagName;
    }

    updateAbilityDescriptions() {

        // Populate ability descriptions based on active tags
        //TODO: Implement this method to update ability descriptions based on the current medal set
    }

    getDisplayDescription() {
        let partDescription;

    }

    //for debug
    print() {
        let result =  {
            'Medals': `[${this.medalSet ? this.medalSet.toString() : 'null'}]`,
            'Tag Names': `[${Array.from(this.listTagName.entries()).map(([name, count]) => `${name}: ${count}`).join(',\n ')}]`,
        };
        console.table(result)
    }


}
