import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "../../../controls/CellWriteModeButton";
import {useTranslate} from "../../../../../hooks/useTranslate";
import {quads} from "../../../../../sudokuTypes/quad-masters/data/translations";
import {AutoSvg} from "../../../../svg/auto-svg/AutoSvg";
import {QuadByData} from "../Quad";
import {textColor} from "../../../../app/globals";
import {useEventListener} from "../../../../../hooks/useEventListener";
import {QuadleByData, QuadleDigitType} from "../Quadle";
import {QuadInputSudokuTypeManagerOptions} from "./QuadInputSudokuTypeManager";
import {setQuadPositionAction} from "./setQuadPositionAction";
import {indexesFromTo} from "../../../../../utils/indexes";
import {ControlButtonItemProps} from "../../../controls/ControlButtonsManager";
import {AnyQuadInputPTM} from "./QuadInputPTM";
import {getNextActionId} from "../../../../../types/sudoku/GameStateAction";

export const QuadInputModeButton = <T extends AnyQuadInputPTM>(
    options: QuadInputSudokuTypeManagerOptions<T>
) => function QuadInputModeButtonComponent({context, top, left}: ControlButtonItemProps<T>) {
    const translate = useTranslate();

    const {
        isQuadle = false,
        isQuadAllowedFn = () => true,
        onQuadFinish,
        radius,
    } = options;

    const {
        puzzle: {typeManager: {createCellDataByDisplayDigit}},
        state,
        onStateChange,
    } = context;

    const {
        isShowingSettings,
        processed: {isMyTurn, cellWriteMode},
        extension: {currentQuad},
    } = state;

    useEventListener(window, "keydown", (ev) => {
        if (isShowingSettings) {
            return;
        }

        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) {
            return;
        }

        switch (ev.code) {
            case "KeyQ":
            case "Tab":
                onStateChange(({persistentCellWriteMode}) => ({
                    persistentCellWriteMode: persistentCellWriteMode === CellWriteMode.quads ? CellWriteMode.main : CellWriteMode.quads
                }));
                ev.preventDefault();
                break;
            case "Home":
                onStateChange({persistentCellWriteMode: CellWriteMode.main});
                ev.preventDefault();
                break;
            case "End":
                onStateChange({persistentCellWriteMode: CellWriteMode.quads});
                ev.preventDefault();
                break;
            case "Escape":
                if (isMyTurn && isQuadAllowedFn(state) && cellWriteMode === CellWriteMode.quads && currentQuad && (onQuadFinish || !currentQuad.digits.length)) {
                    onStateChange(setQuadPositionAction(undefined, options, getNextActionId()));
                    ev.preventDefault();
                }
                break;
        }
    });

    const digitExamples = indexesFromTo(1, 4).map(digit => createCellDataByDisplayDigit(digit, state));

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.quads}
        data={cellSize => <AutoSvg
            width={cellSize}
            height={cellSize}
            viewBox={{top: 0, left: 0, width: 1, height: 1}}
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
                props={{
                    digits: [
                        {
                            digit: digitExamples[0],
                            type: QuadleDigitType.here
                        },
                        {
                            digit: digitExamples[1],
                            type: QuadleDigitType.elsewhere
                        },
                        {
                            digit: digitExamples[2],
                            type: QuadleDigitType.nowhere
                        },
                        {
                            digit: digitExamples[3],
                            type: QuadleDigitType.unknown
                        },
                    ]
                }}
            />}
            {!isQuadle && <QuadByData
                context={context}
                cells={[{top: 0.5, left: 0.5}]}
                props={{
                    expectedDigits: digitExamples,
                    radius,
                }}
            />}
        </AutoSvg>}
        fullHeight={true}
        title={`${translate(quads)} (${translate("shortcut")}: Q / End)`}
        context={context}
    />;
};
