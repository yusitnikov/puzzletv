import {emptyPosition, Position} from "../../../types/layout/Position";
import {AnimatedValueMixer, mixAnimatedArray, mixAnimatedBool, mixAnimatedValue} from "../../../hooks/useAnimatedValue";

export interface SokobanFieldState {
    cluePositions: Position[];
    clueSmashed: boolean[];
    sokobanPosition: Position;
}

export const sokobanFieldStateAnimationMixer: AnimatedValueMixer<SokobanFieldState> = (a, b, coeff) => ({
    cluePositions: mixAnimatedArray(
        a.cluePositions, b.cluePositions, coeff,
        (a = emptyPosition, b = emptyPosition) => ({
            top: mixAnimatedValue(a.top, b.top, coeff),
            left: mixAnimatedValue(a.left, b.left, coeff),
        })
    ),
    clueSmashed: mixAnimatedArray(a.clueSmashed, b.clueSmashed, coeff, mixAnimatedBool),
    sokobanPosition: {
        top: mixAnimatedValue(a.sokobanPosition.top, b.sokobanPosition.top, coeff),
        left: mixAnimatedValue(a.sokobanPosition.left, b.sokobanPosition.left, coeff),
    },
});
