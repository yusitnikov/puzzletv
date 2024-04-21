import {emptyPosition, Position} from "../../../types/layout/Position";
import {AnimatedValueMixer, mixAnimatedValue} from "../../../hooks/useAnimatedValue";

export interface SokobanFieldState {
    cluePositions: Position[];
    clueSmashed: boolean[];
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
    clueSmashed: b.clueSmashed.map((smashedB, index) => {
        const smashedA = a.clueSmashed[index];
        return mixAnimatedValue(smashedA ? 1 : 0, smashedB ? 1 : 0, coeff) >= 0.5;
    }),
    sokobanPosition: {
        top: mixAnimatedValue(a.sokobanPosition.top, b.sokobanPosition.top, coeff),
        left: mixAnimatedValue(a.sokobanPosition.left, b.sokobanPosition.left, coeff),
    },
});
