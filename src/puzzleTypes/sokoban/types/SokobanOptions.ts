import { SokobanClue } from "./SokobanPuzzleExtension";

export interface SokobanOptions {
    isLightClue?(clue: SokobanClue): boolean;
    isSmashableClue?(clue: SokobanClue): boolean;
    isFallingClue?(clue: SokobanClue): boolean;
    smashedComponent?: SokobanClue["component"];
}
