import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { useTranslate } from "../../../hooks/useTranslate";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { textColor } from "../../app/globals";
import { ControlButton } from "./ControlButton";
import { useCallback } from "react";
import { emptyPosition } from "../../../types/layout/Position";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const MoveDigitModeButton: ControlButtonItemPropsGenericFc = observer(function MoveDigitModeButton<
    T extends AnyPTM,
>({ context, top, left, info }: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        puzzle: {
            typeManager: { initialAngle = 0, initialScale = 1 },
            loopHorizontally,
            loopVertically,
        },
        cellSizeForSidePanel: cellSize,
        cellWriteMode,
    } = context;

    const translate = useTranslate();

    const handleResetPosition = useCallback(
        () =>
            context.onStateChange({
                animating: false,
                loopOffset: emptyPosition,
                angle: initialAngle,
                scale: initialScale,
            }),
        [context, initialAngle, initialScale],
    );

    return (
        <>
            <CellWriteModeButton
                top={top}
                left={left}
                cellWriteMode={CellWriteMode.move}
                data={(size) => (
                    <AutoSvg
                        width={size}
                        height={size}
                        viewBox={{
                            top: -1.1,
                            left: -1.1,
                            width: 2.2,
                            height: 2.2,
                        }}
                    >
                        <line x1={-1} y1={0} x2={1} y2={0} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"-0.7,0.3 -1,0 -0.7,-0.3"} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"0.7,0.3 1,0 0.7,-0.3"} stroke={textColor} strokeWidth={0.15} />
                        <line x1={0} y1={-1} x2={0} y2={1} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"0.3,-0.7 0,-1 -0.3,-0.7"} stroke={textColor} strokeWidth={0.15} />
                        <polyline points={"0.3,0.7 0,1 -0.3,0.7"} stroke={textColor} strokeWidth={0.15} />
                    </AutoSvg>
                )}
                noBorders={true}
                title={`${translate(info?.title ?? "Move the grid")} ${info?.hotKeyStr ? `(${translate("shortcut")}: ${info?.hotKeyStr})` : ""}`}
                context={context}
            />

            {cellWriteMode === CellWriteMode.move && (loopHorizontally || loopVertically) && (
                <ControlButton
                    cellSize={cellSize}
                    left={0}
                    top={0}
                    width={3}
                    fullWidth={true}
                    onClick={handleResetPosition}
                >
                    {(contentSize) => <div style={{ fontSize: contentSize * 0.6 }}>{translate("Reset position")}</div>}
                </ControlButton>
            )}
        </>
    );
});
