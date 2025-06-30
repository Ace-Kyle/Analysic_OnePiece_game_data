class CustomAffectTypeManager {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        //this.data = data;
        //convert to array of objects
        this.data = this.data.map(item => {
            return new CustomAffectType(item);
        });
        this.isLoaded = true;
    }
}