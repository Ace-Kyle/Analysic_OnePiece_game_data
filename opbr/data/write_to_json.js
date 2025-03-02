import fs from 'fs'


export default class Export2JSON {

    static #defaultPath = '../res/export'
    static #defaultOutput = 'cleaned_data.json';
    //list of files
    static Export2File = Object.freeze({
        CHARACTER: 'export_character',
        SKILL: 'export_skill',
        MEDAL: 'export_medal',
        CHARACTER_PROFILE:'export_character_profile',
    })


    static saveToFile(inputData, filename=this.#defaultOutput, path=this.#defaultPath){
        let exportPath = `${path}/${filename}.json`;
        try {
            console.time('saveToJSON_in')
            fs.writeFileSync(
                exportPath,
                JSON.stringify(inputData, null, 2),
                'utf8'
            );
            console.timeEnd('saveToJSON_in');
            console.log('Data successfully saved!');
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