/**
 * Main Application Logic
 * Handles UI interactions, medal display, and user events
 */

class MedalApp {
    constructor() {
        this.currentMedals = [];
        this.selectedMedal = null;
        this.isLoading = false;
        this.searchTimeout = null; // For debounced search

        // DOM elements
        this.container = null;
        this.searchInput = null;
        this.modal = null;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Medal App...');

        this.setupDOM();
        this.setupEventListeners();
        await this.loadAndDisplayMedals();
    }

    /**
     * Set up DOM references
     */
    setupDOM() {
        this.container = document.getElementById('medal-container');
        this.searchInput = document.getElementById('search-input');

        if (!this.container) {
            console.error('Medal container not found!');
            return;
        }

        // Create search bar if it doesn't exist
        this.createSearchBar();

        // Create modal for detailed view
        this.createModal();
    }

    /**
     * Create search bar
     */
    createSearchBar() {
        if (this.searchInput) return; // Already exists

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="search-input" placeholder="Search medals..." class="search-input">
            <button id="clear-search" class="clear-btn">Clear</button>
        `;

        // Insert before medal container
        this.container.parentNode.insertBefore(searchContainer, this.container);
        this.searchInput = document.getElementById('search-input');
    }

    /**
     * Create modal for detailed medal view
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'medal-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <div class="modal-body">
                    <img id="modal-image" src="" alt="Medal Image" class="modal-image">
                    <div class="modal-info">
                        <h2 id="modal-title">Medal Name</h2>
                        <p id="modal-description">Description</p>
                        <div class="modal-effects">
                            <h3>Effects:</h3>
                            <p id="modal-effects">Effects description</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Clear search button
        const clearBtn = document.getElementById('clear-search');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                this.displayMedals(medalLoader.getAllMedals());
            });
        }

        // Modal close events
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => this.closeModal());

            // Close modal when clicking outside
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    /**
     * Load medal data and display them
     */
    async loadAndDisplayMedals() {
        this.showLoading();

        try {
            const medals = await medalLoader.loadMedals();
            this.currentMedals = medals;
            this.displayMedals(medals);
        } catch (error) {
            console.error('Failed to load medals:', error);
            this.showError('Failed to load medals. Please try again.');
        }
    }

    /**
     * Display medals in the container - Image gallery view
     * @param {Array} medals - Array of medal objects to display
     */
    displayMedals(medals) {
        if (!this.container) return;

        this.hideLoading();

        if (medals.length === 0) {
            this.container.innerHTML = `
                <div class="no-results">
                    <h3>No medals found</h3>
                    <p>Try adjusting your search terms.</p>
                </div>
            `;
            return;
        }

        const medalGrid = document.createElement('div');
        medalGrid.className = 'medal-grid';

        medals.forEach(medal => {
            const medalItem = this.createMedalCard(medal);
            medalGrid.appendChild(medalItem);
        });

        this.container.innerHTML = '';
        this.container.appendChild(medalGrid);

        // Add results count for large collections
        if (medals.length > 50) {
            const resultCount = document.createElement('div');
            resultCount.className = 'result-count';
            resultCount.innerHTML = `<p>Showing ${medals.length} medals</p>`;
            this.container.insertBefore(resultCount, medalGrid);
        }
    }

    /**
     * Create a medal item element - Image-only view
     * @param {Object} medal - Medal object
     * @returns {HTMLElement} Medal item element
     */
    createMedalCard(medal) {
        const item = document.createElement('div');
        item.className = 'medal-item';
        item.dataset.medalId = medal.id;
        item.dataset.tooltip = medal.name;

        const imagePath = medalLoader.getMedalImagePath(medal);

        item.innerHTML = `
            <div class="medal-image-container">
                <img src="${imagePath}" alt="${medal.name}" class="medal-image" 
                     onerror="this.src='./images/placeholder.jpg'">
            </div>
            <p class="medal-name">${medal.name}</p>
        `;

        // Add click event to show modal
        item.addEventListener('click', () => {
            this.showMedalDetails(medal.id);
        });

        return item;
    }

    /**
     * Handle search input with debouncing for performance
     * @param {string} query - Search query
     */
    handleSearch(query) {
        // Use debounced search for better performance with many items
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            const results = medalLoader.searchMedals(query);
            this.displayMedals(results);

            // Show result count for large datasets
            if (query.trim()) {
                console.log(`Found ${results.length} medals matching "${query}"`);
            }
        }, 300); // 300ms debounce
    }

    /**
     * Show medal details in modal
     * @param {string|number} medalId - Medal ID
     */
    showMedalDetails(medalId) {
        const medal = medalLoader.getMedalById(medalId);

        if (!medal) {
            console.error('Medal not found:', medalId);
            return;
        }

        this.selectedMedal = medal;

        // Update modal content
        document.getElementById('modal-image').src = medalLoader.getMedalImagePath(medal);
        document.getElementById('modal-title').textContent = medal.name;
        document.getElementById('modal-description').textContent = medal.description || 'No description available';
        document.getElementById('modal-effects').textContent = medal.affects || 'No effects listed';

        // Show modal
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.selectedMedal = null;
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Loading medals...</p>
                </div>
            `;
        }
        this.isLoading = true;
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.isLoading = false;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                    <button onclick="app.loadAndDisplayMedals()" class="retry-btn">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Refresh medals (reload from source)
     */
    async refresh() {
        await this.loadAndDisplayMedals();
    }

    /**
     * Get current displayed medals
     * @returns {Array} Current medals array
     */
    getCurrentMedals() {
        return this.currentMedals;
    }
}

// Initialize the app
const app = new MedalApp();