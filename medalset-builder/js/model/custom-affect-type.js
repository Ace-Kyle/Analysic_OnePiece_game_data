class CustomAffectType {
    Type = Object.freeze({
        SKILL1: 'skill1',
        SKILL2: 'skill2',
        DODGE: 'dodge',
        CAPTURE_SPEED: 'capture_speed',
        INCREASE_DAMAGE: 'increase_damage',
        DECREASE_DAMAGE: 'decrease_damage',
        OTHERS: 'others',
    });

    constructor(data = {}) {
        this.id         = data.id || 0;
        this.sort_id    = data.sort_id || 0;
        this.name       = data.name || '';
        this.name_vi    = data.name_vi || '';
        this.category_ids = data.category_ids || []; // Array of category IDs that this custom affect type belongs to
    }


    getName(language = CONFIG.default_language) {
        // Return the name of the custom affect type based on the language
        switch (language) {
            case 'vi':
                return this.name_vi || 'Tên trống'; // Vietnamese
            default:
                return this.name || 'Empty name'; // English
        }
    }
    isBelongToThisType(categoryId) {
        // Check if the given category ID is included in the category IDs of this custom affect type
        return this.category_ids.includes(categoryId);
    }
}