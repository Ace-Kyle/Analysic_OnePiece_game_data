import fs from 'fs'
// TODO enable fs, path again
import path from 'path'

export default class ReadFromJson {
    static JsonPath = Object.freeze({
        CURRENT: '../res/sim_json/data_current',  // Modified to directory paths
        PREVIOUS: '../res/sim_json/data_previous',
    })

    /**
     * Reads JSON data from a directory containing a single JSON file
     * @param {string} dirPath - Path to directory containing JSON file
     * @returns {Object|null} Parsed JSON data or null if error occurs
     * @throws {Error} If directory contains multiple JSON files or no JSON files
     */
    static fromJsonFile(dirPath) {
        try {
            console.time("readJSON_in")

            // Verify directory exists
            if (!fs.existsSync(dirPath)) {
                throw new Error(`Directory does not exist: ${dirPath}`)
            }
            //read file
            const RAW = fs.readFileSync(dirPath, 'utf-8')
            const jsonData = JSON.parse(RAW)

            console.timeEnd("readJSON_in")
            return jsonData

        } catch (e) {
            console.warn("Error when reading JSON file:")
            console.warn(e.toString())
            return null
        }
    }

    /**
     * Reads JSON data from a directory containing a single JSON file
     * @param {string} dirPath - Path to directory containing JSON file
     * @returns {Object|null} Parsed JSON data or null if error occurs
     * @throws {Error} If directory contains multiple JSON files or no JSON files
     */
    static readTheOnlyJsonOfFolder(dirPath){
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory does not exist: ${dirPath}`)
        }

        // Get all JSON files in directory
        const files = fs.readdirSync(dirPath)
            .filter(file => path.extname(file).toLowerCase() === '.json')

        // Check number of JSON files
        if (files.length === 0) {
            throw new Error(`No JSON files found in directory: ${dirPath}`)
        }
        if (files.length > 1) {
            throw new Error(`Multiple JSON files found in directory: ${dirPath}. Expected only one.`)
        }

        // Read and parse the single JSON file
        const filePath = path.join(dirPath, files[0])
        return this.fromJsonFile(filePath)
    }

    /**
     * Gets the name of the JSON file in the directory
     * @param {string} dirPath - Path to directory
     * @returns {string|null} Filename if single JSON file exists, null otherwise
     */
    static getJsonFileName(dirPath) {
        try {
            const jsonFiles = fs.readdirSync(dirPath)
                .filter(file => path.extname(file).toLowerCase() === '.json')

            return jsonFiles.length === 1 ? jsonFiles[0] : null
        } catch (e) {
            console.warn("Error when getting JSON filename:")
            console.warn(e.toString())
            return null
        }
    }

    //static fromJsonFile(dirPath){ return {}}
}
