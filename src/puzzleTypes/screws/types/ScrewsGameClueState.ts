import { AnimatedValue } from "../../../hooks/useAnimatedValue";

export interface ScrewsGameClueState {
    animationManager: AnimatedValue<number>;
    animating: boolean;
}
