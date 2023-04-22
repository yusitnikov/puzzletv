import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {getJigsawPiecesWithCache, groupJigsawPiecesByZIndex, moveJigsawPieceByGroupGesture} from "./helpers";
import {jigsawPieceBringOnTopAction, jigsawPieceStateChangeAction} from "./JigsawGamePieceState";
import {
    applyMetricsDiff,
    emptyGestureMetrics,
    GestureFinishReason,
    GestureInfo,
    GestureMetrics
} from "../../../utils/gestures";
import {isCellGestureExtraData} from "../../../types/sudoku/CellGestureExtraData";
import {getRectCenter} from "../../../types/layout/Rect";
import {JigsawPTM} from "./JigsawPTM";
import {roundToStep} from "../../../utils/math";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {JigsawMoveButtonHint} from "../components/JigsawMoveButtonHint";
import {arrayContainsPosition, Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";

export const roundStep = 0.5;

const base = MoveCellWriteModeInfo<JigsawPTM>();

export const JigsawMoveCellWriteModeInfo: CellWriteModeInfo<JigsawPTM> = {
    ...base,
    title: {
        [LanguageCode.en]: "Move the grid and the jigsaw pieces",
        [LanguageCode.ru]: "Двигать поле и куски пазла",
    },
    mainButtonContent: (props) => <>
        {base.mainButtonContent && <base.mainButtonContent {...props}/>}
        <JigsawMoveButtonHint {...props}/>
    </>,
    disableCellHandlers: false,
    handlesRightMouseClick: true,
    onGestureStart(props, context, ...args) {
        const {gesture} = props;
        const {puzzle, onStateChange} = context;

        const piecesGroup = getJigsawPiecesByGesture(context, gesture);
        if (!piecesGroup) {
            onStateChange({extension: {highlightCurrentPiece: false}});
            return base.onGestureStart?.(props, context, ...args);
        }

        // Bring the clicked piece to the top
        onStateChange(jigsawPieceBringOnTopAction(puzzle, piecesGroup.indexes));
    },
    onOutsideClick({onStateChange}) {
        onStateChange({extension: {highlightCurrentPiece: false}});
    },
    onMove(props, context, fieldRect) {
        const {gesture, startMetrics, currentMetrics} = props;
        const {id, state: startContext} = gesture;
        const {
            cellsIndex,
            puzzle,
            cellSize,
            onStateChange,
        } = context;
        const {
            state: {
                loopOffset,
                scale,
            },
        } = startContext;
        const {
            fieldSize: {fieldSize},
            importOptions: {angleStep} = {},
        } = puzzle;

        const piecesGroup = getJigsawPiecesByGesture(startContext, gesture);
        if (!piecesGroup) {
            base.onMove?.(props, context, fieldRect);
            return;
        }

        const {center: groupCenter} = piecesGroup;
        const fieldCenter = getRectCenter(fieldRect);
        const {pieces} = getJigsawPiecesWithCache(cellsIndex);

        const screenToGroup = ({x, y, rotation}: GestureMetrics): GestureMetrics => ({
            x: ((x - fieldCenter.left) / cellSize - loopOffset.left) / scale + fieldSize / 2 - groupCenter.left,
            y: ((y - fieldCenter.top) / cellSize - loopOffset.top) / scale + fieldSize / 2 - groupCenter.top,
            rotation: angleStep ? rotation : 0,
            scale: 1,
        });
        const groupGesture = applyMetricsDiff(
            emptyGestureMetrics,
            screenToGroup(startMetrics),
            screenToGroup(currentMetrics)
        );

        onStateChange(jigsawPieceStateChangeAction(
            puzzle,
            startContext.state,
            myClientId,
            `gesture-${id}`,
            piecesGroup.indexes,
            ({position}, pieceIndex) => {
                return {
                    position: moveJigsawPieceByGroupGesture(piecesGroup!, groupGesture, pieces[pieceIndex], position),
                    state: {animating: false},
                };
            }
        ));
    },
    onGestureEnd(props, context) {
        const {gesture, reason} = props;
        const {cellsIndex, puzzle, onStateChange} = context;
        const {importOptions: {angleStep = 0} = {}} = puzzle;

        const piecesGroup = getJigsawPiecesByGesture(context, gesture);
        if (!piecesGroup) {
            base.onGestureEnd?.(props, context);
            return;
        }

        const {id, isClick, pointers: [{start: {event: {button: isRightButton}}}]} = gesture;
        const {pieces} = getJigsawPiecesWithCache(cellsIndex);

        const groupGesture: GestureMetrics = {
            x: roundToStep(piecesGroup.center.left, roundStep) - piecesGroup.center.left,
            y: roundToStep(piecesGroup.center.top, roundStep) - piecesGroup.center.top,
            rotation: roundToStep(piecesGroup.pieces[0].position.angle, angleStep) - piecesGroup.pieces[0].position.angle
                + angleStep * (!isClick || reason !== GestureFinishReason.pointerUp ? 0 : isRightButton ? -1 : 1),
            scale: 1,
        };

        onStateChange(jigsawPieceStateChangeAction(
            puzzle,
            undefined,
            myClientId,
            `gesture-${id}`,
            piecesGroup.indexes,
            ({position}, pieceIndex) => ({
                position: moveJigsawPieceByGroupGesture(piecesGroup, groupGesture, pieces[pieceIndex], position),
                state: {animating: true},
            })
        ));
    },
};

const getJigsawPiecesByGesture = (
    {cellsIndex, state}: PuzzleContext<JigsawPTM>,
    {pointers}: GestureInfo<PuzzleContext<JigsawPTM>>,
) => {
    const {extension: {pieces: piecePositions}} = gameStateGetCurrentFieldState(state);

    const cells = pointers
        .map(({start: {extraData}}) => isCellGestureExtraData(extraData) ? extraData.cell : undefined)
        .filter(Boolean) as Position[];
    if (cells.length < pointers.length) {
        return undefined;
    }

    const groups = groupJigsawPiecesByZIndex(getJigsawPiecesWithCache(cellsIndex).pieces, piecePositions);
    const matchingGroups = cells.map((cell) => groups.find(({cells}) => arrayContainsPosition(cells, cell)));

    // return the group if it's the same for all pointers
    return matchingGroups.every((group) => group === matchingGroups[0])
        ? matchingGroups[0]
        : undefined;
};
