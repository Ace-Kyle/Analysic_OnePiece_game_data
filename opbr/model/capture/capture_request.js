import HarRequest from "./har_request.js";
import HarEntry from "./har_entry.js";
import ReadFromJson from "../../io/read_from_json.js";
import RankingFilter from "../../export/ranking_filter2.js";

export  default class CaptureRequest {
    //capture request object from HAR file
    constructor(rawHAR={}) {
        this.rawHAR = rawHAR;
        this.entries = this.getEntries()
    }

    /**
     * Filter valid ranking requests from HAR getData
     * @returns {Array} Valid ranking requests
     */
    getEntries() {
        try {
            let entries = this.rawHAR['log']['entries'];
            //convert array of raw io to array of HarRequest objects
            let entryList = entries.map(entry => new HarEntry(entry));

            console.log(`Complete | Found ${entries.length} valid ranking requests`);
            return entryList;
        } catch (e) {
            console.error(e);
            return []
        }
    }
    //filter capture request that url matches the pattern
    filterByPattern(pattern){ return this.entries.filter(entry => entry.isMatchPattern(pattern));}
}

//test
/*
let io = ReadFromJson.readTheOnlyJsonOfFolder('../../res/ranking')
let rank = new CaptureRequest(io).filterByPattern("https://obr-sim.bounty-rush.com/socialsv/game/ranking/CharaRankingList.do")
console.log(rank[0].getData())*/
