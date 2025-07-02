class Config {
    medal_image_path = '../images/medals/'
    data_json_path = './data/data.json'  // Fixed path for web
    default_language = 'en'
    support_languages = ['en', 'vi']

    static LANGUAGE = Object.freeze({
        ENGLISH: 'en',
        VIETNAMESE: 'vi',
    });

    set defaultLanguage(lang) {
        if (this.support_languages.includes(lang)) {
            this.default_language = lang;
        } else {
            console.warn(`Language ${lang} is not supported. Defaulting to 'en'.`);
            this.default_language = 'en';
        }
    }

    // Add web-specific configurations
    static UI_CONFIG = Object.freeze({
        MAX_MEDAL_SLOTS: 3,
        SEARCH_DEBOUNCE_MS: 300,
        ANIMATION_DURATION: 300,
        MODAL_FADE_DURATION: 200
    });
}

export const CONFIG = new Config();