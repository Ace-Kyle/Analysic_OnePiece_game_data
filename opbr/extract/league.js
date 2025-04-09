import JSON_DATA from "../data/json_data.js";

export default class League{

    constructor(id, name) {
        this.id = id
        this.name = name
    }
    static #listOfLeagues = []
    //don't change order of static block code vs above code.
    // It ensures listOfLeagues is always created before init() called
    static {
        this.#init()
    }






    static getLeagueById(id){
       if (this.#listOfLeagues.length === 0) this.#init();
       return this.#listOfLeagues.find(league => league.id === id);
    }

    // getter
    id(){ return this.id; }
    name(){ return this.name; }
    static getListOfLeagues(){
        if (this.#listOfLeagues.length === 0) League.#init();
        return this.#listOfLeagues;
    }

    //avoid iterate list of league from raw data many times
    static #init(){
        if (this.#listOfLeagues.length > 0) return;

        const LEAGUES = JSON_DATA.listOf(JSON_DATA.TYPE.LEAGUE)
        let list = []
        let id, name
        for(let rank of LEAGUES){
            id = rank['league_id'];
            name = rank['league_name'];
            list.push(new League(id, name));
        }
        this.#listOfLeagues = list;
    }

}

//test
let list = League.getListOfLeagues()
console.log(list);
console.log(list.map( ({id, name, counter=0}) => ({id, name, counter})))