import {CellWriteMode, CellWriteModeInfo} from "../../../types/sudoku/CellWriteMode";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {getJigsawPieceIndexByCell, getJigsawPiecesWithCache} from "./helpers";
import {jigsawPieceStateChangeAction} from "./JigsawPieceState";
import {JigsawDigit} from "./JigsawDigit";
import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {applyMetricsDiff, GestureInfo, GestureMetrics} from "../../../utils/gestures";
import {isCellGestureExtraData} from "../../../types/sudoku/CellGestureExtraData";
import {getRectCenter} from "../../../types/layout/Rect";

export const JigsawMoveCellWriteModeInfo: CellWriteModeInfo<JigsawDigit, JigsawGameState, JigsawProcessedGameState> = {
    mode: CellWriteMode.move,
    ...MoveCellWriteModeInfo,
    disableCellHandlers: false,
    handlesRightMouseClick: true,
    onCornerClick(context, cellPosition, exactPosition, isRightClick) {
        const pieceIndex = getJigsawPieceIndexByCell(context.cellsIndex, cellPosition);
        if (pieceIndex === undefined) {
            MoveCellWriteModeInfo.onCornerClick?.(context, cellPosition, exactPosition, isRightClick);
            return;
        }

        // Bring the clicked piece to the top
        context.onStateChange(jigsawPieceStateChangeAction(
            pieceIndex,
            (prevPiece, prevPieces) => ({
                zIndex: Math.max(...prevPieces.map(({zIndex}) => zIndex)) + 1,
            }),
        ));
    },
    onMove(props, context, fieldRect) {
        const {gesture, prevMetrics, currentMetrics} = props;
        const {
            puzzle: {fieldSize: {fieldSize}},
            cellsIndex,
            cellSize,
            state: {
                loopOffset,
                scale,
            },
            onStateChange,
        } = context;

        const pieceIndex = getJigsawPieceIndexByGesture(cellsIndex, gesture);
        if (pieceIndex === undefined) {
            MoveCellWriteModeInfo.onMove?.(props, context, fieldRect);
            return;
        }

        const {boundingRect} = getJigsawPiecesWithCache(cellsIndex)[pieceIndex];
        const pieceCenter = getRectCenter(boundingRect);
        const fieldCenter = getRectCenter(fieldRect);

        const screenToPiece = ({x, y, rotation}: GestureMetrics): GestureMetrics => ({
            x: ((x - fieldCenter.left) / cellSize - loopOffset.left) / scale + fieldSize / 2 - pieceCenter.left,
            y: ((y - fieldCenter.top) / cellSize - loopOffset.top) / scale + fieldSize / 2 - pieceCenter.top,
            rotation,
            scale: 1,
        });

        onStateChange(jigsawPieceStateChangeAction(pieceIndex, ({top, left, angle}) => {
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
                top: y,
                left: x,
                angle: rotation,
                animating: false,
            };
        }));
    },
    onGestureEnd(props, context) {
        const {gesture} = props;
        const {
            puzzle: {typeManager: {angleStep}},
            cellsIndex,
            onStateChange,
        } = context;

        const pieceIndex = getJigsawPieceIndexByGesture(cellsIndex, gesture);
        if (pieceIndex === undefined) {
            MoveCellWriteModeInfo.onGestureEnd?.(props, context);
            return;
        }

        const {isClick, pointers: [{start: {event: {button: isRightButton}}}]} = gesture;
        // TODO: round the position, glue pieces together if possible

        onStateChange(jigsawPieceStateChangeAction(pieceIndex, ({angle}) => ({
            angle: angleStep
                ? Math.round(angle / angleStep + (!isClick ? 0 : isRightButton ? -1 : 1)) * angleStep
                : angle,
            animating: true,
        })));
    },
};

export const getJigsawPieceIndexByGesture = (
    cellsIndex: SudokuCellsIndex<JigsawDigit, JigsawGameState, JigsawProcessedGameState>,
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
