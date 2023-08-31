import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const ChessMoves: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        load: "N4IgzglgXgpiBcA2ANCALhNAbO8QGEALGMMAAgFkB7ANxJFQEMBXNQqgJwRACUWBbAA5ZGAOxhdUHZjjAw03ALRkAcp36MsZRAA9EZMMwAmVANbMy02WUaDhATwB0ZADqjlAZTRijjDkbIAQQ4OKgB3MEc3ZQARCABzTDBkMjDCCABjQhsOGBsDCFF4nDJTUQTCNABycn5aPNs/NDIMsSrmgCM8tjywRn4YRwYQeI4IIwQAbUngAF9kOYX5xZXZgF1kGeXtpd25ja29ndWD1aOj0+Orpcvzs/2NkDEMMoqFeDRpGCYQ8KnQLCFejwaa8ABM+AAjMMeABmfBgkBrR4ZGBYLBgKbgqFI5YgQHiTEgya8eGwmEAFgRMIArDjkahUeiiSS4fhyWs8QTgaCeHTyageFSBaT8BSkSi0RisXz2biFvigSzWVTEDD4TSYRDxYLIXKGSAmdKQbxVfKAUqpqzEGLabbBVSdab8JqDUaWbwbeLOY8wFQsKwIFRRFMKchYcgwcgacgUJDkPGUDGoxGw3HkGGI1GY8nwxmE7HI9HC/HM3mw4ni2DOUA==",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "chess-moves",
};
