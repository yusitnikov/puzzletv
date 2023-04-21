import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {JigsawPTM} from "./JigsawPTM";
import {fieldStateHistoryAddState, fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getActiveJigsawPieceZIndex} from "./helpers";
import {JigsawFieldPieceState} from "./JigsawFieldState";

export interface JigsawGamePieceState {
    animating: boolean;
}

interface JigsawPieceStateUpdate {
    position?: Partial<JigsawFieldPieceState>;
    state?: Partial<JigsawGamePieceState>;
}

export const jigsawPieceStateChangeAction = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    clientId: string,
    actionId: string,
    pieceIndexes: number[] | number,
    updates: JigsawPieceStateUpdate | ((
        prevPieceData: {
            position: JigsawFieldPieceState,
            state: JigsawGamePieceState,
            allPositions: JigsawFieldPieceState[],
            allStates: JigsawGamePieceState[],
        },
        index: number,
    ) => JigsawPieceStateUpdate),
    resetSelectedCells = true,
): GameStateActionCallback<JigsawPTM> => ({selectedCells, fieldStateHistory, extension: {pieces: pieceStates}}) => {
    if (!Array.isArray(pieceIndexes)) {
        pieceIndexes = [pieceIndexes];
    }
    const indexReverseMap: Record<number, number> = {};
    for (const [index1, index2] of pieceIndexes.entries()) {
        indexReverseMap[index2] = index1;
    }

    let updatesPerIndex: JigsawPieceStateUpdate[];
    if (typeof updates === "function") {
        const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);

        updatesPerIndex = pieceIndexes.map((pieceIndex) => updates({
            position: piecePositions[pieceIndex],
            state: pieceStates[pieceIndex],
            allPositions: piecePositions,
            allStates: pieceStates,
        }, pieceIndex));
    } else {
        updatesPerIndex = pieceIndexes.map(() => updates);
    }

    return {
        ...(updatesPerIndex.some(({position}) => position) && {
            fieldStateHistory: fieldStateHistoryAddState(
                puzzle,
                fieldStateHistory,
                clientId,
                actionId,
                ({extension: {pieces: piecePositions}, ...fieldState}) => ({
                    ...fieldState,
                    extension: {
                        // TODO: re-index all pieces to avoid meaningless history slots?
                        pieces: piecePositions.map(
                            (position, index) => indexReverseMap[index] !== undefined
                                ? {...position, ...updatesPerIndex[indexReverseMap[index]].position}
                                : position
                        ),
                    },
                })
            ),
        }),
        extension: {
            pieces: pieceStates.map(
                (state, index) => indexReverseMap[index] !== undefined
                    ? {...state, ...updatesPerIndex[indexReverseMap[index]].state}
                    : state
            ),
            highlightCurrentPiece: true,
        },
        ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
    };
};

export const jigsawPieceBringOnTopAction = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    actionId: string,
    pieceIndexes: number[],
    resetSelectedCells = true
) => jigsawPieceStateChangeAction(
    puzzle,
    myClientId,
    actionId,
    pieceIndexes,
    ({allPositions}) => ({
        position: {
            zIndex: getActiveJigsawPieceZIndex(allPositions) + 1,
        },
    }),
    resetSelectedCells,
);
