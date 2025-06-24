class MedalSet {
    constructor(medal_id1, medal_id2, medal_id3) {

    }
    medalInSet = [0, 0, 0]

    addMedal(medal_id, postion){
        if (postion < 0 || postion > 2){
            console.error("The medal position is out of bounds. It must be from 0 - 2")
        }
        this.medalInSet[postion] = medal_id;
    }
}