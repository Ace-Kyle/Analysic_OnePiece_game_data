class Medal{
    constructor() {
        this.medal_id = 0;
        this.name = '';
        this.is_event = false;
        this.icon_name = '';
        this.ability_id = null; // Unique trait ID
        this.tag_ids = []; // Array of tag IDs
    }


    static TYPE = Object.freeze({
        EVENT: 'event',
        COLORED: 'colored',
    })

    getImagePath(medal) {
        // Assume images are named by medal ID or have a specific pattern
        return `${CONFIG.medal_image_path}/${this.getImageName(medal)}.png`;
    }

    getImageName(medal) {
        // Return the image name based on medal ID
        return `img_icon_medal_${medal.medal_id}`;
    }

    getUniqueTraitId(medal) {
        // Return the unique trait (an instance of ability) of the medal
        return medal.ability_id;
    }
    getMedalType(medal) {
        // Determine the type of the medal
        if (medal.is_event) {
            return Medal.TYPE.EVENT;
        } else {
            return Medal.TYPE.COLORED;
        }
    }
    getListTagIds(medal) {
        return medal.tag_ids;
    }
}
const MEDAL_INSTANCE = new Medal();