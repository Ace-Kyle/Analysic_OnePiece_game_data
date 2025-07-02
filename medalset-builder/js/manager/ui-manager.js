import {CONFIG} from '../util/Config.js';
import {MEDAL_SET_MANAGER} from './medal-set-manager.js';
import {MEDAL_MANAGER} from './medal-manager.js';
import {MEDAL_TAG_MANAGER} from './medal-tag-manager.js';
import {ABILITY_INSTANCE} from '../model/ability.js';
import {MEDAL_INSTANCE} from '../model/medal.js';
import {ABILITY_MANAGER} from "./ability-manager.js";
import {MEDAL_TAG_INSTANCE} from "../model/medal-tag.js";

class UIManager {
    constructor() {
        this.currentLanguage = CONFIG.default_language;
        this.isInitialized = false;
        this.searchTimeout = null;
        this.modalElement = null;
        this.filterModalElement = null;
        this.languageModalElement = null;
    }

    /**
     * Initialize UI Manager
     */
    init() {
        if (this.isInitialized) return;

        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupModals();
        this.updateLanguage();
        this.isInitialized = true;

        // Register for medal set events - fix the event name
        MEDAL_SET_MANAGER.addEventListener((event, data) => {
            this.handleMedalSetEvent(event, data);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchClearBtn = document.getElementById('searchClearBtn');

        if (searchInput) {
            //FIXME: Add debounce to search input
            /*searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });*/
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.handleSearch('');
                }
            });
        }

        // Filter modal
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.openFilterModal());
        }

        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.openLanguageModal());
        }

        // Toggle buttons for affects/tags - uncomment and fix
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToggle(e.target.dataset.target);
            });
        });

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleSave();
            });
        }

        // Medal clicks for modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.medal-item') || e.target.closest('.medal-slot img')) {
                const medalElement = e.target.closest('.medal-item') || e.target.closest('.medal-slot');
                const medalId = medalElement.dataset.medalId || medalElement.querySelector('img')?.dataset.medalId;
                if (medalId) {
                    this.showMedalModal(medalId);
                }
            }
        });
    }

    /**
     * Setup all modals
     */
    setupModals() {
        this.setupFilterModal();
        this.setupLanguageModal();
        this.setupMedalModal();
    }

    /**
     * Setup filter modal
     */
    setupFilterModal() {
        this.filterModalElement = document.getElementById('filterModal');
        if (!this.filterModalElement) return;

        // Close button
        const closeBtn = this.filterModalElement.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFilterModal());
        }

        // Background click to close
        this.filterModalElement.addEventListener('click', (e) => {
            if (e.target === this.filterModalElement) {
                this.closeFilterModal();
            }
        });

        // Filter controls
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');
        const refreshBtn = document.getElementById('refreshBtn');
        const applyFilterBtn = document.getElementById('applyFilterBtn');

        //TODO: Enable those event listeners when you want to use filters immediately
        /*if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (tagFilter) {
            tagFilter.addEventListener('change', () => this.applyFilters());
        }*/

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.resetFilters());
        }

        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => this.applyFilters());
        }

        // Populate filters
        this.populateFilters();
    }

    /**
     * Setup language modal
     */
    setupLanguageModal() {
        this.languageModalElement = document.getElementById('languageModal');
        if (!this.languageModalElement) return;

        // Close button
        const closeBtn = this.languageModalElement.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeLanguageModal());
        }

        // Background click to close
        this.languageModalElement.addEventListener('click', (e) => {
            if (e.target === this.languageModalElement) {
                this.closeLanguageModal();
            }
        });

        // Language options
        const languageOptions = this.languageModalElement.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.setLanguage(lang);
                this.closeLanguageModal();
            });
        });
    }

    /**
     * Setup medal detail modal
     */
    setupMedalModal() {
        this.modalElement = document.getElementById('medalModal');
        if (!this.modalElement) return;

        // Close button
        const closeBtn = this.modalElement.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMedalModal());
        }

        // Background click to close
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.closeMedalModal();
            }
        });

        // Escape key to close all modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * Open filter modal
     */
    openFilterModal() {
        if (this.filterModalElement) {
            this.filterModalElement.style.display = 'block';
        }
    }

    /**
     * Close filter modal
     */
    closeFilterModal() {
        if (this.filterModalElement) {
            this.filterModalElement.style.display = 'none';
        }
    }

    /**
     * Open language modal
     */
    openLanguageModal() {
        if (this.languageModalElement) {
            this.languageModalElement.style.display = 'block';
        }
    }

    /**
     * Close language modal
     */
    closeLanguageModal() {
        if (this.languageModalElement) {
            this.languageModalElement.style.display = 'none';
        }
    }

    /**
     * Show medal detail modal
     */
    showMedalModal(medalId) {
        if (!this.modalElement || !medalId) return;

        const medal = MEDAL_MANAGER.getMedalById(medalId);
        if (!medal) return;

        // Update modal content
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalTrait = document.getElementById('modalTrait');
        const modalTags = document.getElementById('modalTags');

        if (modalImage) {
            modalImage.src = MEDAL_INSTANCE.getImagePath(medal);
            modalImage.alt = medal.name || `Medal ${medal.medal_id}`;
        }

        if (modalTitle) {
            modalTitle.textContent = medal.name || `Medal ${medal.medal_id}`;
        }

        if (modalTrait) {
            const uniqueTraitId = MEDAL_INSTANCE.getUniqueTraitId(medal);
            modalTrait.textContent = ABILITY_MANAGER.getAbilityDescriptionById(uniqueTraitId) || '-';
        }

        if (modalTags) {
            modalTags.innerHTML = '';
            const tagIds = MEDAL_INSTANCE.getListTagIds(medal);
            tagIds.forEach(tagId => {
                const tag = MEDAL_TAG_MANAGER.getMedalTagById(tagId);
                if (tag) {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag-item';
                    tagElement.textContent = `${MEDAL_TAG_INSTANCE.getName(tag)}` || `Tag ${tagId}`;
                    modalTags.appendChild(tagElement);
                }
            });
        }

        this.modalElement.style.display = 'block';
    }

    /**
     * Close medal modal
     */
    closeMedalModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        this.closeFilterModal();
        this.closeLanguageModal();
        this.closeMedalModal();
    }

    /**
     * Handle affects/tags toggle
     */
    handleToggle(target) {
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        const affectsContent = document.getElementById('affects-content');
        const tagsContent = document.getElementById('tags-content');

        // Update button states
        toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        const activeBtn = document.querySelector(`[data-target="${target}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-selected', 'true');
        }

        // Show/hide content
        if (target === 'affects') {
            if (affectsContent) affectsContent.style.display = 'block';
            if (tagsContent) tagsContent.style.display = 'none';
        } else if (target === 'tags') {
            if (affectsContent) affectsContent.style.display = 'none';
            if (tagsContent) tagsContent.style.display = 'block';
        }

        this.updateAffectsAndTags();
    }

    /**
     * Update affects and tags display
     */
    updateAffectsAndTags() {
        this.displayAffects();
        this.displayTagsWithProgress();
    }

    /**
     * Display affects
     */
    displayAffects() {
        const affectsList = document.querySelector('.affects-list');
        if (!affectsList) return;

        affectsList.innerHTML = '';

        const affects = MEDAL_SET_MANAGER.getCurrentAffects(this.currentLanguage);
        if (affects.length === 0) {
            const li = document.createElement('li');
            li.textContent = this.currentLanguage === 'vi' ? 'Không có hiệu ứng' : 'No effects';
            li.style.color = '#aaa';
            affectsList.appendChild(li);
            return;
        }
        //FIXME: Reimplement "affects" as Map<ability_id, count>
        affects.forEach(affect => {
            const li = document.createElement('li');
            li.textContent = affect.description;
            affectsList.appendChild(li);
        });
    }

    /**
     * Display tags with progress bars
     */
    displayTagsWithProgress() {
        const tagsContainer = document.querySelector('.tags-progress-list');
        if (!tagsContainer) return;

        tagsContainer.innerHTML = '';

        const tags = MEDAL_SET_MANAGER.getCurrentTags();
        if (tags.length === 0) {
            const div = document.createElement('div');
            div.textContent = this.currentLanguage === 'vi' ? 'Không có thẻ' : 'No tags';
            div.style.color = '#aaa';
            div.style.textAlign = 'center';
            div.style.padding = 'var(--spacing-md)';
            tagsContainer.appendChild(div);
            return;
        }
        //FIXME: Reimplement "tags" as Map<tag_id, count>

        tags.forEach(tagData => {
            const progressItem = document.createElement('div');
            progressItem.className = 'tag-progress-item';

            const progressBar = document.createElement('div');
            progressBar.className = 'tag-progress-bar';
            // Calculate width based on count (max 3)
            const widthPercentage = (tagData.count / 3) * 100;
            progressBar.style.width = `${Math.min(widthPercentage, 100)}%`;

            const progressContent = document.createElement('div');
            progressContent.className = 'tag-progress-content';

            const tagName = document.createElement('span');
            tagName.className = 'tag-progress-name';
            tagName.textContent = tagData.tag.name || `Tag ${tagData.tag.medal_tag_id}`;

            const tagCount = document.createElement('span');
            tagCount.className = 'tag-progress-count';
            tagCount.textContent = tagData.count;

            progressContent.appendChild(tagName);
            progressContent.appendChild(tagCount);
            progressItem.appendChild(progressBar);
            progressItem.appendChild(progressContent);
            tagsContainer.appendChild(progressItem);
        });
    }

    /**
     * Handle search
     */
    handleSearch(query = '') {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            const medals = MEDAL_MANAGER.searchMedals(query);
            this.displayMedals(medals);
        }, 300);
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');
        const searchInput = document.getElementById('searchInput');

        const filters = {
            type: typeFilter?.value || '',
            tag: tagFilter?.value || '',
            search: searchInput?.value || ''
        };

        //FIXME: check value of filter params
        console.log('DEBUG: Filter params: ', filters)

        const filteredMedals = MEDAL_MANAGER.filterMedals(filters);
        console.log('DEBUG: Filter found medals: ', filteredMedals.length);
        this.displayMedals(filteredMedals);

        // Close filter modal after applying
        this.closeFilterModal();
    }

    /**
     * Reset filters
     */
    resetFilters() {
        const typeFilter = document.getElementById('typeFilter');
        const tagFilter = document.getElementById('tagFilter');
        const searchInput = document.getElementById('searchInput');

        if (typeFilter) typeFilter.value = '';
        if (tagFilter) tagFilter.value = '';
        if (searchInput) searchInput.value = '';

        this.displayMedals(MEDAL_MANAGER.getAllMedals());
        this.closeFilterModal();
    }

    /**
     * Clear medal set
     */
    clearMedalSet() {
        MEDAL_SET_MANAGER.clearSet();
        this.closeFilterModal();
    }

    /**
     * Handle save
     */
    handleSave() {
        // Implement save functionality
        console.log('Save functionality to be implemented');
        // This would typically generate and download the medal set image
    }

    /**
     * Display medals in grid
     */
    displayMedals(medals) {
        const medalGrid = document.getElementById('medalGrid');
        if (!medalGrid) return;

        if (medals.length === 0) {
            medalGrid.innerHTML = `
                <div class="error-message">
                    <p>${this.currentLanguage === 'vi' ? 'Không tìm thấy huy chương nào' : 'No medals found'}</p>
                </div>
            `;
            return;
        }

        medalGrid.innerHTML = '';
        medals.forEach(medal => {
            const medalItem = document.createElement('div');
            medalItem.className = 'medal-item';
            medalItem.draggable = true;
            medalItem.dataset.medalId = medal.medal_id;
            medalItem.setAttribute('aria-label', medal.name || `Medal ${medal.medal_id}`);

            const img = document.createElement('img');
            //NOTE: load images from the images/medals folder
            //img.src = MEDAL_INSTANCE.getImagePath(medal);
            img.src = MEDAL_INSTANCE.getImagePath(medal);
            img.alt = medal.name || `Medal ${medal.medal_id}`;
            //img.loading = 'lazy';
            img.onerror = () => {
                img.src = './images/on-error-medal.png';
            };

            medalItem.appendChild(img);
            medalGrid.appendChild(medalItem);
        });
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Medal items drag start
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.medal-item')) {
                const medalId = e.target.closest('.medal-item').dataset.medalId;
                e.dataTransfer.setData('text/plain', medalId);
                e.target.closest('.medal-item').style.opacity = '0.5';
            }
        });

        // Medal items drag end
        document.addEventListener('dragend', (e) => {
            if (e.target.closest('.medal-item')) {
                e.target.closest('.medal-item').style.opacity = '1';
            }
        });

        // Setup medal slots
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

                //TODO: Check if the medal is already in the set
                console.log(`>>DEBUG: Dropped medal ID: ${medalId} into slot ${index}`);
                if (medal) {
                    console.log(`>>DEBUG: Adding medal ID: ${medalId} to slot ${index}`);
                    MEDAL_SET_MANAGER.addMedal(index, medal);
                }
            });

            // Remove button
            const removeBtn = slot.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    MEDAL_SET_MANAGER.removeMedal(index);
                });
            }
        });
    }

    /**
     * Update language display
     */
    updateLanguage() {
        // Update language toggle
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            const flagSpan = languageToggle.querySelector('.language-flag');
            const textSpan = languageToggle.querySelector('.language-text');

            if (this.currentLanguage === 'vi') {
                if (flagSpan) flagSpan.textContent = '🇻🇳';
                if (textSpan) textSpan.textContent = 'VI';
            } else {
                if (flagSpan) flagSpan.textContent = '🇺🇸';
                if (textSpan) textSpan.textContent = 'EN';
            }
        }

        // Update all text elements with data attributes
        const elements = document.querySelectorAll('[data-text-en], [data-text-vi]');
        elements.forEach(element => {
            const key = `data-text-${this.currentLanguage}`;
            if (element.hasAttribute(key)) {
                element.textContent = element.getAttribute(key);
            }
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-placeholder-en], [data-placeholder-vi]');
        placeholderElements.forEach(element => {
            const key = `data-placeholder-${this.currentLanguage}`;
            if (element.hasAttribute(key)) {
                element.placeholder = element.getAttribute(key);
            }
        });
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
        const tags = MEDAL_TAG_MANAGER.getListOfMedalTags() || [];
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.medal_tag_id;
            option.textContent = tag.name || `Tag ${tag.medal_tag_id}`;
            tagFilter.appendChild(option);
        });
    }

    /**
     * Handle medal set events
     */
    handleMedalSetEvent(event, data) {
        console.log(`>>DEBUG: Handling medal set event: ${event}`, data);
        switch (event) {
            case 'medalAdded':
            case 'medalRemoved':
            case 'setCleared':
            case 'effectsCalculated':
                this.updateMedalSlots();
                this.updateAffectsAndTags();
                break;
            case 'medalSetChanged':
                //this.updateMedalSetDisplay();
                this.updateAffectsAndTags();
                break;
        }
    }

    /**
     * Update medal set display - improved version
     */
    updateMedalSlots() {
        const slots = document.querySelectorAll('.medal-slot');

        slots.forEach((slot, index) => {
            const medal = MEDAL_SET_MANAGER.getMedal(index);

            // Clear existing content except remove button
            const existingImg = slot.querySelector('img');
            if (existingImg) {
                existingImg.remove();
            }

            if (medal) {
                slot.classList.add('filled');
                const imagePath = MEDAL_INSTANCE.getImagePath(medal);

                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = medal.name || `Medal ${medal.medal_id}`;
                img.dataset.medalId = medal.medal_id;
                img.onerror = () => {
                    img.src = './images/placeholder.png';
                };

                // Insert image before the remove button
                const removeBtn = slot.querySelector('.remove-btn');
                slot.insertBefore(img, removeBtn);
            } else {
                slot.classList.remove('filled');
            }
        });
    }

    /**
     * Set language
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
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
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
     * Cleanup resources
     */
    destroy() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.isInitialized = false;
    }
}

export const UI_MANAGER = new UIManager();
