export default class MedalAbilityAffectLimit {
    affect_type; // Unique id of the affect type
    affect_limit_msg;
    affect_limit_msg_vi;
    affect_limit;

    getAffectType() {
        return this.affect_type || 0; // Default to 0 if not specified
    }
    getAffectLimit() {
        return this.affect_limit || 0; // Default to 0 if not specified
    }
    getAffectLimitMessage(language = CONFIG.default_language) {
        switch (language) {
            case 'vi':
                return this.affect_limit_msg_vi || 'Mô tả trống'; // Vietnamese
            default:
                return this.affect_limit_msg || 'Empty description'; // English
        }
    }


}