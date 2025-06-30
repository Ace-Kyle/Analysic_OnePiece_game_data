class MedalAffectType {
    id;
    name;
    name_vi;
    type_ids; //array of "affect_type" (in Ability class) that this medal affect type belongs to

    getName(medal_affect_type, lang = CONFIG.default_language) {
        switch (lang) {
            case 'vi':
                return medal_affect_type.name_vi || 'Tên trống'; // Vietnamese
            default:
                return medal_affect_type.name || 'Empty name'; // English
        }
    }
    getId(medal_affect_type) {
        return medal_affect_type.id || 0; // Default to 0 if not specified
    }

    /**
     *
     * @param {MedalAffectType} medal_affect_type
     * @param {number } affect_type
     * @returns {boolean}
     */
    isIncludedInTypeIds(medal_affect_type, affect_type) {
        return medal_affect_type.type_ids.includes(affect_type);
    }

}