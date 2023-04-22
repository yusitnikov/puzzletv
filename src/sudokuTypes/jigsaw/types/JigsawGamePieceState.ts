import {GameStateActionCallback} from "../../../types/sudoku/GameStateAction";
import {JigsawPTM} from "./JigsawPTM";
import {fieldStateHistoryAddState, fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getActiveJigsawPieceZIndex} from "./helpers";
import {JigsawFieldPieceState} from "./JigsawFieldState";
import {ProcessedGameStateEx} from "../../../types/sudoku/GameState";

export interface JigsawGamePieceState {
    animating: boolean;
}

interface JigsawPieceStateUpdate {
    position?: Partial<JigsawFieldPieceState>;
    state?: Partial<JigsawGamePieceState>;
}

export const jigsawPieceStateChangeAction = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    startState: ProcessedGameStateEx<JigsawPTM> | undefined,
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
        let {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);
        if (startState) {
            // Take the position from the start state, but z-index from the current state
            // (because "bring on top" action could be executed in the middle of the gesture)
            let {extension: {pieces: startPiecePositions}} = fieldStateHistoryGetCurrent(startState.fieldStateHistory);
            piecePositions = startPiecePositions.map((startPosition, index) => ({
                ...startPosition,
                zIndex: piecePositions[index].zIndex,
            }));
        }

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
    pieceIndexes: number[],
    resetSelectedCells = true
) => jigsawPieceStateChangeAction(
    puzzle,
    undefined,
    myClientId,
    "jigsaw-bring-on-top",
    pieceIndexes,
    ({allPositions}) => ({
        position: {
            zIndex: getActiveJigsawPieceZIndex(allPositions) + 1,
        },
    }),
    resetSelectedCells,
);
