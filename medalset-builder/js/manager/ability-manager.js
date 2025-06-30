class AbilityManager {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }

    /**
     * Get ability by ID
     * @param {string|number} id - Ability ID
     * @return {Object|null} Ability object or null if not found
     */
    getAbilityById(id) {
        if (!this.isLoaded) {
            console.warn('Data not loaded yet. Please call loadData() first.');
            return null;
        }
        return this.data.find(ability => ability.ability_id === id) || null;
    }

    getAbilityDescriptionById(id){
        const ability = this.getAbilityById(id);
        if (ability) {
            return ABILITY_INSTANCE.getDescription(ability);
        }
        return 'Ability not found';
    }
}

const ABILITY_MANAGER = new AbilityManager();