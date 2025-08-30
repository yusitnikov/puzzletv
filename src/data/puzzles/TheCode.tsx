import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { Chameleon } from "../authors";
import { isEnglishWord, isPalindrome, parseVowels } from "../../utils/language";
import { CrackTheCodePTM } from "../../puzzleTypes/crack-the-code/types/CrackTheCodePTM";
import { CrackTheCodeGridSize } from "../../puzzleTypes/crack-the-code/types/CrackTheCodeGridSize";
import { CrackTheCodeTypeManager } from "../../puzzleTypes/crack-the-code/types/CrackTheCodeTypeManager";

const normalizeCode = (code: string) => code.toLowerCase().replaceAll("-", "").replaceAll(/\W+/g, " ").trim();

const splitWords = (code: string): string[] => (code === "" ? [] : code.split(" "));

const concatWords = (code: string) => code.replaceAll(" ", "");

const isAlternatingVowels = (word: string) => {
    const letters = parseVowels(word);

    return letters.every(({ letter, isVowel }, index) => {
        const prevLetter = letters[index - 1];
        return prevLetter === undefined || prevLetter.letter === letter || prevLetter.isVowel !== isVowel;
    });
};

export const TheCode: PuzzleDefinition<CrackTheCodePTM> = {
    noIndex: true,
    slug: "the-code",
    title: {
        [LanguageCode.en]: "The code",
    },
    author: Chameleon,
    typeManager: CrackTheCodeTypeManager,
    gridSize: CrackTheCodeGridSize,
    extension: {
        conditions: [
            // 4 words
            (code) => splitWords(normalizeCode(code)).length === 4,

            // Words lengths form a renban
            (code) => {
                code = normalizeCode(code);
                const wordLengths = splitWords(code).map((word) => word.length);
                const uniqueWordLength = [...new Set(wordLengths)].sort((a, b) => a - b);

                // Unique word lengths are enough for 0.5
                if (wordLengths.length === 0 || uniqueWordLength.length !== wordLengths.length) {
                    return 0;
                }

                // Word lengths should form a renban for 1
                return uniqueWordLength[uniqueWordLength.length - 1] - uniqueWordLength[0] ===
                    uniqueWordLength.length - 1
                    ? 1
                    : 0.5;
            },

            // Doubled letters
            (code) => {
                code = normalizeCode(code);

                const concat = concatWords(code);

                // At least one doubled letter is enough for 0.5, even if it's cross words
                if (!/(\w)\1/.test(concat)) {
                    return 0;
                }

                // For the 1, need to have exactly one doubled letter, it should be not cross words, and there should be no triple letters
                return [...concat.matchAll(/(\w)\1/g)].length === 1 &&
                    !/(\w)\1\1/.test(concat) &&
                    splitWords(code).some((word) => /(\w)\1/.test(word))
                    ? 1
                    : 0.5;
            },

            // Palindrome
            (code) => {
                code = normalizeCode(code);
                // The whole code should be a palindrome for 0.5
                if (code === "" || !isPalindrome(concatWords(code))) {
                    return 0;
                }
                // No particular word is allowed to be a palindrome for 1
                return splitWords(code).some(isPalindrome) ? 0.5 : 1;
            },

            // Only English words
            (code) => {
                code = normalizeCode(code);
                const words = splitWords(code);
                return words.length !== 0 && words.every(isEnglishWord);
            },

            // Alternate vowels with consonants
            (code) => {
                code = normalizeCode(code);

                return code === "" || !splitWords(code).every(isAlternatingVowels)
                    ? 0
                    : isAlternatingVowels(concatWords(code))
                      ? 1
                      : 0.5;
            },

            // The letters set is DENORV
            (code) => {
                code = concatWords(normalizeCode(code));
                if (!/^[denorv]+$/.test(code)) {
                    return 0;
                }
                const uniqueLetters = [...new Set(code.split(""))].sort().join("");
                return uniqueLetters === "denorv" ? 1 : 0.5;
            },

            // Only English letters and spaces, no extra spaces
            // (code) => /^[a-z ]+$/i.test(code) && code.toLowerCase() === normalizeCode(code),

            // Capitalization
            // (code) => code !== "" && code === code[0].toUpperCase() + code.substring(1).toLowerCase(),
        ],
    },
};
