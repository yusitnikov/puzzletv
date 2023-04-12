import {PositionWithAngle} from "../../../types/layout/Position";
import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {JigsawDigit} from "./JigsawDigit";
import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";

export interface JigsawPieceState extends PositionWithAngle {
    animating: boolean;
    zIndex: number;
}

export const jigsawPieceStateChangeAction = (
    pieceIndex: number,
    updates: Partial<JigsawPieceState> | ((prevPiece: JigsawPieceState, prevPieces: JigsawPieceState[]) => Partial<JigsawPieceState>),
): GameStateActionCallback<JigsawDigit, JigsawGameState, JigsawProcessedGameState> => ({selectedCells, extension: {pieces}}) => ({
    extension: {
        pieces: [
            ...pieces.slice(0, pieceIndex),
            {
                ...pieces[pieceIndex],
                ...(typeof updates === "function" ? updates(pieces[pieceIndex], pieces) : updates)
            },
            ...pieces.slice(pieceIndex + 1),
        ],
    },
    selectedCells: selectedCells.clear(),
});
