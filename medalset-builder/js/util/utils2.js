export const Utils2 = {
    /**
     *
     * @param {Map<number, number>} map1
     * @param {Map<number, number>} map2
     * @returns {Map<number, number>} Merged map with values summed up
     */
    merge2Maps(map1, map2) {
        console.log('>>Begin merging maps:');
        console.log('- Merging maps 1: ', Array.from(map1)); //for debugging
        console.log('- Merging maps 2: ', Array.from(map2)); //for debugging

        const mergedMap = new Map(map1);
        map2.forEach((value, key) => {
            if (mergedMap.has(key)) {
                mergedMap.set(key, mergedMap.get(key) + value);
            } else {
                mergedMap.set(key, value);
            }
        })
        return mergedMap;
    },
}