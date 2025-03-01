// First let's read and parse both CSV files
import Papa from 'papaparse';

async function readAndParseCSV(filename) {
    const content = await window.fs.readFile(filename, { encoding: 'utf8' });
    return Papa.parse(content, {
        header: true,
        skipEmptyLines: true
    });
}

// Read both files
const notTranslatedData = await readAndParseCSV('OPBR_Wiki  Character_NotTranslated.csv');
const translatedPartsData = await readAndParseCSV('OPBR_Wiki  Character_TranslatedParts.csv');

// Let's look at a few examples of traits from both files to understand the translation patterns
console.log("Sample from NotTranslated file:");
console.log(notTranslatedData.data[0].trait0);
console.log(notTranslatedData.data[0].trait1);
console.log(notTranslatedData.data[0].trait2);

console.log("\nSample from TranslatedParts file:");
console.log(translatedPartsData.data[0].trait0);
console.log(translatedPartsData.data[0].trait1);
console.log(translatedPartsData.data[0].trait2);

// Let's examine a few more translated examples to understand the pattern
console.log("\nMore translated examples:");
for(let i = 0; i < 3; i++) {
    if(translatedPartsData.data[i].trait0) {
        console.log(`\nExample ${i+1}:`);
        console.log("Original trait0:", notTranslatedData.data[i].trait0);
        console.log("Translated trait0:", translatedPartsData.data[i].trait0);
    }
}