import { PartiallyTranslatable } from "../../../types/translations/Translatable";

export interface JigsawPuzzlePhrases {
    forActivePiece: PartiallyTranslatable;
    dragPieceToMove: (rotatable: boolean) => PartiallyTranslatable;
    dragModeTitle: PartiallyTranslatable;
}
