import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "../../../components/sudoku/controls/CellWriteModeButton";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {QuadMastersGameState} from "../types/QuadMastersGameState";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {quads} from "../data/translations";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {QuadByData} from "../../../components/sudoku/constraints/quad/Quad";
import {textColor} from "../../../components/app/globals";
import {useEventListener} from "../../../hooks/useEventListener";
import {setQuadPositionAction} from "../types/QuadMastersSudokuTypeManager";
import {QuadleByData, QuadleDigitType} from "../../../components/sudoku/constraints/quadle/Quadle";

export const QuadMastersControls = (isQuadle: boolean) => function QuadMastersControlsComponent(
    {context, isHorizontal}: ControlsProps<number, QuadMastersGameState, QuadMastersGameState>
) {
    const translate = useTranslate();

    const {
        state: {isShowingSettings, isMyTurn, isQuadTurn, cellWriteMode},
        onStateChange,
    } = context;

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        if (ev.ctrlKey || ev.shiftKey || ev.altKey) {
            return;
        }

        switch (ev.code) {
            case "KeyQ":
            case "Tab":
                onStateChange(({persistentCellWriteMode}) => ({
                    persistentCellWriteMode: persistentCellWriteMode === CellWriteMode.custom ? CellWriteMode.main : CellWriteMode.custom
                }));
                ev.preventDefault();
                break;
            case "Home":
                onStateChange({persistentCellWriteMode: CellWriteMode.main});
                ev.preventDefault();
                break;
            case "End":
                onStateChange({persistentCellWriteMode: CellWriteMode.custom});
                ev.preventDefault();
                break;
            case "Escape":
                if (isMyTurn && isQuadTurn && cellWriteMode === CellWriteMode.custom) {
                    onStateChange(setQuadPositionAction(undefined));
                }
                break;
        }
    });

    return <CellWriteModeButton
        top={isHorizontal ? 3 : 4}
        left={isHorizontal ? 4 : 3}
        cellWriteMode={CellWriteMode.custom}
        data={cellSize => <AutoSvg
            width={cellSize}
            height={cellSize}
            viewBox={"0 0 1 1"}
        >
            <line
                x1={0}
                y1={0.5}
                x2={1}
                y2={0.5}
                stroke={textColor}
                strokeWidth={1 / cellSize}
            />

            <line
                x1={0.5}
                y1={0}
                x2={0.5}
                y2={1}
                stroke={textColor}
                strokeWidth={1 / cellSize}
            />

            {isQuadle && <QuadleByData
                context={context}
                cells={[{top: 0.5, left: 0.5}]}
                digits={[
                    {digit: 1, type: QuadleDigitType.here},
                    {digit: 2, type: QuadleDigitType.elsewhere},
                    {digit: 3, type: QuadleDigitType.nowhere},
                    {digit: 4, type: QuadleDigitType.unknown},
                ]}
            />}
            {!isQuadle && <QuadByData
                context={context}
                cells={[{top: 0.5, left: 0.5}]}
                expectedDigits={[1, 2, 3, 4]}
            />}
        </AutoSvg>}
        fullSize={true}
        title={`${translate(quads)} (${translate("shortcut")}: Q / End)`}
        context={context}
    />;
};
