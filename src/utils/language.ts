import words from "an-array-of-english-words";

const englishWordsSet = new Set(words);

export const isEnglishWord = (word: string) => englishWordsSet.has(word.toLowerCase());

const simpleVowels: string[] = ["e", "u", "i", "o", "a"];

export interface VowelInfo {
    letter: string;
    isVowel: boolean;
}

export const isVowel = (letter: string, nextLetter: string | undefined) =>
    letter === "y" ? nextLetter === undefined || !simpleVowels.includes(nextLetter) : simpleVowels.includes(letter);

export const parseVowels = (word: string): VowelInfo[] =>
    word.split("").map((letter, index) => ({
        letter,
        isVowel: isVowel(letter, word[index + 1]),
    }));

export const isPalindrome = (word: string) => word.split("").reverse().join("") === word;
