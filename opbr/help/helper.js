export default class Helper{

    /**
     *
     * @param {Array}oldArr
     * @param {Array}newArr
     * @returns {*}
     */
    static differenceBetweenArrays(oldArr, newArr){
        if (!Array.isArray(oldArr) || !Array.isArray(newArr)) {
            throw new Error('Both arguments must be arrays');
        }
        return newArr.filter((item) => !oldArr.includes(item))
    }
    static differenceBetweenArrays2(oldArr, newArr) {
        // Ensure we're working with arrays
        if (!Array.isArray(oldArr) || !Array.isArray(newArr)) {
            throw new Error('Both arguments must be arrays');
        }

        const differences = {
            added: [],      // Elements present in newArr but not in oldArr
            removed: [],    // Elements present in oldArr but not in newArr
            modified: []    // Optional: For objects that exist in both but have changes
        };

        // Find added elements (in newArr but not in oldArr)
        differences.added = newArr.filter(newItem => {
            if (typeof newItem === 'object' && newItem !== null) {
                // For objects, compare by a unique identifier (assuming 'id' exists)
                return !oldArr.some(oldItem => oldItem.id === newItem.id);
            }
            // For primitive values, use direct comparison
            return !oldArr.includes(newItem);
        });

        // Find removed elements (in oldArr but not in newArr)
        differences.removed = oldArr.filter(oldItem => {
            if (typeof oldItem === 'object' && oldItem !== null) {
                // For objects, compare by a unique identifier
                return !newArr.some(newItem => newItem.id === oldItem.id);
            }
            // For primitive values, use direct comparison
            return !newArr.includes(oldItem);
        });

        // Optional: Find modified objects (same id but different content)
        if (oldArr.length > 0 && typeof oldArr[0] === 'object') {
            differences.modified = newArr.filter(newItem => {
                const oldItem = oldArr.find(item => item.id === newItem.id);
                if (!oldItem) return false;

                // Deep compare objects excluding the id
                return JSON.stringify(omitId(newItem)) !== JSON.stringify(omitId(oldItem));
            });
        }

        return differences;
    }

//helper function to remove id from object for comparison
    static omitId(obj) {
        const { id, ...rest } = obj;
        return rest;
    }
    static formatArrayAsMarkdownList(array) {
        //format array elements to the list of markdown
        return !array.length?'': `- ${array.join('\n- ')}`;
    }
}
/*
let tmp = ['a', 'b', 'c', 'd', 'e', 'f'];
console.log(Helper.formatArrayAsMarkdownList(tmp))*/
