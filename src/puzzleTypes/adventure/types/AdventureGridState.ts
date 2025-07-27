import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { AdventurePTM } from "./AdventurePTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface AdventureGridState {
    choicesMade: number[];
    choicesMadeSolutionStrings: string[];
    introViewed: boolean;
}

export const choicesMadeStateChangeAction =
    <T extends AdventurePTM>(
        startContext: PuzzleContext<T>,
        clientId: string,
        actionId: string,
    ): GameStateActionCallback<T> =>
    (context) => {
        const {
            gridExtension: { choicesMade, choicesMadeSolutionStrings, introViewed },
        } = startContext;

        return {
            gridStateHistory: gridStateHistoryAddState(
                context,
                clientId,
                actionId,
                ({ extension: {}, ...gridState }) => ({
                    ...gridState,
                    extension: {
                        choicesMade: choicesMade,
                        choicesMadeSolutionStrings: choicesMadeSolutionStrings,
                        introViewed: introViewed
                    },
                }),
            ),
        };
    };
