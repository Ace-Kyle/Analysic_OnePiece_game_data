class MedalTagManager {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }

    /**
     * Get medal tag by ID
     * @returns {MedalTag|null}
     * @param medal_tag_id
     */
    getMedalTagById(medal_tag_id) {
        if (!this.isLoaded) {
            console.warn('[MedalTagManager] Data not loaded yet. Please call loadData() first.');
            return null;
        }
        return this.data.find(tag => tag.medal_tag_id === medal_tag_id) || null;
    }

    getListOfMedalTags() {
        if (!this.isLoaded) {
            console.warn('[MedalTagManager] Data not loaded yet. Please call loadData() first.');
            return [];
        }
        return this.data.map(tag => {
            return {
                medal_tag_id: tag.medal_tag_id,
                name: tag.name
            };
        });
    }

}

export const MEDAL_TAG_MANAGER = new MedalTagManager();