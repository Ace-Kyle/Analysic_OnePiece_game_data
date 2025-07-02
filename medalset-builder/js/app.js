import { DATA_MANAGER } from './manager/data-manager.js';
import { UI_MANAGER } from './manager/ui-manager.js';
import { MEDAL_SET_MANAGER } from './manager/medal-set-manager.js';
import { MEDAL_MANAGER } from './manager/medal-manager.js';
import { CONFIG } from './util/Config.js';

/**
 * Main Medal Set Builder Application
 */
class MedalSetBuilderApp {
    constructor() {
        this.isInitialized = false;
        this.dataLoaded = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }

        console.log('🚀 Initializing Medal Set Builder...');

        try {
            // Show loading state
            this.showLoadingScreen();
            UI_MANAGER.showLoading();

            // Load data first
            await this.loadData();

            // Initialize UI
            this.initializeUI();

            // Display initial data
            this.displayInitialData();

            this.isInitialized = true;
            console.log('✅ Medal Set Builder initialized successfully');

            // Hide loading screen after successful initialization
            this.hideLoadingScreen();

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            UI_MANAGER.showError('Failed to initialize application. Please refresh the page.');
            this.hideLoadingScreen();
        }
    }

    /**
     * Show the loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide the loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Load all application data
     */
    async loadData() {
        console.log('📊 Loading application data...');

        try {
            // Load main data
            const data = await DATA_MANAGER.loadData();

            if (!data) {
                throw new Error('Failed to load data from JSON file');
            }

            this.dataLoaded = true;

            // Validate data
            this.validateData(data);

            console.log('✅ Data loaded successfully:', {
                medals: data.medal?.length || 0,
                abilities: data.ability?.length || 0,
                tags: data.medal_tag?.length || 0,
                affectTypes: data.medal_affect_type?.length || 0
            });

        } catch (error) {
            console.error('❌ Error loading data:', error);
            throw new Error(`Data loading failed: ${error.message}`);
        }
    }

    /**
     * Validate loaded data structure
     * @param {Object} data - Loaded data object
     */
    validateData(data) {
        const requiredTypes = ['medal', 'ability', 'medal_tag'];
        const missing = requiredTypes.filter(type => !data[type] || !Array.isArray(data[type]));

        if (missing.length > 0) {
            throw new Error(`Missing required data types: ${missing.join(', ')}`);
        }

        // Validate medal structure
        const medals = data.medal;
        if (medals.length === 0) {
            throw new Error('No medals found in data');
        }

        // Sample validation for first medal
        const firstMedal = medals[0];
        const requiredMedalFields = ['medal_id', 'name'];
        const missingFields = requiredMedalFields.filter(field => !(field in firstMedal));

        if (missingFields.length > 0) {
            console.warn(`Medal data missing fields: ${missingFields.join(', ')}`);
        }

        console.log('✅ Data validation passed');
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        console.log('🎨 Initializing UI components...');

        // Initialize UI Manager
        UI_MANAGER.init();

        // Populate filter dropdowns
        UI_MANAGER.populateFilters();

        // Set up medal set manager reference to data manager
        MEDAL_SET_MANAGER.dataManager = DATA_MANAGER;

        console.log('✅ UI components initialized');
    }

    /**
     * Display initial data
     */
    displayInitialData() {
        console.log('📋 Displaying initial data...');

        // Display all medals initially
        const allMedals = MEDAL_MANAGER.getAllMedals();
        UI_MANAGER.displayMedals(allMedals);

        // Update medal set display (empty initially)
        UI_MANAGER.updateMedalSlots();
        UI_MANAGER.updateAffectsAndTags();

        console.log(`✅ Displayed ${allMedals.length} medals`);
    }

    /**
     * Get application status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            dataLoaded: this.dataLoaded,
            medalCount: MEDAL_MANAGER.getAllMedals().length,
            currentLanguage: UI_MANAGER.getCurrentLanguage(),
            medalSetFilled: !MEDAL_SET_MANAGER.isEmpty()
        };
    }

    /**
     * Restart the application
     */
    async restart() {
        console.log('🔄 Restarting application...');

        // Clear medal set
        MEDAL_SET_MANAGER.clearSet();

        // Reset UI
        //UI_MANAGER.refreshFilters();

        // Reload data
        this.dataLoaded = false;
        this.isInitialized = false;

        await this.init();
    }

    /**
     * Export application state
     * @returns {Object} Application state
     */
    exportState() {
        return {
            medalSet: MEDAL_SET_MANAGER.exportSet(),
            language: UI_MANAGER.getCurrentLanguage(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import application state
     * @param {Object} state - Application state
     */
    async importState(state) {
        if (!state) {
            throw new Error('Invalid state object');
        }

        try {
            // Set language
            if (state.language) {
                UI_MANAGER.setLanguage(state.language);
            }

            // Import medal set
            if (state.medalSet) {
                await MEDAL_SET_MANAGER.importSet(state.medalSet);
            }

            console.log('✅ State imported successfully');
        } catch (error) {
            console.error('❌ Error importing state:', error);
            throw error;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        console.log('🧹 Cleaning up application...');

        UI_MANAGER.destroy();
        this.isInitialized = false;
        this.dataLoaded = false;

        console.log('✅ Application cleaned up');
    }
}

// Create global app instance
const app = new MedalSetBuilderApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init().catch(console.error);
    });
} else {
    app.init().catch(console.error);
}

// Make app available globally for debugging
window.medalApp = app;

// Export for ES6 modules
export default app;