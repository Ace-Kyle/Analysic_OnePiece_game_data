/**
 * Medal Data Loader
 * Handles loading and managing medal data from JSON file
 */

class MedalLoader {
    constructor() {
        this.medals = [];
        this.isLoaded = false;
    }

    /**
     * Load medal data from JSON file
     * @returns {Promise<Array>} Array of medal objects
     */
    async loadMedals() {
        try {
            const response = await fetch('./data/data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.medals = data;
            this.isLoaded = true;

            console.log(`Loaded ${this.medals.length} medals successfully`);
            return this.medals;

        } catch (error) {
            console.error('Error loading medal data:', error);
            this.showErrorMessage('Failed to load medal data. Please check if data.json exists.');
            return [];
        }
    }

    /**
     * Get all medals
     * @returns {Array} Array of all medals
     */
    getAllMedals() {
        return this.medals;
    }

    /**
     * Get medal by ID
     * @param {string|number} id - Medal ID
     * @returns {Object|null} Medal object or null if not found
     */
    getMedalById(id) {
        return this.medals.find(medal => medal.id == id) || null;
    }

    /**
     * Search medals by name or description
     * @param {string} query - Search query
     * @returns {Array} Filtered array of medals
     */
    searchMedals(query) {
        if (!query || query.trim() === '') {
            return this.medals;
        }

        const searchTerm = query.toLowerCase().trim();

        return this.medals.filter(medal => {
            const name = (medal.name || '').toLowerCase();
            const description = (medal.description || '').toLowerCase();
            const affects = (medal.affects || '').toLowerCase();

            return name.includes(searchTerm) ||
                description.includes(searchTerm) ||
                affects.includes(searchTerm);
        });
    }

    /**
     * Filter medals by specific criteria
     * @param {Function} filterFn - Filter function
     * @returns {Array} Filtered array of medals
     */
    filterMedals(filterFn) {
        return this.medals.filter(filterFn);
    }

    /**
     * Get medal image path
     * @param {Object} medal - Medal object
     * @returns {string} Image path
     */
    getMedalImagePath(medal) {
        // Assume images are named by medal ID or have a specific pattern
        if (medal.image) {
            return `./images/medals/${medal.image}`;
        }

        // Fallback: try common image extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp'];
        const baseName = medal.id || medal.name?.toLowerCase().replace(/\s+/g, '-');

        // Return first possible path (you might want to add image existence checking)
        return `./images/medals/${baseName}.jpg`;
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
const medalLoader = new MedalLoader();