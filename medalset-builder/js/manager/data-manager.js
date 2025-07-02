import {ABILITY_MANAGER} from "./ability-manager.js";
import {MEDAL_MANAGER} from "./medal-manager.js";
import {MEDAL_TAG_MANAGER} from "./medal-tag-manager.js";
import {MEDAL_AFFECT_TYPE} from "./medal-affect-type.js";
import {MEDAL_ABILITY_AFFECT_LIMIT} from "./medal-ability-affect-limit.js";

import {CONFIG} from "../util/Config.js";

class DataManager {

    constructor() {
        this.data = [];
        this.isLoaded = false;
    }
    static DATA_TYPE = Object.freeze({
        MEDAL: 'medal',
        MEDAL_AFFECT_TYPE: 'medal_affect_type',
        MEDAL_TAG: 'medal_tag',
        MEDAL_ABILITY_AFFECT_LIMIT: 'medal_ability_affect_limit',
        ABILITY: 'ability',
    })

    // Load data at first time, setup
    initEachDetailData() {
        ABILITY_MANAGER     .setData(this.getDataByType(DataManager.DATA_TYPE.ABILITY));
        MEDAL_TAG_MANAGER   .setData(this.getDataByType(DataManager.DATA_TYPE.MEDAL_TAG));
        MEDAL_MANAGER       .setData(this.getDataByType(DataManager.DATA_TYPE.MEDAL));
        MEDAL_AFFECT_TYPE   .setData(this.getDataByType(DataManager.DATA_TYPE.MEDAL_AFFECT_TYPE));
        MEDAL_ABILITY_AFFECT_LIMIT.setData(this.getDataByType(DataManager.DATA_TYPE.MEDAL_ABILITY_AFFECT_LIMIT));
        console.log('[DataManager] Initialized each detail data successfully');

    }
    /**
     * Load data from a JSON file and set it to each instance, set up the data manager (asynchronously)
     */
    async loadData() {
        try {
            const response = await fetch(CONFIG.data_json_path);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.setData(data);

            // Initialize each detail data if needed
            this.initEachDetailData()

            console.log(`Loaded data and set each list successfully`);
            return data;

        } catch (error) {
            console.error('Error loading data:', error);
            this.showErrorMessage('Failed to load data. Please check if data.json exists.');
            return null;
        }
    }
    /**
     * Load data from a JSON file and set it to each instance, set up the data manager (synchronously)
     * For testing purpose
     */
    loadDataSync() {
        // Remove reference to non-existent ReadFromJson
        console.error('[DataManager] Synchronous loading not available in web environment. Use loadData() instead.');
        return null;
    }

    setData(data) {
        this.data = data;
        this.isLoaded = true;
    }

    /**
     * Get data by type
     * @param {string} type - Type of data to get
     * @return {Array} Array of data objects of the specified type
     */
    getDataByType(type) {
        if (!this.isLoaded) {
            console.warn('[DataManager] Data not loaded yet. Please call loadData() first.');
            return [];
        }
        return this.data[type] || [];
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
}
export const DATA_MANAGER = new DataManager();