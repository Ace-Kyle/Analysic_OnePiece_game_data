// Extract unique patterns from multiple trait fields and create a TSV file
import fs from 'fs';

// Function to split a trait into condition and effect parts
function splitTraitParts(text) {
    if (!text || text.trim() === '') return { condition: '', effect: '' };

    // Remove leading dashes and whitespace that appear in trait fields
    let cleanText = text.trim().replace(/^-\s*/, '');

    // Common condition patterns with their separators
    const conditionSeparators = [
        ': ', // Most common pattern "When X: Y"
        ', ', // For patterns like "When X, Y"
        '; '  // For patterns like "When X; Y"
    ];

    // Try to split by each separator
    for (const separator of conditionSeparators) {
        const parts = cleanText.split(separator);
        // Check if split produced at least 2 parts
        if (parts.length >= 2) {
            // First part is the condition
            const condition = parts[0];
            // Rest is the effect (joining in case there were multiple separators)
            const effect = parts.slice(1).join(separator);
            return { condition, effect };
        }
    }

    // If no standard separator is found, assume it's all effect (no condition)
    return { condition: '', effect: cleanText };
}

// Function to split complex effects into individual effect components
function splitEffects(effectText) {
    if (!effectText || effectText.trim() === '') return [];

    // First handle period-separated effects
    // But be careful not to split on periods that are part of numbers (e.g., "1.5")
    const periodSplitEffects = [];

    // Split by periods but ignore periods in numbers
    const periodRegex = /(?<!\d)\.\s+/g;
    const periodParts = effectText.split(periodRegex).filter(part => part.trim() !== '');

    // Process each period-separated part
    periodParts.forEach(periodPart => {
        // Now check for "and" separated effects within each period part
        if (/ and /.test(periodPart)) {
            // Don't split if the "and" is inside parentheses (common in complex descriptions)
            const inParentheses = /\([^)]*and[^)]*\)/g;
            let tempPart = periodPart;
            const parenthesesMatches = [];

            // Extract and temporarily replace content in parentheses
            let match;
            let replaceIndex = 0;
            while ((match = inParentheses.exec(tempPart)) !== null) {
                const placeholder = `__PAREN${replaceIndex}__`;
                parenthesesMatches.push({ placeholder, content: match[0] });
                tempPart = tempPart.replace(match[0], placeholder);
                replaceIndex++;
            }

            // Split by "and" now that parentheses content is protected
            const andParts = tempPart.split(/ and /).filter(part => part.trim() !== '');

            // Restore parentheses content
            andParts.forEach(andPart => {
                let restoredPart = andPart;
                parenthesesMatches.forEach(({ placeholder, content }) => {
                    restoredPart = restoredPart.replace(placeholder, content);
                });

                // Handle "Cannot Stack" notation separately
                const cannotStackRegex = /\s*\(Cannot Stack\)/i;
                const hasCannotStack = cannotStackRegex.test(restoredPart);

                // Remove the "Cannot Stack" for pattern creation, but store this info
                const cleanEffect = restoredPart.replace(cannotStackRegex, '').trim();
                periodSplitEffects.push({
                    text: cleanEffect,
                    cannotStack: hasCannotStack
                });
            });
        } else {
            // Handle "Cannot Stack" notation
            const cannotStackRegex = /\s*\(Cannot Stack\)/i;
            const hasCannotStack = cannotStackRegex.test(periodPart);

            // Remove the "Cannot Stack" for pattern creation, but store this info
            const cleanEffect = periodPart.replace(cannotStackRegex, '').trim();
            periodSplitEffects.push({
                text: cleanEffect,
                cannotStack: hasCannotStack
            });
        }
    });

    return periodSplitEffects;
}

// Function to convert text to a pattern by replacing numbers with placeholders
function createPattern(text) {
    if (!text || text.trim() === '') return '';

    // Replace percentages with %{n} placeholder
    let pattern = text.replace(/(\d+)%/g, '%{n}');

    // Replace other numbers with {n} placeholder
    pattern = pattern.replace(/\b(\d+(?:\.\d+)?)\b/g, '{n}');

    return pattern;
}

// Function to convert a pattern back to regex for matching
function patternToRegex(pattern) {
    if (!pattern) return null;

    // Escape special regex characters except for our placeholders
    let regexStr = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        // Replace %{n} with regex to match percentages
        .replace(/%\{n\}/g, '(\\d+(?:\\.\\d+)?)%')
        // Replace {n} with regex to match any number
        .replace(/\{n\}/g, '(\\d+(?:\\.\\d+)?)');

    return new RegExp(`^${regexStr}$`);
}

// Function to extract values from a text using a pattern
function extractValues(text, pattern) {
    if (!text || !pattern) return [];

    const regex = patternToRegex(pattern);
    if (!regex) return [];

    const match = text.match(regex);

    if (!match) return [];

    // Skip the first element (full match) and return the captured groups
    return match.slice(1);
}

// Function to process the JSON file and extract unique patterns
function processJsonFile(inputFilePath) {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(inputFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // Maps to store unique condition and effect patterns
    const conditionMap = new Map();
    const effectMap = new Map();
    let conditionId = 1;
    let effectId = 1;

    // Map to store original trait -> condition/effect pattern mappings
    const traitMappings = new Map();

    // Maps to store extracted values
    const conditionValues = new Map();
    const effectValues = new Map();

    // Map to store effect structure
    const effectStructures = new Map();

    // Process each character's traits
    jsonData.forEach(character => {
        // Process each trait field: trait0, trait1, trait2, trait3
        for (let i = 0; i <= 3; i++) {
            const traitField = `trait${i}`;
            const traitContent = character[traitField];

            if (!traitContent || traitContent === '') continue;

            // Split multiple traits in a single field (they are separated by newline and start with a dash)
            const traitLines = traitContent.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            traitLines.forEach(trait => {
                // Split trait into condition and effect
                const { condition, effect } = splitTraitParts(trait);

                // Split effects into individual components
                const effectComponents = splitEffects(effect);

                // Create condition pattern
                const conditionPattern = condition ? createPattern(condition) : '';

                // Create effect pattern mapping
                const effectPatterns = effectComponents.map(component => {
                    const pattern = createPattern(component.text);

                    // Add effect pattern if not already present
                    if (pattern && !effectMap.has(pattern)) {
                        effectMap.set(pattern, {
                            id: `E${effectId++}`,
                            pattern: pattern,
                            original: component.text,
                            translated: ''
                        });
                    }

                    // Store extracted values
                    if (pattern && !effectValues.has(component.text)) {
                        effectValues.set(component.text, extractValues(component.text, pattern));
                    }

                    return {
                        text: component.text,
                        pattern,
                        cannotStack: component.cannotStack
                    };
                });

                // Store original trait mapping
                traitMappings.set(trait, {
                    original: trait,
                    conditionPattern,
                    effectPatterns,
                    hasLeadingDash: trait.trim().startsWith('-')
                });

                // Store effect structure for reconstruction
                effectStructures.set(trait, {
                    originalEffect: effect,
                    components: effectComponents
                });

                // Add condition pattern if not empty and not already present
                if (conditionPattern && !conditionMap.has(conditionPattern)) {
                    conditionMap.set(conditionPattern, {
                        id: `C${conditionId++}`,
                        pattern: conditionPattern,
                        original: condition,
                        translated: ''
                    });

                    // Store extracted values
                    if (!conditionValues.has(condition)) {
                        conditionValues.set(condition, extractValues(condition, conditionPattern));
                    }
                }
            });
        }
    });

    // Save mappings to a file for later use
    fs.writeFileSync('../res/translate/pattern_mappings.json', JSON.stringify({
        traitMappings: Array.from(traitMappings.entries()),
        conditionValues: Array.from(conditionValues.entries()),
        effectValues: Array.from(effectValues.entries()),
        effectStructures: Array.from(effectStructures.entries())
    }, null, 2), 'utf8');

    return {
        conditions: Array.from(conditionMap.values()),
        effects: Array.from(effectMap.values())
    };
}

// Function to write patterns to TSV files
function createTsvFiles(patterns, conditionsOutputPath, effectsOutputPath) {
    // Create TSV header
    const header = 'id\tpattern\toriginal_example\tvietnam_version\n';

    // Create conditions TSV
    let conditionsTsv = header;
    patterns.conditions.forEach(pattern => {
        conditionsTsv += `${pattern.id}\t${pattern.pattern}\t${pattern.original}\t${pattern.translated}\n`;
    });

    // Create effects TSV
    let effectsTsv = header;
    patterns.effects.forEach(pattern => {
        effectsTsv += `${pattern.id}\t${pattern.pattern}\t${pattern.original}\t${pattern.translated}\n`;
    });

    // Write to files
    fs.writeFileSync(conditionsOutputPath, conditionsTsv, 'utf8');
    console.log(`Created conditions TSV file at ${conditionsOutputPath} with ${patterns.conditions.length} unique patterns`);

    fs.writeFileSync(effectsOutputPath, effectsTsv, 'utf8');
    console.log(`Created effects TSV file at ${effectsOutputPath} with ${patterns.effects.length} unique patterns`);
}

// Main function
function main() {
    const inputFilePath = process.argv[2] || '../res/translate/character_list.json';
    const conditionsOutputPath = process.argv[3] || '../res/translate/conditions_to_translate.tsv';
    const effectsOutputPath = process.argv[4] || '../res/translate/effects_to_translate.tsv';

    try {
        const patterns = processJsonFile(inputFilePath);
        createTsvFiles(patterns, conditionsOutputPath, effectsOutputPath);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();