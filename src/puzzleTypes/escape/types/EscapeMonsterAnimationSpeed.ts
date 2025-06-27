import { localStorageManager } from "../../../utils/localStorage";

export enum EscapeMonsterAnimationSpeed {
    slow = 1000,
    medium = 500,
    fast = 250,
}

export const escapeMonsterAnimationSpeed = localStorageManager.getNumberManager<EscapeMonsterAnimationSpeed>(
    "escapeMonsterAnimationSpeed",
    EscapeMonsterAnimationSpeed.medium,
);
