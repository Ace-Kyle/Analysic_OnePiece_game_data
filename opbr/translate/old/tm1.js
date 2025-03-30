import Papa from 'papaparse';

async function readAndParseCSV(filename) {
    const content = await window.fs.readFile(filename, { encoding: 'utf8' });
    return Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });
}

// Read both files
const notTranslatedData = await readAndParseCSV('OPBR_Wiki  Character_NotTranslated.csv');
const translatedPartsData = await readAndParseCSV('OPBR_Wiki  Character_TranslatedParts.csv');

// Create a map of existing translations to learn from the patterns
const translationMap = new Map();
translatedPartsData.data.forEach(row => {
    if (row.chara_id) {
        translationMap.set(row.chara_id, {
            trait0: row.trait0,
            trait1: row.trait1,
            trait2: row.trait2
        });
    }
});

// Let's create the translated getData
const translatedData = notTranslatedData.data.map(row => {
    const existingTranslation = translationMap.get(row.chara_id);

    // Create a new row with only the required columns
    return {
        chara_id: row.chara_id,
        name: row.name,
        trait0: row.trait0,
        trait1: row.trait1,
        trait2: row.trait2,
        trait0_translated: existingTranslation?.trait0 || '',
        trait1_translated: existingTranslation?.trait1 || '',
        trait2_translated: existingTranslation?.trait2 || ''
    };
});

// Show some examples of the translation patterns
console.log("Translation Examples:");
for(let i = 0; i < 5; i++) {
    if(translatedData[i].trait0_translated) {
        console.log("\nExample for character:", translatedData[i].name);
        console.log("Original trait0:", translatedData[i].trait0);
        console.log("Translated trait0:", translatedData[i].trait0_translated);
    }
}

// Create the CSV getContent
const csvContent = Papa.unparse(translatedData);
console.log("\nFirst 500 characters of CSV getContent:");
console.log(csvContent.substring(0, 500));