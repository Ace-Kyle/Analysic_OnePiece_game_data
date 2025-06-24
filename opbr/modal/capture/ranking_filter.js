import ReadFromJson from "../../io/read_from_json.js";

class RankingFilter{
    constructor(){}
    static #raw_data_path = "../../res/ranking"
    #export_data_path = "../../res/ranking/character_ranking.json"
    static ranking_url = "https://obr-sim.bounty-rush.com/socialsv/game/ranking/CharaRankingList.do"

    loadData(json){
        let data = ReadFromJson.readTheOnlyJsonOfFolder(RankingFilter.#raw_data_path)
        return this.getEntries(data);
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
        let url = request['request']['url']
        return url.includes(RankingFilter.ranking_url);
    }

    //getter and modal
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
        let response = data['response']['getContent']['text']
        response = JSON.parse(response);
        let rankingList = response['ranking_list']

        for (let player of rankingList){
            let out = {}
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
/*let filter = new RankingFilter()
let io = filter.loadData()
let response = io[0]['response']['content']['text']
response = JSON.parse(response);
console.log(response['server_time'])*/
