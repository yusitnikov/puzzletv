import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {RushHourPTM} from "./RushHourPTM";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {gameStateGetCurrentFieldState, ProcessedGameStateEx} from "../../../types/sudoku/GameState";
import {Position} from "../../../types/layout/Position";

export interface RushHourGameCarState {
    animating: boolean;
}

export const rushHourCarStateChangeAction = (
    puzzle: PuzzleDefinition<RushHourPTM>,
    startState: ProcessedGameStateEx<RushHourPTM> | undefined,
    clientId: string,
    actionId: string,
    carIndex: number,
    calculatePosition: (prevPosition: Position, allPositions: Position[]) => Position,
    animate: boolean,
): GameStateActionCallback<RushHourPTM> => ({fieldStateHistory, extension: {cars: carStates}}) => {
    const startCarPositions = startState && gameStateGetCurrentFieldState(startState).extension.cars;

    return {
        fieldStateHistory: fieldStateHistoryAddState(
            puzzle,
            fieldStateHistory,
            clientId,
            actionId,
            ({extension: {cars}, ...fieldState}) => ({
                ...fieldState,
                extension: {
                    cars: [
                        ...cars.slice(0, carIndex),
                        calculatePosition((startCarPositions ?? cars)[carIndex], cars),
                        ...cars.slice(carIndex + 1),
                    ],
                },
            })
        ),
        extension: {
            cars: [
                ...carStates.slice(0, carIndex),
                {animating: animate},
                ...carStates.slice(carIndex + 1),
            ],
        },
    };
};
