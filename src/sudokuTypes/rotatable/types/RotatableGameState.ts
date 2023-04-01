import {AnimatableState} from "../../../types/sudoku/AnimationSpeed";

export interface RotatableGameState extends AnimatableState {
    angle: number;
    isStickyMode: boolean;
}

export interface RotatableProcessedGameState {
    animatedAngle: number;
}
