import {
    ControlButtonItem,
    ControlButtonItemProps,
    ControlButtonRegion
} from "../../../components/sudoku/controls/ControlButtonsManager";
import {JigsawPTM} from "../types/JigsawPTM";
import {useEventListener} from "../../../hooks/useEventListener";
import {useEffect} from "react";
import {
    getActiveJigsawPieceIndex,
    getJigsawPieceIndexByCell,
    getJigsawPiecesWithCache,
    sortJigsawPiecesByPosition
} from "../types/helpers";
import {jigsawPieceBringOnTopAction, jigsawPieceStateChangeAction} from "../types/JigsawPieceState";
import {incrementArrayItem} from "../../../utils/array";
import {useLastValueRef} from "../../../hooks/useLastValueRef";
import {fieldStateHistoryGetCurrent} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";

const JigsawPieceHighlightHandler = (
    {
        context: {
            cellsIndex,
            puzzle,
            state: {fieldStateHistory, selectedCells, extension: {pieces: pieceIndexes, highlightCurrentPiece}},
            onStateChange,
        },
    }: ControlButtonItemProps<JigsawPTM>
) => {
    const onStateChangeRef = useLastValueRef(onStateChange);

    const {importOptions: {angleStep} = {}} = puzzle;
    const {extension: {pieces: piecePositions}} = fieldStateHistoryGetCurrent(fieldStateHistory);

    // TODO: make sure that the last selected cell with Ctrl+A is the bottom-right-most cell according to the pieces' state
    const selectedCell = selectedCells.last();
    const selectedRegionIndex = selectedCell && getJigsawPieceIndexByCell(cellsIndex, selectedCell);
    useEffect(() => {
        if (selectedRegionIndex !== undefined) {
            onStateChangeRef.current(jigsawPieceBringOnTopAction(puzzle, getNextActionId(), selectedRegionIndex, false));
        }
    }, [puzzle, selectedRegionIndex, onStateChangeRef]);

    const activePieceIndex = getActiveJigsawPieceIndex(pieceIndexes);

    useEventListener(window, "keydown", (ev) => {
        const {code, ctrlKey, metaKey, altKey, shiftKey} = ev;

        if (ctrlKey || metaKey || altKey) {
            return;
        }

        switch (code) {
            case "Tab":
                const pieces = getJigsawPiecesWithCache(cellsIndex);
                const sortedPieceCoords = sortJigsawPiecesByPosition(pieces, piecePositions);
                const newActivePieceIndex = incrementArrayItem(
                    sortedPieceCoords,
                    activePieceIndex,
                    shiftKey ? -1 : 1
                );
                // TODO: scroll the active piece into view
                onStateChange([
                    jigsawPieceBringOnTopAction(puzzle, getNextActionId(), newActivePieceIndex),
                    selectedCells.size !== 0
                        ? {
                            // TODO: select the top-left-most cell according to the current angle
                            selectedCells: selectedCells.set(pieces[newActivePieceIndex].cells.slice(0, 1)),
                        }
                        : {},
                ]);

                ev.preventDefault();
                break;
            case "KeyR":
                if (highlightCurrentPiece && angleStep) {
                    onStateChange(jigsawPieceStateChangeAction(
                        puzzle,
                        myClientId,
                        getNextActionId(),
                        activePieceIndex,
                        ({angle}) => ({
                            position: {angle: angle + angleStep * (shiftKey ? -1 : 1)},
                            state: {animating: true},
                        }),
                        false
                    ));
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
