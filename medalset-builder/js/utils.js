/**
 * Utility Functions
 * Helper functions for common operations
 */

const Utils = {
    /**
     * Debounce function - delays execution until after delay milliseconds
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function - limits execution to once per delay milliseconds
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func.apply(this, args);
        };
    },

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str) return '';

        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return 'Unknown';

        try {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID string
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if element is visible
     */
    isInViewport(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector to scroll to
     * @param {number} offset - Offset from top (default: 0)
     */
    scrollToElement(target, offset = 0) {
        let element;

        if (typeof target === 'string') {
            element = document.querySelector(target);
        } else {
            element = target;
        }

        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Local storage helpers with error handling
     */
    storage: {
        /**
         * Set item in localStorage
         * @param {string} key - Storage key
         * @param {any} value - Value to store
         * @returns {boolean} Success status
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                return false;
            }
        },

        /**
         * Get item from localStorage
         * @param {string} key - Storage key
         * @param {any} defaultValue - Default value if not found
         * @returns {any} Retrieved value or default
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to read from localStorage:', error);
                return defaultValue;
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove from localStorage:', error);
                return false;
            }
        },

        /**
         * Clear all localStorage
         * @returns {boolean} Success status
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
                return false;
            }
        }
    },

    /**
     * Image loading helpers
     */
    image: {
        /**
         * Preload image
         * @param {string} src - Image source URL
         * @returns {Promise} Promise that resolves when image loads
         */
        preload(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        /**
         * Check if image exists
         * @param {string} src - Image source URL
         * @returns {Promise<boolean>} Promise that resolves to true if image exists
         */
        async exists(src) {
            try {
                await this.preload(src);
                return true;
            } catch {
                return false;
            }
        },

        /**
         * Get image with fallback
         * @param {string} primarySrc - Primary image source
         * @param {string} fallbackSrc - Fallback image source
         * @returns {Promise<string>} Promise that resolves to working image source
         */
        async getWithFallback(primarySrc, fallbackSrc) {
            const primaryExists = await this.exists(primarySrc);
            return primaryExists ? primarySrc : fallbackSrc;
        }
    },

    /**
     * URL and query string helpers
     */
    url: {
        /**
         * Get query parameter value
         * @param {string} param - Parameter name
         * @returns {string|null} Parameter value or null
         */
        getParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },

        /**
         * Set query parameter
         * @param {string} param - Parameter name
         * @param {string} value - Parameter value
         * @param {boolean} replace - Replace current history entry
         */
        setParam(param, value, replace = false) {
            const url = new URL(window.location);
            url.searchParams.set(param, value);

            if (replace) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
            }
        },

        /**
         * Remove query parameter
         * @param {string} param - Parameter name
         * @param {boolean} replace - Replace current history entry
         */
        removeParam(param, replace = false) {
            const url = new URL(window.location);
            url.searchParams.delete(param);

            if (replace) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
            }
        }
    },

    /**
     * Array utilities
     */
    array: {
        /**
         * Remove duplicates from array
         * @param {Array} arr - Array to deduplicate
         * @param {string} key - Key to compare for objects
         * @returns {Array} Array without duplicates
         */
        unique(arr, key = null) {
            if (!Array.isArray(arr)) return [];

            if (key) {
                const seen = new Set();
                return arr.filter(item => {
                    const value = item[key];
                    if (seen.has(value)) {
                        return false;
                    }
                    seen.add(value);
                    return true;
                });
            }

            return [...new Set(arr)];
        },

        /**
         * Sort array of objects by key
         * @param {Array} arr - Array to sort
         * @param {string} key - Key to sort by
         * @param {boolean} ascending - Sort direction
         * @returns {Array} Sorted array
         */
        sortBy(arr, key, ascending = true) {
            if (!Array.isArray(arr)) return [];

            return [...arr].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];

                if (aVal < bVal) return ascending ? -1 : 1;
                if (aVal > bVal) return ascending ? 1 : -1;
                return 0;
            });
        },

        /**
         * Group array by key
         * @param {Array} arr - Array to group
         * @param {string} key - Key to group by
         * @returns {Object} Grouped object
         */
        groupBy(arr, key) {
            if (!Array.isArray(arr)) return {};

            return arr.reduce((groups, item) => {
                const group = item[key];
                if (!groups[group]) {
                    groups[group] = [];
                }
                groups[group].push(item);
                return groups;
            }, {});
        }
    },

    /**
     * Performance helpers
     */
    performance: {
        /**
         * Measure execution time of a function
         * @param {Function} func - Function to measure
         * @param {string} label - Label for the measurement
         * @returns {any} Function result
         */
        measure(func, label = 'Operation') {
            const start = performance.now();
            const result = func();
            const end = performance.now();
            console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
            return result;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}