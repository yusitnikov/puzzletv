import { FPuzzles } from "./Import";
import { ColorsImportMode, PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/puzzle/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";

const rushHourLoadString =
    "N4IgzglgXgpiBcA2ANCALhNAbO8QCUBXMACwAISB7QgJzLEIBNKBrQkVAQ0LSpoRABhEpwC2MHJQB2HEDUI4wMNAIBylGqM5Z6TVoTLzFZTgAdTWAJ7wyFzgGMYZRhADmmMGQCMAWkRkIKTRKMhgANxgaS0NKAHdkMntKLEJRKRMpRjIAZgAPACYyACNKXITpR1CHEgA6AB0pABUSSKdOGid7ds9pMl4nVxoIRgTOTL6W6K6aKLJ3CPSXdzQwGrJmzu7E6iwsoqdRSgisgDMNWPassb2HFguaLMCJmAg6Fw77DGkEop5nqbGUkoaGcQwiExo1Fc5DGwJadGmZA0EKh5H6cyGew0jEiZAAFP0AVIgSCYGAuqYnCdIaJnhjhgBKNYbOYQBbONweJHpdHTTyMMFOYKuZTwsixTBolqJdr1KQAVSUdMO4N+aGC6TxABYTDM4mAGWQznQVYFXHS+WsAIJYMAhSzUGXpEjDIXSvnFaKmDpgSBSc3oywSLBxGV0NUamqyQbDBAAbTjwAAvshQGFtIRcF5UPMYDJ4Gh5DBUPYBABiAAiAAZqwAxWuyexWmacSzxkCVmtV+sgAC6KbTGazObZeYQhczJfL9atVdnjebNFb7bLM7nVb7A63qaTveQiYHIFLeE7dYbJcXy/gcY71bPm9TR+ntdn84vLbb147a/n/Z3j/TFJcC1EcFnHIspxPesAFEq0QDd3yXT8b1XWtYPgh9QGPb80LghCj0vZCcPQjd+z3RMQEAzMEGzEBc3zCdiyfE8ACFu1rNiFw/Fc2PrTi/0HICEHyUCxwLCDmI7XiOPwptuK/MtpP4w8qNwES6NHBiJOw1DX1kwiVx/Ujtyw58AA52K4pDDNrCyewEyihxo0StMnSTT0sxCrxQu9LLI/dBOo+AQI0sDxLcnT6z4/T5JQqKZMwxyhKQFzwIi59oqs7ycMyhzVIQbJUvCpjIqizivKI1DcpMpKgsK0KxMYyCcLs88CNilq/JUpz4AAViKpr3N8nsKpXYaG38ij8pShrXJK8srTMxbFqyyrlqWszMJM7byMC4CBu0haNpW0aFPWlaBO2gCeto+i0pKgyFKU4zruS+q7uK06UOezde37IA==";

export const RushHour: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.RushHour,
            noSpecialRules: true,
            load: rushHourLoadString,
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "rush-hour",
};

export const RushHourSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            colorsImportMode: ColorsImportMode.Initials,
            load: rushHourLoadString,
        } as PuzzleImportOptions),
    noIndex: true,
    slug: "rush-hour-source",
};
