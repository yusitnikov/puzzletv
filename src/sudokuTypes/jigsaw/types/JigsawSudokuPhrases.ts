import {PartiallyTranslatable} from "../../../types/translations/Translatable";

export interface JigsawSudokuPhrases {
    forActivePiece: PartiallyTranslatable;
    dragPieceToMove: (rotatable: boolean) => PartiallyTranslatable;
    dragModeTitle: PartiallyTranslatable;
}
