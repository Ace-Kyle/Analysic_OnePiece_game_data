import JSON_DATA from "../data/json_data.js";

class League{
    constructor(id) {
        let found = League.getLeagueById(id)
        if (found) {
            this.id = found['league_id'];
            this.name = found['league_name'];
        }else {
            throw new Error('League not found.');
        }
    }
    static getLeagueById(id){
        //from [league] table
        const LEAGUES = JSON_DATA.listOf(JSON_DATA.TYPE.LEAGUE)
        for(let rank of LEAGUES){
            if (rank["league_id"] === id) return rank
        }
        throw new Error(`Not found instance with id=${id}`)
    }
    id(){ return this.id; }
    name(){ return this.name; }

}