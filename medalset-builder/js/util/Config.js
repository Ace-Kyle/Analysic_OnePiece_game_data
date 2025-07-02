class Config {
    medal_image_path = './images/medals/'
    data_json_path = '../data/data.json'
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

}
export const CONFIG = new Config();