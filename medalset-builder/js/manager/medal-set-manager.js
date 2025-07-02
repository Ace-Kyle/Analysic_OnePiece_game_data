import { MEDAL_MANAGER } from './medal-manager.js';
import { ABILITY_MANAGER } from './ability-manager.js';
import { MEDAL_TAG_MANAGER } from './medal-tag-manager.js';
import { CONFIG } from '../util/Config.js';
import { MEDAL_INSTANCE } from '../model/medal.js';

/**
 * Manages the current medal set (3 slots) and calculates combined effects
 */
class MedalSetManager {
    constructor() {
        this.medalSlots = [null, null, null];
        this.currentAffects = [];
        this.currentTags = [];
        this.listeners = [];
    }

    /**
     * Add medal to specific slot
     * @param {number} slotIndex - Slot index (0-2)
     * @param {Object} medal - Medal object
     */
    addMedal(slotIndex, medal) {
        if (slotIndex >= 0 && slotIndex < CONFIG.UI_CONFIG.MAX_MEDAL_SLOTS) {
            // Check if medal is already in another slot
            const existingSlot = this.medalSlots.findIndex(m => m && m.medal_id === medal.medal_id);
            if (existingSlot !== -1 && existingSlot !== slotIndex) {
                this.medalSlots[existingSlot] = null; // Remove from old slot
            }

            this.medalSlots[slotIndex] = medal;
            this.calculateSetEffects();
            this.notifyListeners('medalAdded', { slotIndex, medal });
        }
    }

    /**
     * Remove medal from specific slot
     * @param {number} slotIndex - Slot index (0-2)
     */
    removeMedal(slotIndex) {
        if (slotIndex >= 0 && slotIndex < CONFIG.UI_CONFIG.MAX_MEDAL_SLOTS) {
            const removedMedal = this.medalSlots[slotIndex];
            this.medalSlots[slotIndex] = null;
            this.calculateSetEffects();
            this.notifyListeners('medalRemoved', { slotIndex, medal: removedMedal });
        }
    }

    /**
     * Get medal from specific slot
     * @param {number} slotIndex - Slot index (0-2)
     * @returns {Object|null} Medal object or null
     */
    getMedal(slotIndex) {
        return this.medalSlots[slotIndex];
    }

    /**
     * Get all medals in the set
     * @returns {Array} Array of medals (may contain nulls)
     */
    getAllMedals() {
        return [...this.medalSlots];
    }

    /**
     * Get only non-null medals
     * @returns {Array} Array of medal objects
     */
    getActiveMedals() {
        return this.medalSlots.filter(medal => medal !== null);
    }

    /**
     * Check if set is full
     * @returns {boolean} True if all slots are filled
     */
    isFull() {
        return this.medalSlots.every(medal => medal !== null);
    }

    /**
     * Check if set is empty
     * @returns {boolean} True if all slots are empty
     */
    isEmpty() {
        return this.medalSlots.every(medal => medal === null);
    }

    /**
     * Clear all medals from the set
     */
    clearSet() {
        this.medalSlots = [null, null, null];
        this.calculateSetEffects();
        this.notifyListeners('setCleared');
    }

    /**
     * Calculate combined effects from all medals in the set
     */
    calculateSetEffects() {
        this.currentAffects = [];
        this.currentTags = new Map(); // Use Map to count occurrences

        this.getActiveMedals().forEach(medal => {
            // Get medal abilities
            if (medal.ability_id) {
                const ability = ABILITY_MANAGER.getDataById(medal.ability_id);
                if (ability) {
                    this.currentAffects.push({
                        ...ability,
                        source_medal: medal
                    });
                }
            }

            // Get medal tags and count them
            if (medal.tag_ids && medal.tag_ids.length > 0) {
                medal.tag_ids.forEach(tagId => {
                    const tag = MEDAL_TAG_MANAGER.getDataById(tagId);
                    if (tag) {
                        const count = this.currentTags.get(tagId) || { tag, count: 0, medals: [] };
                        count.count++;
                        count.medals.push(medal);
                        this.currentTags.set(tagId, count);
                    }
                });
            }
        });

        this.notifyListeners('effectsCalculated', {
            affects: this.currentAffects,
            tags: Array.from(this.currentTags.values())
        });
    }

    /**
     * Get current affects with descriptions
     * @param {string} language - Language code ('en' or 'vi')
     * @returns {Array} Array of affect objects with descriptions
     */
    getCurrentAffects(language = CONFIG.default_language) {
        return this.currentAffects.map(ability => ({
            ...ability,
            description: this.getAbilityDescription(ability, language)
        }));
    }

    /**
     * Get current tags with counts
     * @returns {Array} Array of tag objects with counts
     */
    getCurrentTags() {
        return Array.from(this.currentTags.values());
    }

    /**
     * Get ability description in specified language
     * @param {Object} ability - Ability object
     * @param {string} language - Language code
     * @returns {string} Description
     */
    getAbilityDescription(ability, language) {
        switch (language) {
            case 'vi':
                return ability.detail_vi || ability.detail || 'Mô tả trống';
            default:
                return ability.detail || 'Empty description';
        }
    }

    /**
     * Generate medal set card as canvas
     * @param {Object} options - Generation options
     * @returns {Promise<HTMLCanvasElement>} Canvas element
     */
    async generateSetCard(options = {}) {
        const {
            width = 800,
            height = 600,
            language = CONFIG.default_language,
            includeEffects = true,
            includeTags = true
        } = options;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(language === 'vi' ? 'Bộ Huy Chương' : 'Medal Set', width / 2, 60);

        // Draw medals
        await this.drawMedalsOnCanvas(ctx, width, language);

        // Draw effects if enabled
        if (includeEffects) {
            this.drawEffectsOnCanvas(ctx, width, language);
        }

        // Draw tags if enabled
        if (includeTags) {
            this.drawTagsOnCanvas(ctx, width, language);
        }

        return canvas;
    }

    /**
     * Draw medals on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {string} language - Language code
     */
    async drawMedalsOnCanvas(ctx, width, language) {
        const medalSize = 100;
        const startX = (width - (3 * medalSize + 2 * 50)) / 2;
        const y = 120;

        for (let i = 0; i < 3; i++) {
            const x = startX + i * (medalSize + 50);
            const medal = this.medalSlots[i];

            if (medal) {
                try {
                    const img = await this.loadImage(MEDAL_INSTANCE.getImagePath(medal));

                    // Draw medal image
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + medalSize/2, y + medalSize/2, medalSize/2, 0, 2 * Math.PI);
                    ctx.clip();
                    ctx.drawImage(img, x, y, medalSize, medalSize);
                    ctx.restore();

                    // Draw border
                    ctx.strokeStyle = '#ff6b35';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(x + medalSize/2, y + medalSize/2, medalSize/2, 0, 2 * Math.PI);
                    ctx.stroke();

                    // Medal name
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(medal.name, x + medalSize/2, y + medalSize + 20);

                } catch (error) {
                    // Draw placeholder if image fails
                    ctx.fillStyle = '#4a4a4a';
                    ctx.beginPath();
                    ctx.arc(x + medalSize/2, y + medalSize/2, medalSize/2, 0, 2 * Math.PI);
                    ctx.fill();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('No Image', x + medalSize/2, y + medalSize/2);
                }
            } else {
                // Empty slot
                ctx.strokeStyle = '#4a4a4a';
                ctx.lineWidth = 3;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.arc(x + medalSize/2, y + medalSize/2, medalSize/2, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }

    /**
     * Draw effects on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {string} language - Language code
     */
    drawEffectsOnCanvas(ctx, width, language) {
        const affects = this.getCurrentAffects(language);

        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(language === 'vi' ? 'Hiệu ứng:' : 'Effects:', 50, 320);

        let y = 350;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';

        if (affects.length === 0) {
            ctx.fillText(language === 'vi' ? '• Không có hiệu ứng' : '• No effects', 70, y);
        } else {
            affects.forEach(ability => {
                if (y < 500) { // Prevent overflow
                    ctx.fillText('• ' + ability.description, 70, y);
                    y += 25;
                }
            });
        }
    }

    /**
     * Draw tags on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {string} language - Language code
     */
    drawTagsOnCanvas(ctx, width, language) {
        const tags = this.getCurrentTags();

        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(language === 'vi' ? 'Thẻ:' : 'Tags:', width/2 + 50, 320);

        let y = 350;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';

        if (tags.length === 0) {
            ctx.fillText(language === 'vi' ? '• Không có thẻ' : '• No tags', width/2 + 70, y);
        } else {
            tags.forEach(tagData => {
                if (y < 500) { // Prevent overflow
                    const tagName = tagData.tag.name || `Tag ${tagData.tag.tag_id}`;
                    ctx.fillText(`• ${tagName} (${tagData.count})`, width/2 + 70, y);
                    y += 25;
                }
            });
        }
    }

    /**
     * Load image as Promise
     * @param {string} src - Image source
     * @returns {Promise<HTMLImageElement>} Image element
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Download the medal set card
     * @param {Object} options - Generation options
     */
    async downloadSetCard(options = {}) {
        try {
            const canvas = await this.generateSetCard(options);
            const link = document.createElement('a');
            link.download = 'medal-set-card.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating set card:', error);
            alert('Error generating set card. Please try again.');
        }
    }

    /**
     * Add event listener
     * @param {Function} listener - Event listener function
     */
    addEventListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * Remove event listener
     * @param {Function} listener - Event listener function
     */
    removeEventListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notify all listeners
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    notifyListeners(event, data = {}) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }

    /**
     * Export current set configuration
     * @returns {Object} Set configuration
     */
    exportSet() {
        return {
            medals: this.medalSlots.map(medal => medal ? medal.medal_id : null),
            timestamp: new Date().toISOString(),
            affects: this.currentAffects.map(a => a.ability_id),
            tags: Array.from(this.currentTags.keys())
        };
    }

    /**
     * Import set configuration
     * @param {Object} setConfig - Set configuration
     */
    async importSet(setConfig) {
        if (!setConfig || !setConfig.medals) {
            throw new Error('Invalid set configuration');
        }

        // Clear current set
        this.clearSet();

        // Load medals
        for (let i = 0; i < setConfig.medals.length && i < 3; i++) {
            const medalId = setConfig.medals[i];
            if (medalId) {
                const medal = MEDAL_MANAGER.getMedalById(medalId);
                if (medal) {
                    this.addMedal(i, medal);
                }
            }
        }
    }
}

export const MEDAL_SET_MANAGER = new MedalSetManager();