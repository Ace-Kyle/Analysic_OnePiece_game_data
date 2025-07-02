import {CONFIG} from '../util/Config.js';
import {MEDAL_SET_MANAGER} from './medal-set-manager.js';
import {MEDAL_MANAGER} from './medal-manager.js';
import {MEDAL_INSTANCE} from '../model/medal.js';
import {ABILITY_MANAGER} from "./ability-manager.js";
import {ABILITY_INSTANCE} from "../model/ability.js";
import {MEDAL_TAG_MANAGER} from "./medal-tag-manager.js";

/**
 * Manages UI interactions and updates
 */
class UIManager {
    constructor() {
        this.currentLanguage = CONFIG.default_language;
        this.currentMedals = [];
        this.searchTimeout = null;
        this.isInitialized = false;
        this.modalElement = null;

        // Bind methods
        this.handleMedalSetEvent = this.handleMedalSetEvent.bind(this);
    }

    /**
     * Initialize UI manager
     */
    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupModal();
        this.updateLanguage();

        // Listen to medal set events
        MEDAL_SET_MANAGER.addEventListener(this.handleMedalSetEvent);

        this.isInitialized = true;
        console.log('UI Manager initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Language toggle
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter selects
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.handleFilter());
        }

        if (tagFilter) {
            tagFilter.addEventListener('change', () => this.handleFilter());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFilters());
        }

        // Toggle buttons (Affect/Tag)
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToggle(e.target));
        });

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        // Medal slot remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const slot = e.target.closest('.medal-slot');
                if (slot) {
                    const slotIndex = parseInt(slot.dataset.slot);
                    MEDAL_SET_MANAGER.removeMedal(slotIndex);
                }
            }
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        const medalSlots = document.querySelectorAll('.medal-slot');

        medalSlots.forEach((slot, index) => {
            // Drag over
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            // Drag leave
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            // Drop
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                const medalId = e.dataTransfer.getData('text/plain');
                const medal = MEDAL_MANAGER.getMedalById(medalId);

                if (medal) {
                    MEDAL_SET_MANAGER.addMedal(index, medal);
                }
            });
        });
    }

    /**
     * Setup modal functionality
     */
    setupModal() {
        this.modalElement = document.getElementById('medalModal');

        if (this.modalElement) {
            // Close button
            const closeBtn = this.modalElement.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Background click to close
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    this.closeModal();
                }
            });

            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modalElement.style.display === 'block') {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Handle medal set events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    handleMedalSetEvent(event, data) {
        switch (event) {
            case 'medalAdded':
            case 'medalRemoved':
            case 'setCleared':
                this.updateMedalSlots();
                break;
            case 'effectsCalculated':
                this.updateAffectsAndTags();
                break;
        }
    }

    /**
     * Update medal slots display
     */
    updateMedalSlots() {
        const slots = document.querySelectorAll('.medal-slot');

        slots.forEach((slot, index) => {
            const medal = MEDAL_SET_MANAGER.getMedal(index);
            const removeBtn = slot.querySelector('.remove-btn');

            if (medal) {
                slot.classList.add('filled');
                const imagePath = MEDAL_INSTANCE.getImagePath(medal);

                slot.innerHTML = `
                    <img src="${imagePath}" alt="${medal.name}" onerror="this.src='./images/placeholder.png'">
                    <button class="remove-btn">&times;</button>
                `;
            } else {
                slot.classList.remove('filled');
                slot.innerHTML = '<button class="remove-btn">&times;</button>';
            }
        });
    }

    /**
     * Update affects and tags display
     */
    updateAffectsAndTags() {
        this.updateAffectsDisplay();
        this.updateTagsDisplay();
    }

    /**
     * Update affects display
     */
    updateAffectsDisplay() {
        const affectsList = document.querySelector('.affects-list');
        if (!affectsList) return;

        const affects = MEDAL_SET_MANAGER.getCurrentAffects(this.currentLanguage);
        affectsList.innerHTML = '';

        if (affects.length === 0) {
            const li = document.createElement('li');
            li.textContent = this.currentLanguage === 'vi' ? 'Không có hiệu ứng' : 'No effects active';
            li.style.color = '#aaa';
            affectsList.appendChild(li);
            return;
        }

        affects.forEach(ability => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="affect-item">
                    <span class="affect-description">${ability.description}</span>
                    <span class="affect-source">${ability.source_medal.name}</span>
                </div>
            `;
            affectsList.appendChild(li);
        });
    }

    /**
     * Update tags display
     */
    updateTagsDisplay() {
        const tagsList = document.querySelector('.tags-list');
        if (!tagsList) return;

        const tags = MEDAL_SET_MANAGER.getCurrentTags();
        tagsList.innerHTML = '';

        if (tags.length === 0) {
            const div = document.createElement('div');
            div.textContent = this.currentLanguage === 'vi' ? 'Không có thẻ' : 'No tags';
            div.style.color = '#aaa';
            tagsList.appendChild(div);
            return;
        }

        tags.forEach(tagData => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            const tagName = tagData.tag.name || `Tag ${tagData.tag.tag_id}`;
            tagElement.innerHTML = `${tagName} <span class="tag-count">(${tagData.count})</span>`;
            tagsList.appendChild(tagElement);
        });
    }

    /**
     * Display medals in the grid
     * @param {Array} medals - Array of medal objects
     */
    displayMedals(medals) {
        const medalGrid = document.getElementById('medalGrid');
        if (!medalGrid) return;

        if (medals.length === 0) {
            medalGrid.innerHTML = `
                <div class="error-message">
                    <p>${this.currentLanguage === 'vi' ? 'Không tìm thấy huy chương' : 'No medals found'}</p>
                </div>
            `;
            return;
        }

        medalGrid.innerHTML = '';

        medals.forEach(medal => {
            const medalItem = this.createMedalItem(medal);
            medalGrid.appendChild(medalItem);
        });

        this.currentMedals = medals;
    }

    /**
     * Create a medal item element
     * @param {Object} medal - Medal object
     * @returns {HTMLElement} Medal item element
     */
    createMedalItem(medal) {
        const item = document.createElement('div');
        item.className = 'medal-item';
        item.draggable = true;
        item.dataset.medalId = medal.medal_id;
        item.title = medal.name;

        const img = document.createElement('img');
        img.src = MEDAL_INSTANCE.getImagePath(medal);
        img.alt = medal.name;
        img.onerror = () => {
            img.src = './images/placeholder.png';
        };

        item.appendChild(img);

        // Drag events
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', medal.medal_id);
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });

        // Click to view details
        item.addEventListener('click', () => {
            this.showMedalModal(medal);
        });

        return item;
    }

    /**
     * Show medal details modal
     * @param {Object} medal - Medal object
     */
    showMedalModal(medal) {
        if (!this.modalElement) return;

        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalTrait = document.getElementById('modalTrait');
        const modalTags = document.getElementById('modalTags');

        // Set modal content
        if (modalImage) {
            modalImage.src = MEDAL_INSTANCE.getImagePath(medal);
            modalImage.alt = medal.name;
            modalImage.onerror = () => {
                modalImage.src = './images/placeholder.png';
            };
        }

        if (modalTitle) {
            modalTitle.textContent = medal.name;
        }

        if (modalDescription) {
            modalDescription.textContent = medal.detail ||
                (this.currentLanguage === 'vi' ? 'Không có mô tả' : 'No description available');
        }

        // Get unique trait (ability)
        if (modalTrait) {
            if (medal.ability_id) {
                const ability = ABILITY_MANAGER.getAbilityById(medal.ability_id);
                if (ability) {
                    modalTrait.textContent = ABILITY_INSTANCE.getDescription(ability, this.currentLanguage);
                } else {
                    modalTrait.textContent = this.currentLanguage === 'vi' ? 'Không có đặc tính riêng' : 'No unique trait';
                }
            } else {
                modalTrait.textContent = this.currentLanguage === 'vi' ? 'Không có đặc tính riêng' : 'No unique trait';
            }
        }

        // Get tags
        if (modalTags) {
            modalTags.innerHTML = '';
            if (medal.tag_ids && medal.tag_ids.length > 0) {
                medal.tag_ids.forEach(tagId => {
                    const tag = MEDAL_TAG_MANAGER.getMedalTagById(tagId);
                    if (tag) {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'tag-item';
                        tagElement.textContent = tag.name || `Tag ${tag.medal_tag_id}`;
                        modalTags.appendChild(tagElement);
                    }
                });
            } else {
                modalTags.innerHTML = `<span>${this.currentLanguage === 'vi' ? 'Không có thẻ' : 'No tags'}</span>`;
            }
        }

        this.modalElement.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    closeModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle search input
     * @param {string} query - Search query
     */
    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const results = MEDAL_MANAGER.searchMedals(query);
            this.displayMedals(results);
        }, CONFIG.UI_CONFIG.SEARCH_DEBOUNCE_MS);
    }

    /**
     * Handle filter changes
     */
    handleFilter() {
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');

        const filters = {
            type: typeFilter?.value || '',
            tag: tagFilter?.value || ''
        };

        const results = this.applyFilters(MEDAL_MANAGER.getAllMedals(), filters);
        this.displayMedals(results);
    }

    /**
     * Apply filters to medals
     * @param {Array} medals - Array of medals
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered medals
     */
    applyFilters(medals, filters) {
        let filteredMedals = [...medals];

        // Type filter
        if (filters.type) {
            filteredMedals = filteredMedals.filter(medal => {
                if (filters.type === 'event') return medal.is_event;
                if (filters.type === 'colored') return !medal.is_event;
                return true;
            });
        }

        // Tag filter
        if (filters.tag) {
            const tagId = parseInt(filters.tag);
            filteredMedals = filteredMedals.filter(medal => {
                return medal.tag_ids && medal.tag_ids.includes(tagId);
            });
        }

        return filteredMedals;
    }

    /**
     * Refresh all filters
     */
    refreshFilters() {
        const searchInput = document.getElementById('searchInput');
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');

        if (searchInput) searchInput.value = '';
        if (typeFilter) typeFilter.value = '';
        if (tagFilter) tagFilter.value = '';

        this.displayMedals(MEDAL_MANAGER.getAllMedals());
    }

    /**
     * Handle toggle button clicks
     * @param {HTMLElement} button - Clicked button
     */
    handleToggle(button) {
        const target = button.dataset.target;

        // Update button states
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn === button);
        });

        // Show/hide content
        const affectsContent = document.getElementById('affects-content');
        const tagsContent = document.getElementById('tags-content');

        if (affectsContent && tagsContent) {
            if (target === 'affects') {
                affectsContent.style.display = 'block';
                tagsContent.style.display = 'none';
            } else if (target === 'tags') {
                affectsContent.style.display = 'none';
                tagsContent.style.display = 'block';
            }
        }
    }

    /**
     * Handle save button click
     */
    async handleSave() {
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn?.textContent;

        try {
            if (saveBtn) {
                saveBtn.textContent = this.currentLanguage === 'vi' ? 'Đang tạo...' : 'Generating...';
                saveBtn.disabled = true;
            }

            await MEDAL_SET_MANAGER.downloadSetCard({
                language: this.currentLanguage,
                includeEffects: true,
                includeTags: true
            });

        } catch (error) {
            console.error('Error saving medal set:', error);
            alert(this.currentLanguage === 'vi' ?
                'Lỗi khi tạo hình ảnh. Vui lòng thử lại.' :
                'Error generating image. Please try again.');
        } finally {
            if (saveBtn) {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }
        }
    }

    /**
     * Toggle language
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'vi' : 'en';
        CONFIG.default_language = this.currentLanguage;
        this.updateLanguage();

        // Update affects and tags with new language
        this.updateAffectsAndTags();
    }

    /**
     * Update UI language
     */
    updateLanguage() {
        const elements = document.querySelectorAll('[data-text-en], [data-text-vi], [data-placeholder-en], [data-placeholder-vi]');

        elements.forEach(element => {
            const textKey = `data-text-${this.currentLanguage}`;
            const placeholderKey = `data-placeholder-${this.currentLanguage}`;

            if (element.hasAttribute(textKey)) {
                element.textContent = element.getAttribute(textKey);
            }
            if (element.hasAttribute(placeholderKey)) {
                element.placeholder = element.getAttribute(placeholderKey);
            }
        });

        // Update language toggle button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.textContent = this.currentLanguage === 'en' ? 'EN / VI' : 'VI / EN';
        }
    }

    /**
     * Populate filter dropdowns
     */
    populateFilters() {
        this.populateTagFilter();
    }

    /**
     * Populate tag filter dropdown
     */
    populateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        if (!tagFilter) return;

        // Clear existing options (except the first one)
        while (tagFilter.children.length > 1) {
            tagFilter.removeChild(tagFilter.lastChild);
        }

        // Add tag options
        const tags = MEDAL_SET_MANAGER.dataManager?.getTags() || [];
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.tag_id;
            option.textContent = tag.name || `Tag ${tag.tag_id}`;
            tagFilter.appendChild(option);
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        const medalGrid = document.getElementById('medalGrid');
        if (medalGrid) {
            medalGrid.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            `;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const medalGrid = document.getElementById('medalGrid');
        if (medalGrid) {
            medalGrid.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Set language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (CONFIG.support_languages.includes(language)) {
            this.currentLanguage = language;
            CONFIG.default_language = language;
            this.updateLanguage();
            this.updateAffectsAndTags();
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        MEDAL_SET_MANAGER.removeEventListener(this.handleMedalSetEvent);
        this.isInitialized = false;
    }
}

export const UI_MANAGER = new UIManager();