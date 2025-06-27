import { SudokuMaker } from "./Import";
import { PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { EscapePTM } from "../../puzzleTypes/escape/types/EscapePTM";

export const NarrowEscapeIntro: PuzzleDefinitionLoader<EscapePTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            type: PuzzleImportPuzzleType.Escape,
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAOThQoEAO4ACFOgDGceigkBaCZhwJRtEHEYIAFtAIgAwnt4oOuLTIgw%2B6owOjw2E9IwAmEANaMJURg50CXl6NgBPEi0EcIUjdy9fLSxmfgA2OhkLNnQCAG1QAHNMADcUPHwNRhQ6Erg2aoIiAF8aUDqG-gAWVvb6xvw03pAOgYBmYdH%2BMmHisoqqmpH%2B-gAmSZWCdbblzoIZnbnygkXazfwJw9LjyoClqYIenYf8Fufzofe9-Ce%2B77eitcFnczt8DoD5icQbsBp8-gNtvD%2BJcITdTjDkRtvnCMVssQNwbifrMgVDqqCBgCiYSXiiiVSXoiiTiXr9mSTIbdyUSmaz8fwqUdgdzafz9s0ALqZXDoDRwNQIXL4AogGJxfCUYZqgV0KAoYoy-KUGjG41EGjm82mk0W23m1Y0B0OsY0F0up2O11el1dGi%2B31kGiBwP%2Bv1B8NkCVa2JrSiUB0MYS8JUq7VGbKYejoTi6gAeBEoJF9ICg4QLRbocBwhQ4BboYEwbDYRgAxGB2x3khofPwQC24wPqHRZaJvCgAOqYDz6cvx6PqksoGQIKs1nMgMRTmcakgADjoehQmEKegQ5f32mrtY1w%2B7Y8n070s4TI57rcHca0DabrY7nclw7hDAABGEA5PkeQUIGqzkFKeSFtB5AWhKUZRs0QA",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "narrow-escape-intro",
};

const narrowEscapeBossLoadString =
    "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAOThQoEAO4ACFOgDGceigkBaCQgAWigEYR06WiDiN10AiADCa3ig659MiDD44EpgdHhsJ6RgBMIAa0YJKEYOdAl5ejYATxIAHRwAZQQ4HB9hHwiRcXR8CR9MAHNMBHDcCJws0UkYRnQEL0YYVQhVDXyikolMSvVFRBSZDUyZTCgZDhJ9BGiFU28-QP0sZn4ANjoZazY9fABtUAA3ODZGfgAWAF8aI5OzggBma9vT-jJnkGPXgjWPr-v8AAmP53fhEEHffDgm4gYqHFB4fAIEIoOj-dYQgHAmHoghXHGgx6Yt7En6k-DvAmQ-EvLHk6G0-hPKl0mFwhEEZFnNGEqHk5mMgiUwX4GmfXm-FkkqV4j7sxFc1HiyEM5UAgVqjEyoH88nYkWS0Dyzkonkq8nCzWygC6m1w9SgcB6pQIBxAMzm%2BEoHw9YLoUBQxXtrsoNFDoaINEjkfDYaj8cjgJoSaTDxoabTKeT6ZzafONHz%2BbINGLxcLBZLlbI1p9swulAAHHRNKFNOgAOolNQAQWyYl2bpbbE0Zm2A8B51tBj7A72E-ToYeRGtNZhQ5HY9dD0BU%2BE1Vn2%2BTxaIDZXH3Xo7YO1dgIeu5nrrnmYAnOnq6vQBfN-tATu6HuckfX8o2LU8PxAL8rwHO9-wffY9jTIgIwAdjPKd6miDguAg1tsJWfhKBIJtwEwK9TAAYjAKjqOWZEAn4UB1EwGR-BwaRdkIygkxAew2BMQhyLgIThJAS5rmnapsKYli2N0AhOOLHiID4qAKOEkS6A0OAfESTBVnkkgHneMSYV9AhAUoLi6HoYReAHRi61MAMZBSHBCiwugxEwHx1AM4iNCKNQXC9Ij-zcrCvToB16M7Hy1AMyhFOi-x%2BBAcjLMs6iwH0MBSLYCiMsoKiG2oWtPRAbZMHodBOH9AAPAz8xAKBokasL3IIuhcrIgSqMKkraNEFKKL6jKqMGmLvN8kLEsudDohgbRr3gihi0ItauugQNREYNIQFtPZSFLch43ALbCh2va0LEoA";

export const NarrowEscapeBoss: PuzzleDefinitionLoader<EscapePTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            type: PuzzleImportPuzzleType.Escape,
            load: narrowEscapeBossLoadString,
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "narrow-escape-boss",
};

export const NarrowEscapeBossSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            load: narrowEscapeBossLoadString,
        } as PuzzleImportOptions),
    slug: "narrow-escape-boss-source",
};
