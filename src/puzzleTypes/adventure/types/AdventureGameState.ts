import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { AdventurePTM } from "./AdventurePTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface AdventureGameState {
    choicesMade: number[];
    message: string;
}

export const choicesMadeStateChangeAction =
    (
        startContext: PuzzleContext<AdventurePTM>,
        clientId: string,
        actionId: string,
    ): GameStateActionCallback<AdventurePTM> =>
    (context) => {
        const {
            gridExtension: { choicesMade, message },
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
                        message: message
                    },
                }),
            ),
            extension: {
                choicesMade: choicesMade,
                message: message
            },
        };
    };
