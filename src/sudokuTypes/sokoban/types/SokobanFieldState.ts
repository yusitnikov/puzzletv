import {emptyPosition, Position} from "../../../types/layout/Position";
import {AnimatedValueMixer, mixAnimatedValue} from "../../../hooks/useAnimatedValue";

export interface SokobanFieldState {
    cluePositions: Position[];
    sokobanPosition: Position;
}

export const sokobanFieldStateAnimationMixer: AnimatedValueMixer<SokobanFieldState> = (a, b, coeff) => ({
    cluePositions: b.cluePositions.map((positionB, index) => {
        const positionA = a.cluePositions[index] ?? emptyPosition;
        return {
            top: mixAnimatedValue(positionA.top, positionB.top, coeff),
            left: mixAnimatedValue(positionA.left, positionB.left, coeff),
        };
    }),
    sokobanPosition: {
        top: mixAnimatedValue(a.sokobanPosition.top, b.sokobanPosition.top, coeff),
        left: mixAnimatedValue(a.sokobanPosition.left, b.sokobanPosition.left, coeff),
    },
});
