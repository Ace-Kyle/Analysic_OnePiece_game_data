import Papa from 'papaparse';
import _ from 'lodash';

async function readAndParseCSV(filename) {
    const content = await window.fs.readFile(filename, { encoding: 'utf8' });
    return Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });
}

// Common translation patterns
const translations = {
    // Status effects
    'Nullify': 'Miễn nhiễm',
    'Shock': 'Shock',
    'Stun': 'Stun',
    'Freeze': 'Đóng băng',
    'Entrance': 'Mê hoặc',
    'Confusion': 'Choáng',
    'Tremor': 'Rung',
    'Daze': 'Chóng mặt',
    'Negative': 'Suy yếu',

    // Locations
    'in the area around your enemy\'s Treasure': 'ở vùng cờ đối thủ',
    'in the area around your captured Treasure': 'ở vùng cờ đã chiếm',
    'in the area around your treasure': 'ở vùng cờ của bạn',
    'in your captured treasure area': 'trong vùng cờ đã chiếm',

    // Stats and effects
    'damage dealt': 'sát thương gây ra',
    'damage received': 'sát thương nhận vào',
    'DEF': 'DEF',
    'ATK': 'ATK',
    'CRIT': 'CRIT',
    'HP Recovery': 'Hồi HP',
    'SPEED': 'tốc độ',
    'Skill Cooldown': 'hồi chiêu',

    // Conditions
    'When': 'Khi',
    'After': 'Sau khi',
    'while': 'trong khi',
    'for': 'trong',
    'second(s)': 's',
    'Cannot Stack': 'không cộng dồn'
};

function translateTrait(trait) {
    if (!trait) return '';

    // Split into lines while preserving bullets
    let lines = trait.split('\n');

    return lines.map(line => {
        let translated = line.trim();

        // Preserve bullet point if exists
        const hasBullet = translated.startsWith('- ');
        if (hasBullet) {
            translated = translated.substring(2);
        }

        // Apply translations
        Object.entries(translations).forEach(([eng, viet]) => {
            const regex = new RegExp(eng, 'gi');
            translated = translated.replace(regex, viet);
        });

        // Clean up percentages
        translated = translated.replace(/(\d+)%/g, '$1%');

        // Clean up durations
        translated = translated.replace(/for (\d+) second\(s\)/g, 'trong $1s');

        // Add bullet back if it existed
        return hasBullet ? `- ${translated}` : translated;

    }).join('\n');
}

// Read and process both files
const notTranslatedData = await readAndParseCSV('OPBR_Wiki  Character_NotTranslated.csv');
const translatedPartsData = await readAndParseCSV('OPBR_Wiki  Character_TranslatedParts.csv');

// Create map of existing translations
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

// Process all characters
const translatedData = notTranslatedData.data.map(row => {
    const existingTranslation = translationMap.get(row.chara_id);

    return {
        chara_id: row.chara_id,
        name: row.name,
        trait0_en: row.trait0,
        trait1_en: row.trait1,
        trait2_en: row.trait2,
        trait0: existingTranslation?.trait0 || translateTrait(row.trait0),
        trait1: existingTranslation?.trait1 || translateTrait(row.trait1),
        trait2: existingTranslation?.trait2 || translateTrait(row.trait2)
    };
});

// Create CSV
const csvContent = Papa.unparse(translatedData);

// Log some statistics and sample
console.log(`Total characters processed: ${translatedData.length}`);
console.log("\nSample translations (first 3 characters):");
translatedData.slice(0, 3).forEach(char => {
    console.log(`\nCharacter: ${char.name}`);
    console.log("Trait 0 (EN):", char.trait0_en);
    console.log("Trait 0 (VN):", char.trait0);
});

// Output full CSV getContent
console.log("\nFull CSV getContent:");
console.log(csvContent);