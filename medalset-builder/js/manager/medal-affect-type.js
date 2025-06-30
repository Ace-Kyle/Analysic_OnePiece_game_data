class MedalAffectType {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }
}

const MEDAL_AFFECT_TYPE = new MedalAffectType();