import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { RushHourPTM } from "./RushHourPTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface RushHourGameCarState {
    animating: boolean;
}

export const rushHourCarStateChangeAction =
    (
        startContext: PuzzleContext<RushHourPTM> | undefined,
        clientId: string,
        actionId: string,
        carIndex: number,
        calculatePosition: (prevPosition: Position, allPositions: Position[]) => Position,
        animate: boolean,
    ): GameStateActionCallback<RushHourPTM> =>
    (context) => {
        const {
            stateExtension: { cars: carStates },
        } = context;

        const startCarPositions = startContext?.gridExtension.cars;

        return {
            gridStateHistory: gridStateHistoryAddState(
                context,
                clientId,
                actionId,
                ({ extension: { cars }, ...gridState }) => ({
                    ...gridState,
                    extension: {
                        cars: [
                            ...cars.slice(0, carIndex),
                            calculatePosition((startCarPositions ?? cars)[carIndex], cars),
                            ...cars.slice(carIndex + 1),
                        ],
                    },
                }),
            ),
            extension: {
                cars: [...carStates.slice(0, carIndex), { animating: animate }, ...carStates.slice(carIndex + 1)],
            },
        };
    };
