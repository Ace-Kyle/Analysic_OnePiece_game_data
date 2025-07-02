/**
 * Medal Data Loader
 * Handles loading and managing medal data from JSON file
 */
import { CONFIG } from '../util/Config.js';
import {MEDAL_INSTANCE} from "../model/medal.js";

class MedalManager {
    constructor() {
        this.data = [];
        this.isLoaded = false;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }

    /**
     * Load medal data from JSON file
     * @returns {Promise<Array>} Array of medal objects
     */
    async loadDataFromJson() {
        try {
            const response = await fetch(CONFIG.data_json_path);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();
            this.isLoaded = true;

            console.log(`Loaded ${this.data.length} medals successfully`);
            return this.data;

        } catch (error) {
            console.error('Error loading medal data:', error);
            this.showErrorMessage('Failed to load medal data. Please check if data.json exists.');
            return [];
        }
    }

    /**
     * Get all data
     * @returns {Array} Array of all data
     */
    getAllMedals() {
        return this.data;
    }

    /**
     * Get medal by ID
     * @param {string|number|null} id - Medal ID
     * @returns {Object|null} Medal object or null if not found
     */
    getMedalById(id) {
        //console.log(`Searching for medal with ID: [${id}] in [${this.data.length}] medals`);
        return this.data.find(medal => medal.medal_id == id) || null;
    }

    /**
     * Search data by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered array of data
     */
    searchMedals(query) {
        if (!query || query.trim() === '') {
            return this.data;
        }

        const searchTerm = query.toLowerCase().trim();

        return this.data.filter(medal => {
            const name = (medal.name || '').toLowerCase();
            const description = (medal.detail || '').toLowerCase();
            const affects = (medal.affects || '').toLowerCase();

            return name.includes(searchTerm) ||
                description.includes(searchTerm) ||
                affects.includes(searchTerm);
        });
    }

    /**
     * Filter data by specific criteria
     * @param {{type: (*|string), tag: (*|string), search: (*|string)}} filterFn - Filter function
     * @returns {Array} Filtered array of data
     */
    filterMedals(filterFn) {
        const { type, tag, search } = filterFn;
        return this.data.filter(medal => {
            const filterType = (type.length === 0) || MEDAL_INSTANCE.getMedalType(medal) === type;
            const tagIdNeedToFilter = parseInt(tag, 10) ?? 0;
            const filterTag = (tagIdNeedToFilter !== 0) && MEDAL_INSTANCE.getListTagIds(medal).includes(tagIdNeedToFilter);
            return filterType && filterTag;
        });
    }


    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        const container = document.getElementById('medal-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Validate medal data structure
     * @param {Array} medals - Array of medal objects
     * @returns {boolean} True if valid
     */
    validateMedalData(medals) {
        if (!Array.isArray(medals)) {
            console.error('Medal data should be an array');
            return false;
        }

        const requiredFields = ['id', 'name'];

        for (let i = 0; i < medals.length; i++) {
            const medal = medals[i];

            for (const field of requiredFields) {
                if (!medal.hasOwnProperty(field)) {
                    console.error(`Medal at index ${i} missing required field: ${field}`);
                    return false;
                }
            }
        }

        return true;
    }
}

// Create global instance
export const MEDAL_MANAGER = new MedalManager();
