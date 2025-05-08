import { SokobanClue } from "./SokobanPuzzleExtension";

export interface SokobanOptions {
    distinctMovementSteps?: boolean;
    isLightClue?(clue: SokobanClue): boolean;
    isSmashableClue?(clue: SokobanClue): boolean;
    isFallingClue?(clue: SokobanClue): boolean;
    smashedComponent?: SokobanClue["component"];
}
