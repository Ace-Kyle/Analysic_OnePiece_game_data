// Translate JSON traits based on condition/effect pattern translations
import fs from 'fs';

// Function to load pattern mappings from the saved file
function loadPatternMappings() {
    const mappingsData = JSON.parse(fs.readFileSync('../res/translate/pattern_mappings.json', 'utf8'));

    const traitMappings = new Map(mappingsData.traitMappings);
    const conditionValues = new Map(mappingsData.conditionValues);
    const effectValues = new Map(mappingsData.effectValues);
    const effectStructures = new Map(mappingsData.effectStructures);

    return { traitMappings, conditionValues, effectValues, effectStructures };
}

// Function to load translations from TSV files
function loadTranslations(conditionsTsvPath, effectsTsvPath) {
    const conditionTranslations = loadTsvTranslations(conditionsTsvPath);
    const effectTranslations = loadTsvTranslations(effectsTsvPath);

    return { conditionTranslations, effectTranslations };
}

function loadTsvTranslations(tsvFilePath) {
    const tsvContent = fs.readFileSync(tsvFilePath, 'utf8');
    const lines = tsvContent.split('\n');

    // Skip header line
    const translations = new Map();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [id, pattern, original, translated] = line.split('\t');

        // Only add entries that have been translated
        if (translated && translated.trim()) {
            translations.set(pattern, translated);
        }
    }

    return translations;
}

// Function to insert values into a translated pattern
function insertValues(translatedPattern, values) {
    if (!translatedPattern || !values || values.length === 0) return translatedPattern;

    let result = translatedPattern;

    // Replace %{n} placeholders with percentage values
    let percentIndex = 0;
    result = result.replace(/%\{n\}/g, () => {
        if (percentIndex < values.length) {
            return `${values[percentIndex++]}%`;
        }
        return '%{n}';
    });

    // Replace {n} placeholders with numeric values
    let numberIndex = percentIndex;
    result = result.replace(/\{n\}/g, () => {
        if (numberIndex < values.length) {
            return values[numberIndex++];
        }
        return '{n}';
    });

    return result;
}

// Function to reconstruct the effects with the same structure as original
function reconstructEffects(
    effectComponents,
    effectTranslations,
    effectValues,
    originalStructure
) {
    if (!effectComponents || effectComponents.length === 0) return '';

    // Get the translated components
    const translatedComponents = effectComponents.map(component => {
        let translatedText = component.text;

        // Translate if translation exists
        if (component.pattern && effectTranslations.has(component.pattern)) {
            translatedText = insertValues(
                effectTranslations.get(component.pattern),
                effectValues.get(component.text) || []
            );
        }

        // Add back "Cannot Stack" if it was present
        if (component.cannotStack) {
            translatedText += ' (Cannot Stack)';
        }

        return translatedText;
    });

    // Determine how to join the components based on the original structure
    const originalEffect = originalStructure.originalEffect;

    // Check if original had period separators (outside of numbers)
    const hasPeriodSeparators = /(?<!\d)\.\s+/.test(originalEffect);

    // Check if original had "and" connectors
    const hasAndConnectors = / and /.test(originalEffect);

    // Reconstruct based on original structure
    let result = '';

    if (translatedComponents.length === 1) {
        // Single effect, just return it
        result = translatedComponents[0];
    } else if (hasPeriodSeparators && !hasAndConnectors) {
        // Effects were separated by periods
        result = translatedComponents.join('. ');
        // Make sure the final result ends with a period
        if (!result.endsWith('.')) {
            result += '.';
        }
    } else if (hasAndConnectors && !hasPeriodSeparators) {
        // Effects were connected with "and"
        result = translatedComponents.join(' and ');
    } else {
        // Complex case: mix of periods and "and" connectors
        // We need to analyze the original more carefully

        // For simplicity in this implementation, we'll join with periods
        // A more sophisticated approach would try to match the exact original structure
        result = translatedComponents.join('. ');
        if (!result.endsWith('.')) {
            result += '.';
        }
    }

    return result;
}

// Function to translate a single trait
function translateSingleTrait(
    trait,
    traitMappings,
    conditionTranslations,
    effectTranslations,
    conditionValues,
    effectValues,
    effectStructures
) {
    if (!trait || trait.trim() === '') return '';

    const mapping = traitMappings.get(trait);
    if (!mapping) return trait; // Return original if no mapping found

    const structure = effectStructures.get(trait);
    if (!structure) return trait; // Return original if no structure found

    // Get the original condition and effects
    const { conditionPattern, effectPatterns, hasLeadingDash } = mapping;

    // Determine the separator from the original trait
    let separator = ': '; // Default
    if (trait.includes(': ')) {
        separator = ': ';
    } else if (trait.includes(', ')) {
        separator = ', ';
    } else if (trait.includes('; ')) {
        separator = '; ';
    }

    // Get the original parts for translation
    const cleanTrait = trait.trim().replace(/^-\s*/, '');
    let condition = '';

    // Extract condition if it exists
    for (const sep of [': ', ', ', '; ']) {
        if (cleanTrait.includes(sep)) {
            condition = cleanTrait.split(sep)[0];
            break;
        }
    }

    // Translate condition if it exists
    let translatedCondition = '';
    if (condition && conditionPattern && conditionTranslations.has(conditionPattern)) {
        translatedCondition = insertValues(
            conditionTranslations.get(conditionPattern),
            conditionValues.get(condition) || []
        );
    } else if (condition) {
        translatedCondition = condition; // Use original if no translation
    }

    // Translate and reconstruct effects
    const translatedEffect = reconstructEffects(
        effectPatterns,
        effectTranslations,
        effectValues,
        structure
    );

    // Reconstruct the trait
    let translatedTrait = '';
    if (translatedCondition) {
        translatedTrait = `${translatedCondition}${separator}${translatedEffect}`;
    } else {
        translatedTrait = translatedEffect;
    }

    // Add back the leading dash if it was present
    return hasLeadingDash ? `- ${translatedTrait}` : translatedTrait;
}

// Function to translate a trait field that might contain multiple traits
function translateTraitField(
    traitField,
    traitMappings,
    conditionTranslations,
    effectTranslations,
    conditionValues,
    effectValues,
    effectStructures
) {
    if (!traitField || traitField === '') return '';

    // Split by newline to handle multiple traits in one field
    const traitLines = traitField.split('\n');

    // Translate each line
    const translatedLines = traitLines.map(line =>
        translateSingleTrait(
            line,
            traitMappings,
            conditionTranslations,
            effectTranslations,
            conditionValues,
            effectValues,
            effectStructures
        )
    );

    // Join back with newlines
    return translatedLines.join('\n');
}

// Function to translate the JSON file
function translateJsonFile(
    inputFilePath,
    outputFilePath,
    traitMappings,
    conditionTranslations,
    effectTranslations,
    conditionValues,
    effectValues,
    effectStructures
) {
    // Read and parse the JSON file
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    // Translate each character's traits
    const translatedData = jsonData.map(character => {
        const translatedCharacter = { ...character };

        // Translate each trait field
        for (let i = 0; i <= 3; i++) {
            const traitField = `trait${i}`;
            if (character[traitField]) {
                translatedCharacter[traitField] = translateTraitField(
                    character[traitField],
                    traitMappings,
                    conditionTranslations,
                    effectTranslations,
                    conditionValues,
                    effectValues,
                    effectStructures
                );
            }
        }

        return translatedCharacter;
    });

    // Write translated JSON to output file
    fs.writeFileSync(outputFilePath, JSON.stringify(translatedData, null, 2), 'utf8');
    console.log(`Created translated JSON file at ${outputFilePath}`);
}

// Main function
function main() {
    const jsonFilePath = process.argv[2] || '../res/translate/export_character.json';
    const conditionsTsvPath = process.argv[3] || '../res/translate/conditions_to_translate.tsv';
    const effectsTsvPath = process.argv[4] || '../res/translate/effects_to_translate.tsv';
    const outputFilePath = process.argv[5] || '../res/translate/characters_vietnamese.json';

    try {
        const { traitMappings, conditionValues, effectValues, effectStructures } = loadPatternMappings();
        const { conditionTranslations, effectTranslations } = loadTranslations(conditionsTsvPath, effectsTsvPath);

        console.log(`Loaded ${conditionTranslations.size} condition translations and ${effectTranslations.size} effect translations`);

        translateJsonFile(
            jsonFilePath,
            outputFilePath,
            traitMappings,
            conditionTranslations,
            effectTranslations,
            conditionValues,
            effectValues,
            effectStructures
        );
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();