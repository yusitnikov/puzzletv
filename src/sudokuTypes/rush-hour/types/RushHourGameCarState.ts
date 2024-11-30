import { GameStateActionCallback } from "../../../types/sudoku/GameStateAction";
import { RushHourPTM } from "./RushHourPTM";
import { fieldStateHistoryAddState } from "../../../types/sudoku/FieldStateHistory";
import { Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";

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

        const startCarPositions = startContext?.fieldExtension.cars;

        return {
            fieldStateHistory: fieldStateHistoryAddState(
                context,
                clientId,
                actionId,
                ({ extension: { cars }, ...fieldState }) => ({
                    ...fieldState,
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
