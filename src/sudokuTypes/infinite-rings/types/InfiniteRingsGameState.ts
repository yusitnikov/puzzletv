import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";

export interface InfiniteRingsGameState {
    ringOffset: number;
    animationSpeed: AnimationSpeed;
}

export interface InfiniteRingsProcessedGameState {
    ringOffset: number;
}
