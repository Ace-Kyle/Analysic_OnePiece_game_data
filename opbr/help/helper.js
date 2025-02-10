class Helper{

    /**
     *
     * @param {Array}oldArr
     * @param {Array}newArr
     * @returns {*}
     */
    static differenceBetweenArrays(oldArr, newArr){
        return newArr.filter((element) => {!oldArr.includes(element)})
    }
}