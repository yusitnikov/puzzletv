import { GameStateActionCallback, getNextActionId } from "../../../types/puzzle/GameStateAction";
import { AdventurePTM } from "./AdventurePTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { Constraint } from "../../../types/puzzle/Constraint";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { PositionLiteral } from "../../../types/layout/Position";

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
    solveCells: PositionLiteral[];
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
    (choiceIndex: number, choiceSolutionString: string): GameStateActionCallback<AdventurePTM> =>
    (context) => {
        return {
            gridStateHistory: gridStateHistoryAddState(
                context,
                myClientId,
                getNextActionId(),
                ({ extension, ...gridState }) => ({
                    ...gridState,
                    extension: {
                        choicesMade: [...extension.choicesMade, choiceIndex],
                        choicesMadeSolutionStrings: [...extension.choicesMadeSolutionStrings, choiceSolutionString],
                    },
                }),
            ),
        };
    };
