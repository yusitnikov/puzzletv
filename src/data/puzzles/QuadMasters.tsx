import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {generateRandomPuzzleDigits} from "../../utils/random";
import {QuadMastersSudokuTypeManager} from "../../sudokuTypes/quad-masters/types/QuadMastersSudokuTypeManager";
import {QuadMastersGameState} from "../../sudokuTypes/quad-masters/types/QuadMastersGameState";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import {myClientId} from "../../hooks/useMultiPlayer";

export const generateQuadMasters = (
    slug: string,
    fieldSize: number,
    regionWidth: number,
    randomSeed?: number
): PuzzleDefinition<number, QuadMastersGameState, QuadMastersGameState> => ({
    noIndex: true,
    title: {
        [LanguageCode.en]: `Quad Masters`,
    },
    slug,
    saveState: randomSeed !== undefined,
    saveStateKey: `${slug}-${fieldSize}-${regionWidth}-${randomSeed}`,
    typeManager: QuadMastersSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomSeed)),
    fieldSize: createRegularFieldSize(fieldSize, regionWidth),
    rules: (_, {state: {currentPlayer, isQuadTurn}, multiPlayer}) => <>
        <RulesParagraph>Debug data:</RulesParagraph>
        <RulesUnorderedList>
            <li>Random seed: {randomSeed}</li>
            {multiPlayer?.isEnabled && <>
                <li>My network ID: {myClientId}</li>
                <li>Host's network ID: {multiPlayer?.hostId}</li>
                <li>I am the host: {multiPlayer?.isHost ? "yes" : "no"}</li>
                <li>Host connected: {multiPlayer?.hostData ? "yes" : "no"}</li>
                <li>Active players: {multiPlayer?.allPlayerIds?.join(", ")}</li>
                <li>Is my turn: {currentPlayer === myClientId ? "yes" : "no"}</li>
                <li>Is placing a guad: {isQuadTurn ? "yes" : "no"}</li>
            </>}
        </RulesUnorderedList>
    </>,
});
