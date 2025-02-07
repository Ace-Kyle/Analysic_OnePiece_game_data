let cat = {
    name: 'Meo',
    year: 2025
}
function getFood(cat){

    try {
        let tmp = {
            food: cat.food
        }
        if (Object.values(tmp).includes(undefined)) throw new Error('Wrong food')
        return tmp;
    } catch (e) {
        console.log('Error=',e)
    }
}

console.log(getFood(cat))