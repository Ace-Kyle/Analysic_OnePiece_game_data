class Helper{

    static differenceBetweenArrays(oldArr, newArr){
        return newArr.filter((element) => {!oldArr.includes(element)})
    }
}