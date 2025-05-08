import { emptyPosition, Position } from "../../../types/layout/Position";
import {
    AnimatedValueMixer,
    mixAnimatedArray,
    mixAnimatedBool,
    mixAnimatedPosition,
} from "../../../hooks/useAnimatedValue";

export interface SokobanGridState {
    cluePositions: Position[];
    clueSmashed: boolean[];
    sokobanPosition: Position;
}

export const sokobanGridStateAnimationMixer: AnimatedValueMixer<SokobanGridState> = (a, b, coeff) => ({
    cluePositions: mixAnimatedArray(a.cluePositions, b.cluePositions, coeff, (a = emptyPosition, b = emptyPosition) => {
        if (a.top === b.top || a.left === b.left) {
            return mixAnimatedPosition(a, b, coeff);
        }

        const movingDown = b.top > a.top;
        const c: Position = {
            top: (movingDown ? a : b).top,
            left: (movingDown ? b : a).left,
        };
        return coeff < 0.5 ? mixAnimatedPosition(a, c, coeff * 2) : mixAnimatedPosition(c, b, coeff * 2 - 1);
    }),
    clueSmashed: mixAnimatedArray(a.clueSmashed, b.clueSmashed, coeff, mixAnimatedBool),
    sokobanPosition: mixAnimatedPosition(a.sokobanPosition, b.sokobanPosition, coeff),
});
