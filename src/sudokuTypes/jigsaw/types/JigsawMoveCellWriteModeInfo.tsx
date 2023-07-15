import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {MoveCellWriteModeInfo} from "../../../types/sudoku/cellWriteModes/move";
import {getActiveJigsawPieceIndexes, groupJigsawPiecesByZIndex, moveJigsawPieceByGroupGesture} from "./helpers";
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
import {myClientId} from "../../../hooks/useMultiPlayer";
import {JigsawMoveButtonHint} from "../components/JigsawMoveButtonHint";
import {arrayContainsPosition, Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {JigsawSudokuPhrases} from "./JigsawSudokuPhrases";
import {areSameArrays} from "../../../utils/array";

export const roundStep = 0.5;

const base = MoveCellWriteModeInfo<JigsawPTM>();

export const JigsawMoveCellWriteModeInfo = (phrases: JigsawSudokuPhrases): CellWriteModeInfo<JigsawPTM> => ({
    ...base,
    title: phrases.dragModeTitle,
    mainButtonContent: observer(function JigsawMoveButton(props) {
        profiler.trace();

        return <>
            {base.mainButtonContent && <base.mainButtonContent {...props}/>}
            <JigsawMoveButtonHint {...props} phrases={phrases}/>
        </>;
    }),
    disableCellHandlers: false,
    handlesRightMouseClick: true,
    onGestureStart(props, context, ...args) {
        const {gesture} = props;

        const piecesGroup = getJigsawPiecesByGesture(context, gesture);
        if (!piecesGroup) {
            context.onStateChange({extension: {highlightCurrentPiece: false}});
            return base.onGestureStart?.(props, context, ...args);
        }

        // Bring the clicked piece to the top
        context.onStateChange(jigsawPieceBringOnTopAction(piecesGroup.indexes));
    },
    onOutsideClick(context) {
        context.onStateChange({extension: {highlightCurrentPiece: false}});
    },
    onMove(props, context, fieldRect) {
        const {gesture, startMetrics, currentMetrics} = props;
        const {id, state: startContext} = gesture;
        const {
            puzzle,
            cellSize,
        } = context;
        const {
            loopOffset,
            scale,
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

        context.onStateChange(jigsawPieceStateChangeAction(
            startContext,
            myClientId,
            `gesture-${id}`,
            piecesGroup.indexes,
            ({position}, pieceIndex) => {
                return {
                    position: moveJigsawPieceByGroupGesture(piecesGroup!, groupGesture, puzzle.extension!.pieces[pieceIndex], position),
                    state: {animating: false},
                };
            }
        ));
    },
    onGestureEnd(props, context) {
        const noAnimationContext = context.cloneWith({
            animated: undefined,
            processedGameStateExtension: undefined,
        });

        const {gesture, reason} = props;
        const {puzzle} = context;
        const {importOptions: {angleStep = 0} = {}} = puzzle;

        const piecesGroup = getJigsawPiecesByGesture(noAnimationContext, gesture);
        if (!piecesGroup) {
            base.onGestureEnd?.(props, context);
            return;
        }

        const {id, isClick, pointers: [{start: {event: {button: isRightButton}}}]} = gesture;

        const {
            stateExtension: {highlightCurrentPiece: prevHighlightCurrentPiece},
            fieldExtension: {pieces: prevPiecePositions},
        } = gesture.state;

        const rotate = isClick
            && reason === GestureFinishReason.pointerUp
            && prevHighlightCurrentPiece
            && areSameArrays(getActiveJigsawPieceIndexes(prevPiecePositions), piecesGroup.indexes);
        const groupGesture: GestureMetrics = {
            x: roundToStep(piecesGroup.center.left, roundStep) - piecesGroup.center.left,
            y: roundToStep(piecesGroup.center.top, roundStep) - piecesGroup.center.top,
            rotation: roundToStep(piecesGroup.pieces[0].position.angle, angleStep) - piecesGroup.pieces[0].position.angle
                + angleStep * (!rotate ? 0 : isRightButton ? -1 : 1),
            scale: 1,
        };

        context.onStateChange(jigsawPieceStateChangeAction(
            undefined,
            myClientId,
            `gesture-${id}`,
            piecesGroup.indexes,
            ({position}, pieceIndex) => ({
                position: moveJigsawPieceByGroupGesture(piecesGroup, groupGesture, puzzle.extension!.pieces[pieceIndex], position),
                state: {animating: true},
            })
        ));
    },
});

const getJigsawPiecesByGesture = (
    context: PuzzleContext<JigsawPTM>,
    {pointers}: GestureInfo<PuzzleContext<JigsawPTM>>,
) => {
    const cells = pointers
        .map(({start: {extraData}}) => isCellGestureExtraData(extraData) ? extraData.cell : undefined)
        .filter(Boolean) as Position[];
    if (cells.length < pointers.length) {
        return undefined;
    }

    const groups = groupJigsawPiecesByZIndex(context);
    const matchingGroups = cells.map((cell) => groups.find(({cells}) => arrayContainsPosition(cells, cell)));

    // return the group if it's the same for all pointers
    return matchingGroups.every((group) => group === matchingGroups[0])
        ? matchingGroups[0]
        : undefined;
};
