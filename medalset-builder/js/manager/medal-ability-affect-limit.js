class MedalAbilityAffectLimit {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }
}

export const MEDAL_ABILITY_AFFECT_LIMIT = new MedalAbilityAffectLimit();