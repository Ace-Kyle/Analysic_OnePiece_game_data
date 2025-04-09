import ReadFromJson from "../data/read_from_json.js";
import CaptureRequest from "./capture/capture_request.js";
import fs from "fs";
import League from "./league.js";

class RankingFilter {
    constructor(
        //FIXME edit characterDataPath
        characterDataPath = "../res/characters/characters_data.json",
        outlierThreshold = 5, // Standard deviations for outlier detection, 2.5 as default
        newCharacterMinPlayers = 100, // Minimum number of players to consider a character as established
        exportPath = "../res/export/character_ranking.json"
    ) {
        this.characterDataPath = characterDataPath;
        this.outlierThreshold = outlierThreshold;
        this.newCharacterMinPlayers = newCharacterMinPlayers;
        this.#export_data_path = exportPath;
        this.characterMetaData = null; //final result
    }

    static #raw_data_path = "../res/ranking";
    #export_data_path;
    static ranking_url = "https://obr-sim.bounty-rush.com/socialsv/game/ranking/CharaRankingList";

    /**
     * Main method to generate character ranking getData
     * @returns {Object} Final character ranking getData
     */
    generateRankingData() {
        // Step 1: Load HAR getData and character metadata
        const rankingRequests = this.loadData();
        //this.loadCharacterMetadata();

        // Step 2: Process ranking getData
        const characterRankings = this.processRankingRequests(rankingRequests);

        // Step 3: Calculate average points and apply outlier detection and Add metadata
        const rankedCharacters = this.calculateCharacterRanking(characterRankings);

        // Step 4. Calculate League data
        const leagueData = this.calculateLeagueRanking(rankedCharacters)

        // Step 5: Minify data
        const minify = this.minifyRankingData(leagueData);

        // Step 6: Export to JSON
        this.exportToJson(minify);

        return minify;
    }

    /**
     * Load HAR getData from file
     * @returns {Array} Valid ranking requests
     */
    loadData() {
        let data = ReadFromJson.readTheOnlyJsonOfFolder(RankingFilter.#raw_data_path);
        return new CaptureRequest(data).filterByPattern(RankingFilter.ranking_url)
    }

    /**
     * Load character metadata from file
     */
    loadCharacterMetadata() {
        try {
            this.characterMetaData = ReadFromJson.fromJsonFile(this.characterDataPath);
            console.log("Character metadata loaded successfully");
        } catch (error) {
            console.error("Failed to load character metadata:", error);
            this.characterMetaData = {};
        }
    }

    /**
     * Process all ranking requests to extract character getData
     * @param {Array} requests Ranking requests
     * @returns {Object} Character rankings getData
     */
    processRankingRequests(requests) {
        const characterRankings = {};

        for (let request of requests) {
            try {
                let bodyData = request.getBodyData()
                // Extract character ID and season information
                const charaId = this._getCharaId(bodyData);
                const season = this._getSeason(bodyData);
                console.warn("-Character ID: ", charaId)

                // Skip if we couldn't extract character ID
                if (!charaId) continue;

                // Initialize character getData if not exists
                if (!characterRankings[charaId]) {
                    characterRankings[charaId] = {
                        chara_id: charaId,
                        season: season,
                        players: [],
                        totalPoints: 0,
                        averagePoints: 0,
                        medianPoints: 0,
                        playerCount: 0
                    };
                }

                // Extract player points
                const playerPoints = this._getPlayerPoints(bodyData);
                if (playerPoints && playerPoints.length > 0) {
                    characterRankings[charaId].players = playerPoints;
                    characterRankings[charaId].playerCount = playerPoints.length;
                }
            } catch (error) {
                console.error(`Error processing request:`, error);
            }
        }

        console.log(`Processed data for ${Object.keys(characterRankings).length} characters`);
        return characterRankings;
    }

    /**
     * Calculate rankings for all characters with outlier detection
     * @param {Object} characterRankings Raw character rankings
     * @returns {Array} Sorted array of character rankings
     */
    calculateCharacterRanking(characterRankings) {
        const characters = Object.values(characterRankings);

        // Calculate statistics for each character
        characters.forEach(character => {
            // Get points array and sort it
            const points = character.players.map(p => p.character_point).sort((a, b) => a - b);

            if (points.length === 0) {
                character.averagePoints = 0;
                character.medianPoints = 0;
                character.adjustedAveragePoints = 0;
                return;
            }

            // Calculate median
            const mid = Math.floor(points.length / 2);
            character.medianPoints = points.length % 2 === 0
                ? (points[mid - 1] + points[mid]) / 2
                : points[mid];

            // Calculate mean and standard deviation
            const sum = points.reduce((acc, point) => acc + point, 0);
            const mean = sum / points.length;

            const squaredDiffs = points.map(p => Math.pow(p - mean, 2));
            const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / points.length;
            const stdDev = Math.sqrt(variance);

            // Detect and remove outliers (auto clickers)
            const validPoints = points.filter(p =>
                Math.abs(p - mean) <= this.outlierThreshold * stdDev
            );

            // Calculate adjusted average
            let adjustedAverage = 0;
            if (validPoints.length > 0) {
                adjustedAverage = validPoints.reduce((acc, val) => acc + val, 0) / validPoints.length;
            }

            // Handle new characters (with few players)
            //const isNewCharacter = character.playerCount < this.newCharacterMinPlayers;

            character.totalPoints = sum;
            character.averagePoints = mean;
            character.adjustedAveragePoints = adjustedAverage;
            character.standardDeviation = stdDev;
            character.outlierCount = points.length - validPoints.length;
            //character.isNewCharacter = isNewCharacter;

            //remove players data
            //delete character.players

            // Add character metadata
            //this.addCharacterMetadata(character);
        });

        // Sort characters by adjusted average points (descending)
        return characters.sort((a, b) => b.adjustedAveragePoints - a.adjustedAveragePoints);
    }

    calculateLeagueRanking(rankings) {
        const characters = Object.values(rankings);
        // prepare list of league ids, add 'count' property
        let listLeague = League.getListOfLeagues().map(({id, name, count=0}) => ({id, name,count}))

        // Calculate statistics for each character
        characters.forEach(character => {
            // Get points array and sort it
            const leagueIds = character.players.map(p => p.league_id);
            let result = structuredClone(listLeague); //deep copy
            //console.log(result);

            result.forEach( league => {
                let count = leagueIds.filter(id => league.id === id);
                league.count = count.length
            })
            //add to characters data
            character.league_counter = result;

            // Add character metadata
            //this.addCharacterMetadata(character);
        });

        // Sort characters by adjusted average points (descending)
        return characters;
    }

    /**
     * Add character metadata (role, element, rarity)
     * @param {Object} character Character object
     */
    addCharacterMetadata(character) {
        if (!this.characterMetaData) return;

        const metadata = this.characterMetaData[character.chara_id];
        if (metadata) {
            character.name = metadata.name || `Character ${character.chara_id}`;
            character.role = metadata.role || "Unknown";
            character.element = metadata.element || "Unknown";
            character.rarity = metadata.rarity || "Unknown";
            character.releaseDate = metadata.releaseDate || "Unknown";
            // Add any other metadata you have
        }
        let chara = {
            chara_id: 0,
            name:"",
            nickname:"",
            className:"",
            elementName:"",
            character_rank:0,
            character_point:0,
            league_counter:{
                "SS":0,
                "S+":0,
                "S":0,
                "A+":0,
                "A":0,
            }

        }
    }

    minifyRankingData(characterRankings){


        const characters = Object.values(characterRankings);
        let data = characters.map(
            ({chara_id, adjustedAveragePoints, totalPoints, league_counter}) =>
            ({chara_id, adjustedAveragePoints, totalPoints, league_counter}))
        return data;

    }

    /**
     * Export final rankings to JSON file
     * @param {Array} rankedCharacters Sorted array of character rankings
     */
    exportToJson(rankedCharacters) {
        try {
            const output = {
                generated_at: new Date().toISOString(),
                season: rankedCharacters[0]?.season || "Unknown",
                total_characters: rankedCharacters.length,
                characters: rankedCharacters
            };

            // Assuming there's a method to write JSON in your system
            // You may need to adjust this based on your actual implementation
            //const fs = import('fs')
            fs.writeFileSync(this.#export_data_path, JSON.stringify(output, null, 2));

            console.log(`Exported rankings to ${this.#export_data_path}`);
        } catch (error) {
            console.error("Failed to export rankings:", error);
        }
    }

    // Helper methods to extract getData from requests
    _getSeason(data) {
        try {
            return data['ranking_data']['ranking_data']['term_id'] || -1;
        } catch (error) {
            return -1;
        }
    }

    _getCharaId(data) {
        try {
            return data['ranking_data']['chara_id'];
        } catch (error) {
            return null;
        }
    }

    _getPlayerPoints(data) {
        try {
            const rankingList = data['ranking_list'] || [];
            //console.warn("Ranking list data:", rankingList);

            return rankingList.map(player => ({
                character_ranking : player['ranking_rank'],
                character_point   : player['ranking_point'],
                league_id         : player['league_id'],
                league_point      : player['league_point'],
            }));
        } catch (error) {
            console.error("Failed to get ranking list:", error);
            return [];
        }
    }

    _getServerTime(){ return Date.now(); }
}

// Export the class
export default RankingFilter;

// Usage example:
const filter = new RankingFilter();
 const rankings = filter.generateRankingData();
 //console.log(`Top character: ${rankings[0].name} with ${rankings[0].adjustedAveragePoints.toFixed(2)} points`);

//let result =  filter.processRankingRequests(filter.loadData())
//Export2JSON.saveToFile(result, 'character_ranking', '../../res/export')