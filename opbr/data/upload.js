const axios = require('axios');

class CharacterUploader {
    constructor(gasWebAppUrl) {
        this.gasWebAppUrl = gasWebAppUrl;
    }

    /**
     * Upload multiple characters to Google Sheets
     * @param {Array} characters - Array of character objects
     * @returns {Promise} Response from the Google Apps Script
     */
    async uploadCharacters(characters) {
        try {
            const response = await axios.post(this.gasWebAppUrl, {
                characters: characters
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Upload response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading characters:', error.message);
            throw error;
        }
    }
}

// Example usage
async function main() {
    const gasWebAppUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
    const uploader = new CharacterUploader(gasWebAppUrl);

    const characters = [
        {
            model_variation_names: [],
            modelname: "pl_roger_orig01",
            name: "Gol D. Roger",
            name_en: "Gol D. Roger",
            nickname: "King of the Pirates",
            person_id: 581,
            piece_id: 410000581
        }
        // Add more characters as needed
    ];

    try {
        const result = await uploader.uploadCharacters(characters);
        console.log('Upload completed:', result);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

// Run the example
main();