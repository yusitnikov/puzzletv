import {emptyPosition, Position} from "../../../types/layout/Position";
import {
    AnimatedValueMixer,
    mixAnimatedArray,
    mixAnimatedBool,
    mixAnimatedPosition
} from "../../../hooks/useAnimatedValue";

export interface SokobanFieldState {
    cluePositions: Position[];
    clueSmashed: boolean[];
    sokobanPosition: Position;
}

export const sokobanFieldStateAnimationMixer: AnimatedValueMixer<SokobanFieldState> = (a, b, coeff) => ({
    cluePositions: mixAnimatedArray(
        a.cluePositions, b.cluePositions, coeff,
        (a = emptyPosition, b = emptyPosition) => mixAnimatedPosition(a, b, coeff)
    ),
    clueSmashed: mixAnimatedArray(a.clueSmashed, b.clueSmashed, coeff, mixAnimatedBool),
    sokobanPosition: mixAnimatedPosition(a.sokobanPosition, b.sokobanPosition, coeff),
});
