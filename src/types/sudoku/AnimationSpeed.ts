export enum AnimationSpeed {
    immediate = 0,
    regular = 1000,
    slow = 3000,
}

export const animationSpeedToString = (speed: AnimationSpeed) => {
    switch (speed) {
        case AnimationSpeed.regular: return "regular";
        case AnimationSpeed.immediate: return "no animation";
        case AnimationSpeed.slow: return "slow";
    }
}