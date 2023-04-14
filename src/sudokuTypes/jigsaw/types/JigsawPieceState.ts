import {PositionWithAngle} from "../../../types/layout/Position";
import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {JigsawPTM} from "./JigsawPTM";

export interface JigsawPieceState extends PositionWithAngle {
    animating: boolean;
    zIndex: number;
}

export const jigsawPieceStateChangeAction = (
    pieceIndex: number,
    updates: Partial<JigsawPieceState> | ((prevPiece: JigsawPieceState, prevPieces: JigsawPieceState[]) => Partial<JigsawPieceState>),
    resetSelectedCells = true,
): GameStateActionCallback<JigsawPTM> => ({selectedCells, extension: {pieces}}) => ({
    extension: {
        pieces: [
            ...pieces.slice(0, pieceIndex),
            {
                ...pieces[pieceIndex],
                ...(typeof updates === "function" ? updates(pieces[pieceIndex], pieces) : updates)
            },
            ...pieces.slice(pieceIndex + 1),
        ],
        highlightCurrentPiece: true,
    },
    ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
});

export const jigsawPieceBringOnTopAction = (pieceIndex: number, resetSelectedCells = true) => jigsawPieceStateChangeAction(
    pieceIndex,
    (prevPiece, prevPieces) => ({
        zIndex: Math.max(...prevPieces.map(({zIndex}) => zIndex)) + 1,
    }),
    resetSelectedCells,
);
