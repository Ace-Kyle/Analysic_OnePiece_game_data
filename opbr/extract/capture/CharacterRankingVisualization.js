// CharacterRankingVisualization.js
// A simple visualization component for the character ranking getData

class CharacterRankingVisualization {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with ID ${containerId} not found.`);
        }

        // Default options
        this.options = {
            dataUrl: options.dataUrl || '../../res/ranking/character_ranking.json',
            pageSize: options.pageSize || 20,
            showFilters: options.showFilters !== false,
            highlightTop: options.highlightTop || 10,
            colorScheme: options.colorScheme || {
                attacker: '#FF5252', // Red
                defender: '#448AFF', // Blue
                runner: '#66BB6A',   // Green
                header: '#3F51B5',   // Indigo
                alternate: '#F5F5F5' // Light gray
            },
            rarityColors: options.rarityColors || {
                'EX': '#FFD700', // Gold
                'BF': '#9C27B0', // Purple
                'Step-up': '#00BCD4', // Cyan
                'Free': '#8BC34A'  // Light green
            },
            elementColors: options.elementColors || {
                'Red': '#F44336',
                'Blue': '#2196F3',
                'Green': '#4CAF50',
                'Dark': '#673AB7',
                'Light': '#FFC107'
            }
        };

        // State
        this.data = null;
        this.filteredData = null;
        this.currentPage = 1;
        this.filters = {
            role: 'all',
            element: 'all',
            rarity: 'all',
            search: ''
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize the visualization
     */
    async init() {
        this.renderLoading();
        await this.loadData();
        this.setupContainer();
        this.applyFilters();
        this.renderTable();
        if (this.options.showFilters) {
            this.renderFilters();
        }
    }

    /**
     * Set up the container structure
     */
    setupContainer() {
        this.container.innerHTML = '';
        this.container.className = 'character-ranking-container';

        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .character-ranking-container {
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            .character-ranking-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .character-ranking-title {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            }
            .character-ranking-season {
                font-size: 16px;
                color: #666;
            }
            .character-ranking-filters {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
            }
            .filter-group {
                display: flex;
                flex-direction: column;
            }
            .filter-group label {
                font-size: 12px;
                margin-bottom: 5px;
                color: #555;
            }
            .filter-group select, .filter-group input {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                min-width: 120px;
            }
            .character-ranking-table {
                width: 100%;
                border-collapse: collapse;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            .character-ranking-table th {
                background-color: ${this.options.colorScheme.header};
                color: white;
                text-align: left;
                padding: 12px;
                font-weight: bold;
            }
            .character-ranking-table tr:nth-child(even) {
                background-color: ${this.options.colorScheme.alternate};
            }
            .character-ranking-table td {
                padding: 10px 12px;
                border-bottom: 1px solid #eee;
            }
            .character-ranking-pagination {
                display: flex;
                justify-content: center;
                margin-top: 20px;
                gap: 5px;
            }
            .pagination-button {
                padding: 8px 12px;
                background: #f0f0f0;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
            }
            .pagination-button.active {
                background-color: ${this.options.colorScheme.header};
                color: white;
                border-color: ${this.options.colorScheme.header};
            }
            .pagination-button:hover:not(.active) {
                background-color: #e0e0e0;
            }
            .top-rank {
                font-weight: bold;
                background-color: rgba(255, 215, 0, 0.2); /* Gold background */
            }
            .rank-number {
                display: inline-block;
                min-width: 30px;
                text-align: center;
                font-weight: bold;
            }
            .role-indicator {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .rarity-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                color: white;
                text-align: center;
            }
            .element-badge {
                display: inline-block;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                margin-right: 4px;
                vertical-align: middle;
            }
            .new-character-indicator {
                display: inline-block;
                padding: 2px 6px;
                background-color: #FF5722;
                color: white;
                border-radius: 4px;
                font-size: 11px;
                margin-left: 6px;
                vertical-align: middle;
            }
        `;
        this.container.appendChild(style);

        // Header
        const header = document.createElement('div');
        header.className = 'character-ranking-header';

        const title = document.createElement('h2');
        title.className = 'character-ranking-title';
        title.textContent = 'Character Ranking';

        const season = document.createElement('div');
        season.className = 'character-ranking-season';
        season.textContent = `Season: ${this.data.season || 'Unknown'}`;

        header.appendChild(title);
        header.appendChild(season);
        this.container.appendChild(header);

        // Filters container (will be populated later if enabled)
        if (this.options.showFilters) {
            const filtersContainer = document.createElement('div');
            filtersContainer.className = 'character-ranking-filters';
            this.filtersContainer = filtersContainer;
            this.container.appendChild(filtersContainer);
        }

        // Table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'character-ranking-table-container';
        this.tableContainer = tableContainer;
        this.container.appendChild(tableContainer);

        // Pagination container
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'character-ranking-pagination';
        this.paginationContainer = paginationContainer;
        this.container.appendChild(paginationContainer);
    }

    /**
     * Load getData from the specified URL
     */
    async loadData() {
        try {
            const response = await fetch(this.options.dataUrl);
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            this.data = await response.json();
            this.filteredData = [...this.data.characters];
            console.log(`Loaded data for ${this.data.total_characters} characters`);
        } catch (error) {
            console.error('Error loading ranking getData:', error);
            this.renderError('Failed to load character ranking getData. Please try again later.');
        }
    }

    /**
     * Apply filters to the getData
     */
    applyFilters() {
        if (!this.data || !this.data.characters) return;

        this.filteredData = this.data.characters.filter(character => {
            // Role filter
            if (this.filters.role !== 'all' && character.role !== this.filters.role) {
                return false;
            }

            // Element filter
            if (this.filters.element !== 'all' && character.element !== this.filters.element) {
                return false;
            }

            // Rarity filter
            if (this.filters.rarity !== 'all' && character.rarity !== this.filters.rarity) {
                return false;
            }

            // Search filter (name or ID)
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const nameMatch = character.name && character.name.toLowerCase().includes(searchLower);
                const idMatch = character.chara_id && character.chara_id.toString().includes(searchLower);
                if (!nameMatch && !idMatch) {
                    return false;
                }
            }

            return true;
        });

        // Reset to first page when filters change
        this.currentPage = 1;
    }

    /**
     * Render the filters UI
     */
    renderFilters() {
        if (!this.filtersContainer) return;

        this.filtersContainer.innerHTML = '';

        // Get unique values for each filter
        const roles = this.getUniqueValues('role');
        const elements = this.getUniqueValues('element');
        const rarities = this.getUniqueValues('rarity');

        // Role filter
        const roleGroup = this.createFilterGroup('Role', 'role', roles, this.filters.role);
        this.filtersContainer.appendChild(roleGroup);

        // Element filter
        const elementGroup = this.createFilterGroup('Element', 'element', elements, this.filters.element);
        this.filtersContainer.appendChild(elementGroup);

        // Rarity filter
        const rarityGroup = this.createFilterGroup('Rarity', 'rarity', rarities, this.filters.rarity);
        this.filtersContainer.appendChild(rarityGroup);

        // Search box
        const searchGroup = document.createElement('div');
        searchGroup.className = 'filter-group';

        const searchLabel = document.createElement('label');
        searchLabel.textContent = 'Search';
        searchGroup.appendChild(searchLabel);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search by name or ID';
        searchInput.value = this.filters.search;
        searchInput.addEventListener('input', e => {
            this.filters.search = e.target.value;
            this.applyFilters();
            this.renderTable();
        });
        searchGroup.appendChild(searchInput);

        this.filtersContainer.appendChild(searchGroup);
    }

    /**
     * Create a filter group with label and select element
     */
    createFilterGroup(label, filterName, options, currentValue) {
        const group = document.createElement('div');
        group.className = 'filter-group';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        group.appendChild(labelElement);

        const select = document.createElement('select');

        // Add "All" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = `All ${label}s`;
        select.appendChild(allOption);

        // Add options from getData
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });

        // Set current value
        select.value = currentValue;

        // Add event listener
        select.addEventListener('change', e => {
            this.filters[filterName] = e.target.value;
            this.applyFilters();
            this.renderTable();
        });

        group.appendChild(select);
        return group;
    }

    /**
     * Get unique values for a specific property from the getData
     */
    getUniqueValues(property) {
        if (!this.data || !this.data.characters) return [];

        const values = new Set();
        this.data.characters.forEach(character => {
            if (character[property]) {
                values.add(character[property]);
            }
        });

        return Array.from(values).sort();
    }

    /**
     * Render the character ranking table
     */
    renderTable() {
        if (!this.tableContainer) return;

        if (!this.filteredData || this.filteredData.length === 0) {
            this.tableContainer.innerHTML = '<p>No characters found matching the current filters.</p>';
            this.paginationContainer.innerHTML = '';
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
        const startIndex = (this.currentPage - 1) * this.options.pageSize;
        const endIndex = Math.min(startIndex + this.options.pageSize, this.filteredData.length);
        const currentPageData = this.filteredData.slice(startIndex, endIndex);

        // Create table
        const table = document.createElement('table');
        table.className = 'character-ranking-table';

        // Table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = [
            'Rank', 'Character', 'Role', 'Element', 'Rarity', 'Points', 'Players'
        ];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');

        currentPageData.forEach((character, index) => {
            const rank = startIndex + index + 1;
            const row = document.createElement('tr');

            // Highlight top characters
            if (rank <= this.options.highlightTop) {
                row.className = 'top-rank';
            }

            // Rank column
            const rankCell = document.createElement('td');
            const rankNumber = document.createElement('span');
            rankNumber.className = 'rank-number';
            rankNumber.textContent = rank;
            rankCell.appendChild(rankNumber);
            row.appendChild(rankCell);

            // Character column
            const nameCell = document.createElement('td');
            nameCell.textContent = character.name || `Character ${character.chara_id}`;
            if (character.isNewCharacter) {
                const newIndicator = document.createElement('span');
                newIndicator.className = 'new-character-indicator';
                newIndicator.textContent = 'NEW';
                nameCell.appendChild(newIndicator);
            }
            row.appendChild(nameCell);

            // Role column
            const roleCell = document.createElement('td');
            const roleIndicator = document.createElement('span');
            roleIndicator.className = 'role-indicator';
            roleIndicator.style.backgroundColor = this.getRoleColor(character.role);
            roleCell.appendChild(roleIndicator);
            roleCell.appendChild(document.createTextNode(character.role || 'Unknown'));
            row.appendChild(roleCell);

            // Element column
            const elementCell = document.createElement('td');
            const elementIndicator = document.createElement('span');
            elementIndicator.className = 'element-badge';
            elementIndicator.style.backgroundColor = this.getElementColor(character.element);
            elementCell.appendChild(elementIndicator);
            elementCell.appendChild(document.createTextNode(character.element || 'Unknown'));
            row.appendChild(elementCell);

            // Rarity column
            const rarityCell = document.createElement('td');
            const rarityBadge = document.createElement('span');
            rarityBadge.className = 'rarity-badge';
            rarityBadge.style.backgroundColor = this.getRarityColor(character.rarity);
            rarityBadge.textContent = character.rarity || 'Unknown';
            rarityCell.appendChild(rarityBadge);
            row.appendChild(rarityCell);

            // Points column
            const pointsCell = document.createElement('td');
            pointsCell.textContent = Math.round(character.adjustedAveragePoints).toLocaleString();
            row.appendChild(pointsCell);

            // Players column
            const playersCell = document.createElement('td');
            playersCell.textContent = character.playerCount.toLocaleString();
            row.appendChild(playersCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Update container
        this.tableContainer.innerHTML = '';
        this.tableContainer.appendChild(table);

        // Update pagination
        this.renderPagination(totalPages);
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        if (!this.paginationContainer) return;

        this.paginationContainer.innerHTML = '';

        // Only show pagination if we have more than one page
        if (totalPages <= 1) return;

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-button';
        prevButton.textContent = '←';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });
        this.paginationContainer.appendChild(prevButton);

        // Page buttons
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust if we're near the end
        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-button';
            if (i === this.currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.renderTable();
            });
            this.paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-button';
        nextButton.textContent = '→';
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });
        this.paginationContainer.appendChild(nextButton);
    }

    /**
     * Render loading state
     */
    renderLoading() {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>Loading Character Rankings...</h3>
                <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; 
                     border-top: 5px solid ${this.options.colorScheme.header}; 
                     border-radius: 50%; margin: 20px auto;
                     animation: spin 1s linear infinite;"></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }

    /**
     * Render error message
     */
    renderError(message) {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #d32f2f;">
                <h3>Error</h3>
                <p>${message}</p>
                <button style="padding: 10px 20px; margin-top: 20px; 
                        background-color: ${this.options.colorScheme.header}; 
                        color: white; border: none; border-radius: 4px; 
                        cursor: pointer;">
                    Retry
                </button>
            </div>
        `;

        // Add event listener to retry button
        const retryButton = this.container.querySelector('button');
        retryButton.addEventListener('click', () => {
            this.init();
        });
    }

    /**
     * Get color for a role type
     */
    getRoleColor(role) {
        if (!role) return '#999'; // Default gray

        switch (role.toLowerCase()) {
            case 'attacker':
                return this.options.colorScheme.attacker;
            case 'defender':
                return this.options.colorScheme.defender;
            case 'runner':
                return this.options.colorScheme.runner;
            default:
                return '#999'; // Default gray
        }
    }

    /**
     * Get color for an element type
     */
    getElementColor(element) {
        if (!element) return '#999'; // Default gray

        return this.options.elementColors[element] || '#999';
    }

    /**
     * Get color for a rarity type
     */
    getRarityColor(rarity) {
        if (!rarity) return '#999'; // Default gray

        return this.options.rarityColors[rarity] || '#999';
    }
}

// Export the class
export default CharacterRankingVisualization;

// Usage example:
/*
document.addEventListener('DOMContentLoaded', () => {
    const rankingViz = new CharacterRankingVisualization('character-ranking-container', {
        dataUrl: 'path/to/your/character_ranking.json',
        pageSize: 25
    });
});
*/