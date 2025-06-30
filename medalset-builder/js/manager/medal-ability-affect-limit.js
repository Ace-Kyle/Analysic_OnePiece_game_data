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

const MEDAL_ABILITY_AFFECT_LIMIT = new MedalAbilityAffectLimit();