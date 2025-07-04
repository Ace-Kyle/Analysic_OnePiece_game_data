import fs from 'fs'


export default class Export2JSON {

    static #defaultExportPath = '../res/export'
    static #defaultOutput = 'cleaned_data';
    //list of files
    static Export2File = Object.freeze({
        CHARACTER: 'character_list',
        CHARACTER_RANKING: 'character_ranking',
        SKILL: 'character_skill',
        MEDAL: 'medal_list',
        CHARACTER_PROFILE:'character_profile',
    })


    static saveToFile(inputData, filename=this.#defaultOutput, path=this.#defaultExportPath){
        let exportPath = `${path}/${filename}.json`;
        try {
            console.time('saveToJSON_in')
            fs.writeFileSync(
                exportPath,
                JSON.stringify(inputData, null, 2),
                'utf8'
            );
            console.timeEnd('saveToJSON_in');
            console.log(`Data successfully saved! -> ${exportPath}`);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    }

    cleanData(inputData) {
        //unused
        return inputData.map(item => ({
            id: item.id,
            name: item.name?.trim(),
            score: Number(item.score) || 0,
        }))
    }
}