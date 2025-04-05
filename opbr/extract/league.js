import JSON_DATA from "../data/json_data.js";

class League{

    constructor(id, name) {
        this.id = id
        this.name = name
    }
    static listOfLeagues = []
    static {
        this.#init()
    }






    static getLeagueById(id){
       if (this.listOfLeagues.length === 0) this.#init();
       return this.listOfLeagues.find(league => league.id === id);
    }
    id(){ return this.id; }
    name(){ return this.name; }

    //avoid iterate list of league from raw data many times
    static #init(){
        if (this.listOfLeagues.length > 0) return;

        const LEAGUES = JSON_DATA.listOf(JSON_DATA.TYPE.LEAGUE)
        let list = []
        let id, name
        for(let rank of LEAGUES){
            id = rank['league_id'];
            name = rank['league_name'];
            list.push(new League(id, name));
        }
        this.listOfLeagues = list;
    }

}

//test
console.log(League.getLeagueById(100))