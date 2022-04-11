import {LanguageCode} from "../translations/LanguageCode";
import {Translatable} from "../translations/Translatable";

export enum AnimationSpeed {
    immediate = 0,
    regular = 1000,
    slow = 3000,
}

export const animationSpeedToString = (speed: AnimationSpeed): Translatable => {
    switch (speed) {
        case AnimationSpeed.regular:
            return {
                [LanguageCode.en]: "regular",
                [LanguageCode.ru]: "обычная",
            };
        case AnimationSpeed.immediate:
            return {
                [LanguageCode.en]: "no animation",
                [LanguageCode.ru]: "без анимации",
            };
        case AnimationSpeed.slow:
            return {
                [LanguageCode.en]: "slow",
                [LanguageCode.ru]: "медленная",
            };
    }
}