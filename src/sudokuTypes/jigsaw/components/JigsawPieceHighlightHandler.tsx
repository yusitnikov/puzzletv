import {
    ControlButtonItem,
    ControlButtonItemProps,
    ControlButtonRegion
} from "../../../components/sudoku/controls/ControlButtonsManager";
import {JigsawPTM} from "../types/JigsawPTM";
import {useEventListener} from "../../../hooks/useEventListener";
import {useEffect, useMemo} from "react";
import {
    getActiveJigsawPieceZIndex,
    getJigsawPieceIndexesByCell,
    getJigsawPiecesWithCache,
    groupJigsawPiecesByZIndex,
    moveJigsawPieceByGroupGesture,
} from "../types/helpers";
import {jigsawPieceBringOnTopAction, jigsawPieceStateChangeAction} from "../types/JigsawGamePieceState";
import {incrementArrayItem} from "../../../utils/array";
import {useLastValueRef} from "../../../hooks/useLastValueRef";
import {fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";
import {usePureMemo} from "../../../hooks/usePureMemo";
import {emptyGestureMetrics, GestureMetrics} from "../../../utils/gestures";

const JigsawPieceHighlightHandler = (
    {
        context: {
            cellsIndex,
            puzzle,
            state: {fieldStateHistory, selectedCells, extension: {highlightCurrentPiece}},
            onStateChange,
        },
    }: ControlButtonItemProps<JigsawPTM>
) => {
    const onStateChangeRef = useLastValueRef(onStateChange);

    const {importOptions: {angleStep} = {}} = puzzle;
    const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);
    const {pieces} = getJigsawPiecesWithCache(cellsIndex);
    const activeZIndex = getActiveJigsawPieceZIndex(piecePositions);
    const groups = useMemo(
        () => groupJigsawPiecesByZIndex(pieces, piecePositions),
        [pieces, piecePositions]
    );

    // TODO: make sure that the last selected cell with Ctrl+A is the bottom-right-most cell according to the pieces' state
    const selectedCell = selectedCells.last();
    const selectedRegionIndexes = usePureMemo(selectedCell && getJigsawPieceIndexesByCell(cellsIndex, piecePositions, selectedCell));
    useEffect(() => {
        if (selectedRegionIndexes?.length) {
            onStateChangeRef.current(jigsawPieceBringOnTopAction(puzzle, getNextActionId(), selectedRegionIndexes, false));
        }
    }, [puzzle, selectedRegionIndexes, onStateChangeRef]);

    useEventListener(window, "keydown", (ev) => {
        const {code, ctrlKey, metaKey, altKey, shiftKey} = ev;

        if (ctrlKey || metaKey || altKey) {
            return;
        }

        switch (code) {
            case "Tab":
                const sortedPieceGroups = [...groups].sort(
                    ({center: a}, {center: b}) =>
                        Math.sign(a.top - b.top) || Math.sign(a.left - b.left)
                );
                const newActivePieces = incrementArrayItem(
                    sortedPieceGroups,
                    ({zIndex}) => zIndex === activeZIndex,
                    shiftKey ? -1 : 1
                );
                // TODO: scroll the active piece into view
                onStateChange([
                    jigsawPieceBringOnTopAction(puzzle, getNextActionId(), newActivePieces.indexes),
                    selectedCells.size !== 0
                        ? {
                            // TODO: select the top-left-most cell according to the current angle
                            selectedCells: selectedCells.set(newActivePieces.cells.slice(0, 1)),
                        }
                        : {},
                ]);

                ev.preventDefault();
                break;
            case "KeyR":
                if (highlightCurrentPiece && angleStep) {
                    const activeGroup = groups.find(({zIndex}) => zIndex === activeZIndex);
                    if (activeGroup) {
                        const groupGesture: GestureMetrics = {
                            ...emptyGestureMetrics,
                            rotation: angleStep * (shiftKey ? -1 : 1)
                        };
                        onStateChange(jigsawPieceStateChangeAction(
                            puzzle,
                            myClientId,
                            getNextActionId(),
                            activeGroup.indexes,
                            ({position}, pieceIndex) => ({
                                position: moveJigsawPieceByGroupGesture(
                                    activeGroup,
                                    groupGesture,
                                    pieces[pieceIndex],
                                    position
                                ),
                                state: {animating: true},
                            }),
                            false
                        ));
                    }
                }
                ev.preventDefault();
                break;
        }
    });

    return null;
};

export const JigsawPieceHighlightHandlerControlButtonItem: ControlButtonItem<JigsawPTM> = {
    key: "jigsaw-piece-highlight",
    region: ControlButtonRegion.custom,
    Component: JigsawPieceHighlightHandler,
};
