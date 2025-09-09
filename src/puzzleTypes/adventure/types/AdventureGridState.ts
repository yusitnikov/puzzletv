import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { AdventurePTM } from "./AdventurePTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { Constraint } from "../../../types/puzzle/Constraint";

export interface AdventureGridState {
    choicesMade: number[];
    choicesMadeSolutionStrings: string[];
    introViewed: boolean;
}
export type choiceDefinitions = {
    solveCells: [number, number][]
    topMessage: string,
    option1ChoiceMessage: string
    option1TakenMessage: string
    option1SolutionMessage: string
    option2ChoiceMessage: string
    option2TakenMessage: string
    option2SolutionMessage: string
    option1: choiceTaken
    option2: choiceTaken
}

export type choiceTaken = {
    initialDigits: CellsMap<number>
    constraints: Constraint<AdventurePTM, any>[]
    rules: string[]
    choices: choiceDefinitions | undefined
}

export const choicesMadeStateChangeAction =
    <T extends AdventurePTM>(
        startContext: PuzzleContext<T>,
        clientId: string,
        actionId: string,
    ): GameStateActionCallback<T> =>
    (context) => {
        const {
            gridExtension: { choicesMade, choicesMadeSolutionStrings, introViewed, rootChoiceTaken },
        } = startContext;

        return {
            gridStateHistory: gridStateHistoryAddState(
                context,
                clientId,
                actionId,
                ({ extension, ...gridState }) => ({
                    ...gridState,
                    extension: {
                        choicesMade: choicesMade,
                        choicesMadeSolutionStrings: choicesMadeSolutionStrings,
                        introViewed: introViewed,
                        rootChoiceTaken: rootChoiceTaken
                    },
                }),
            ),
        };
    };
