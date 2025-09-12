import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { AdventurePTM } from "./AdventurePTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { Constraint } from "../../../types/puzzle/Constraint";

export interface AdventureGridState {
    choicesMade: number[];
    choicesMadeSolutionStrings: string[];
}

export type choiceOption = {
    choiceMessage: string;
    takenMessage: string;
    solutionMessage: string;
    consequences: choiceTaken;
};

export type choiceDefinitions = {
    solveCells: [number, number][];
    topMessage: string;
    options: choiceOption[];
};

export type choiceTaken = {
    initialDigits: CellsMap<number>;
    constraints: Constraint<AdventurePTM, any>[];
    rules: string[];
    choices?: choiceDefinitions;
};

export const choicesMadeStateChangeAction =
    <T extends AdventurePTM>(
        clientId: string,
        actionId: string,
        choicesMade: number[],
        choicesMadeSolutionStrings: string[],
    ): GameStateActionCallback<T> =>
    (context) => {
        return {
            gridStateHistory: gridStateHistoryAddState(context, clientId, actionId, ({ extension, ...gridState }) => ({
                ...gridState,
                extension: {
                    choicesMade: choicesMade,
                    choicesMadeSolutionStrings: choicesMadeSolutionStrings,
                },
            })),
        };
    };
