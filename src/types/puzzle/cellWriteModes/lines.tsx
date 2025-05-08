import { CellWriteMode } from "../CellWriteMode";
import type { CellWriteModeInfo } from "../CellWriteModeInfo";
import { gameStateContinueMultiLine, gameStateResetCurrentMultiLine, gameStateStartMultiLine } from "../GameState";
import { GestureFinishReason } from "../../../utils/gestures";
import { applyCurrentMultiLineAction } from "../GameStateAction";
import { CellBackground } from "../../../components/puzzle/cell/CellBackground";
import { AnyPTM } from "../PuzzleTypeMap";
import { LinesDigitModeButton } from "../../../components/puzzle/controls/LinesDigitModeButton";
import { isCellGestureExtraData } from "../CellGestureExtraData";

export const LinesCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<T> => ({
    mode: CellWriteMode.lines,
    mainButtonContent: LinesDigitModeButton,
    isActiveForPuzzle: ({ allowDrawing = [] }) => allowDrawing.length !== 0,
    hotKeyStr: ["Alt"],
    isNoSelectionMode: true,
    onCornerClick: ({ gesture: { id } }, context, { exact }) =>
        context.onStateChange((context) => gameStateStartMultiLine(context, exact)),
    onCornerEnter: (
        {
            gesture: {
                id,
                pointers: [
                    {
                        start: { extraData },
                    },
                ],
            },
        },
        context,
        cellData,
    ) => {
        const startRegionIndex = isCellGestureExtraData(extraData) ? extraData.regionIndex : undefined;
        if (context.puzzle.typeManager.regionSpecificUserMarks && startRegionIndex !== cellData.regionIndex) {
            return;
        }
        context.onStateChange((context) => gameStateContinueMultiLine(context, cellData));
    },
    onGestureEnd: (
        {
            gesture: {
                id,
                isClick,
                pointers: [
                    {
                        start: {
                            extraData,
                            event: { button },
                        },
                    },
                ],
            },
            reason,
        },
        context,
    ) =>
        context.onStateChange(
            reason === GestureFinishReason.pointerUp
                ? applyCurrentMultiLineAction(
                      `gesture-${id}`,
                      isCellGestureExtraData(extraData) ? extraData.regionIndex : undefined,
                      isClick,
                      !!button,
                  )
                : gameStateResetCurrentMultiLine,
        ),
    digitsCount: ({ puzzle: { disableLineColors } }) => (disableLineColors ? 0 : 9),
    secondaryButtonContent: (context, _, cellSize, index) => (
        <CellBackground context={context} colors={[index]} size={cellSize} noOpacity={true} />
    ),
    getCurrentSecondaryButton: ({ puzzle: { disableLineColors }, selectedColor }) =>
        disableLineColors ? undefined : selectedColor,
    setCurrentSecondaryButton: (context, index) => context.onStateChange({ selectedColor: index }),
    handlesRightMouseClick: true,
});
