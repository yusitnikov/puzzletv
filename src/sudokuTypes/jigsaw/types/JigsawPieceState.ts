import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {JigsawPTM} from "./JigsawPTM";
import {PositionWithAngle} from "../../../types/layout/Position";
import {fieldStateHistoryAddState, fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {myClientId} from "../../../hooks/useMultiPlayer";

export interface JigsawPieceState {
    animating: boolean;
    zIndex: number;
}

interface JigsawPieceStateUpdate {
    position?: Partial<PositionWithAngle>;
    state?: Partial<JigsawPieceState>;
}

export const jigsawPieceStateChangeAction = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    clientId: string,
    actionId: string,
    pieceIndex: number,
    updates: JigsawPieceStateUpdate | ((
        prevPiecePosition: PositionWithAngle,
        prevPieceState: JigsawPieceState,
        prevPiecePositions: PositionWithAngle[],
        prevPieceStates: JigsawPieceState[],
    ) => JigsawPieceStateUpdate),
    resetSelectedCells = true,
): GameStateActionCallback<JigsawPTM> => ({selectedCells, fieldStateHistory, extension: {pieces: pieceStates}}) => {
    if (typeof updates === "function") {
        const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);

        updates = updates(piecePositions[pieceIndex], pieceStates[pieceIndex], piecePositions, pieceStates);
    }

    const {position: positionUpdates, state: stateUpdates} = updates;

    return {
        ...(positionUpdates && {
            fieldStateHistory: fieldStateHistoryAddState(
                puzzle,
                fieldStateHistory,
                clientId,
                actionId,
                ({extension: {pieces: piecePositions}, ...fieldState}) => ({
                    ...fieldState,
                    extension: {
                        pieces: [
                            ...piecePositions.slice(0, pieceIndex),
                            {...piecePositions[pieceIndex], ...positionUpdates},
                            ...piecePositions.slice(pieceIndex + 1),
                        ],
                    },
                })
            ),
        }),
        ...(stateUpdates && {
            extension: {
                pieces: [
                    ...pieceStates.slice(0, pieceIndex),
                    {...pieceStates[pieceIndex], ...stateUpdates},
                    ...pieceStates.slice(pieceIndex + 1),
                ],
                highlightCurrentPiece: true,
            },
        }),
        ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
    };
};

export const jigsawPieceBringOnTopAction = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    actionId: string,
    pieceIndex: number,
    resetSelectedCells = true
) => jigsawPieceStateChangeAction(
    puzzle,
    myClientId,
    actionId,
    pieceIndex,
    (prevPiecePosition, prevPieceState, prevPiecePositions, prevPieceStates) => ({
        state: {
            zIndex: Math.max(...prevPieceStates.map(({zIndex}) => zIndex)) + 1,
        },
    }),
    resetSelectedCells,
);
