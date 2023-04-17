import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {getJigsawPieceIndexByCell, getJigsawPiecesWithCache} from "./helpers";
import {jigsawPieceBringOnTopAction, jigsawPieceStateChangeAction} from "./JigsawPieceState";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {applyMetricsDiff, GestureInfo, GestureMetrics} from "../../../utils/gestures";
import {isCellGestureExtraData} from "../../../types/sudoku/CellGestureExtraData";
import {getRectCenter} from "../../../types/layout/Rect";
import {JigsawPTM} from "./JigsawPTM";
import {roundToStep} from "../../../utils/math";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {myClientId} from "../../../hooks/useMultiPlayer";

export const roundStep = 0.5;

const base = MoveCellWriteModeInfo<JigsawPTM>();

export const JigsawMoveCellWriteModeInfo: CellWriteModeInfo<JigsawPTM> = {
    ...base,
    title: {
        [LanguageCode.en]: "Move the grid and the jigsaw pieces",
        [LanguageCode.ru]: "Двигать поле и куски пазла",
    },
    disableCellHandlers: false,
    handlesRightMouseClick: true,
    onGestureStart(props, context, ...args) {
        const {gesture: {id}, extraData} = props;
        const {puzzle, cellsIndex, onStateChange} = context;

        const cellPosition = isCellGestureExtraData(extraData) ? extraData.cell : undefined;
        const pieceIndex = cellPosition && getJigsawPieceIndexByCell(cellsIndex, cellPosition);
        if (pieceIndex === undefined) {
            onStateChange({extension: {highlightCurrentPiece: false}});
            base.onGestureStart?.(props, context, ...args);
            return;
        }

        // Bring the clicked piece to the top
        onStateChange(jigsawPieceBringOnTopAction(puzzle, `gesture-${id}`, pieceIndex));
    },
    onOutsideClick({onStateChange}) {
        onStateChange({extension: {highlightCurrentPiece: false}});
    },
    onMove(props, context, fieldRect) {
        const {gesture, prevMetrics, currentMetrics} = props;
        const {
            puzzle,
            cellsIndex,
            cellSize,
            state: {
                loopOffset,
                scale,
            },
            onStateChange,
        } = context;
        const {
            fieldSize: {fieldSize},
            importOptions: {angleStep} = {},
        } = puzzle;

        const pieceIndex = getJigsawPieceIndexByGesture(cellsIndex, gesture);
        if (pieceIndex === undefined) {
            base.onMove?.(props, context, fieldRect);
            return;
        }

        const {boundingRect} = getJigsawPiecesWithCache(cellsIndex).pieces[pieceIndex];
        const pieceCenter = getRectCenter(boundingRect);
        const fieldCenter = getRectCenter(fieldRect);

        const screenToPiece = ({x, y, rotation}: GestureMetrics): GestureMetrics => ({
            x: ((x - fieldCenter.left) / cellSize - loopOffset.left) / scale + fieldSize / 2 - pieceCenter.left,
            y: ((y - fieldCenter.top) / cellSize - loopOffset.top) / scale + fieldSize / 2 - pieceCenter.top,
            rotation: angleStep ? rotation : 0,
            scale: 1,
        });

        onStateChange(jigsawPieceStateChangeAction(
            puzzle,
            myClientId,
            `gesture-${gesture.id}`,
            pieceIndex,
            ({top, left, angle}) => {
                const {x, y, rotation} = applyMetricsDiff(
                    {
                        x: left,
                        y: top,
                        scale: 1,
                        rotation: angle,
                    },
                    screenToPiece(prevMetrics),
                    screenToPiece(currentMetrics)
                );

                return {
                    position: {
                        top: y,
                        left: x,
                        angle: rotation,
                    },
                    state: {animating: false},
                };
            })
        );
    },
    onGestureEnd(props, context) {
        const {gesture} = props;
        const {puzzle, cellsIndex, onStateChange} = context;
        const {importOptions: {angleStep = 0} = {}} = puzzle;

        const pieceIndex = getJigsawPieceIndexByGesture(cellsIndex, gesture);
        if (pieceIndex === undefined) {
            base.onGestureEnd?.(props, context);
            return;
        }

        const {id, isClick, pointers: [{start: {event: {button: isRightButton}}}]} = gesture;

        onStateChange(jigsawPieceStateChangeAction(
            puzzle,
            myClientId,
            `gesture-${id}`,
            pieceIndex,
            ({top, left, angle}) => ({
                position: {
                    top: roundToStep(top, roundStep),
                    left: roundToStep(left, roundStep),
                    angle: roundToStep(angle, angleStep) + angleStep * (!isClick ? 0 : isRightButton ? -1 : 1),
                },
                state: {animating: true},
            })
        ));
    },
};

export const getJigsawPieceIndexByGesture = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>,
    {pointers}: GestureInfo,
): number | undefined => {
    const indexes = pointers.map(
        ({start: {extraData}}) => isCellGestureExtraData(extraData)
            ? getJigsawPieceIndexByCell(cellsIndex, extraData.cell)
            : undefined
    );

    // return the index if it's the same for all pointers
    return indexes.every(index => index === indexes[0])
        ? indexes[0]
        : undefined;
};
