import ReadFromJson from "../../data/read_from_json.js";

class RankingFilter{
    constructor(){}
    #path = "../res/ranking/character_ranking.json"
    static ranking_url = "https://obr-sim.bounty-rush.com/socialsv/game/ranking/CharaRankingList.do"

    static loadData(json){
        let data = ReadFromJson.fromJsonFile(this.#path)
        console.log(data);
    }

    getEntries(raw){
        let data = raw['log']['entries']
        let validRankingRequest = []
        for (let request of data) {
            if (this.isRankingRequest(request)){
                validRankingRequest.push(request)
            }
        }
        console.log("Complete | get all of valid raking requests")
        return validRankingRequest
    }

    //TODO differentiate between Total list and detail one
    //Total: all top characters
    //Detail: specific character
    isRankingRequest(request){
        return request.request.url?.contains(RankingFilter.ranking_url)??false;
    }

    //getter and extract
    _season(data){
        //use 'title' to get Season name instead of number
        return data['ranking_data']['ranking_data']['term_id'];
    }
    _characterId(data){
        return data['ranking_data']['chara_id'];
    }
    _allPoint(data){
        //character ranking and league ranking
        let list = []
        let out = {
            character_point:0,
            character_ranking:0,
            league_id:0,
            league_point:0,
        }
        let rankingList = data['ranking_list']

        for (let player of rankingList){
            out.character_ranking = player['ranking_rank']
            out.character_point   = player['ranking_point']
            out.league_id         = player['league_id']
            out.league_point      = player['league_point']

            list.push(out)
        }
        console.log("Complete ranking list")
        return list
    }

}

//test
let testjson = {
    outer: {inners: 12}
}