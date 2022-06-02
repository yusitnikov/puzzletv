import {CellWriteMode} from "../../../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "../../../controls/CellWriteModeButton";
import {ControlsProps} from "../../../controls/Controls";
import {useTranslate} from "../../../../../contexts/LanguageCodeContext";
import {quads} from "../../../../../sudokuTypes/quad-masters/data/translations";
import {AutoSvg} from "../../../../svg/auto-svg/AutoSvg";
import {QuadByData} from "../Quad";
import {textColor} from "../../../../app/globals";
import {useEventListener} from "../../../../../hooks/useEventListener";
import {QuadleByData, QuadleDigitType} from "../Quadle";
import {QuadInputGameState} from "./QuadInputGameState";
import {QuadInputSudokuTypeManagerOptions} from "./QuadInputSudokuTypeManager";
import {GameState} from "../../../../../types/sudoku/GameState";
import {setQuadPositionAction} from "./setQuadPositionAction";
import {indexesFromTo} from "../../../../../utils/indexes";

export const QuadInputControls = <CellType, GameStateExtensionType extends QuadInputGameState<CellType>, ProcessedGameStateExtensionType extends QuadInputGameState<CellType>>(
    options: QuadInputSudokuTypeManagerOptions<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => function QuadMastersControlsComponent(
    props: ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) {
    const translate = useTranslate();

    const {
        isQuadle = false,
        parent: {mainControlsComponent: ParentComponent},
        isQuadAllowedFn = () => true,
        onQuadFinish,
        radius,
    } = options;

    const {context, isHorizontal} = props;

    const {
        puzzle: {typeManager: {createCellDataByDisplayDigit}},
        state,
        onStateChange,
    } = context;

    const {isShowingSettings, isMyTurn, cellWriteMode, currentQuad} = state;

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
                    persistentCellWriteMode: persistentCellWriteMode === CellWriteMode.quads ? CellWriteMode.main : CellWriteMode.quads
                } as Partial<GameState<CellType>> as any));
                ev.preventDefault();
                break;
            case "Home":
                onStateChange({persistentCellWriteMode: CellWriteMode.main} as Partial<GameState<CellType>> as any);
                ev.preventDefault();
                break;
            case "End":
                onStateChange({persistentCellWriteMode: CellWriteMode.quads} as Partial<GameState<CellType>> as any);
                ev.preventDefault();
                break;
            case "Escape":
                if (isMyTurn && isQuadAllowedFn(state) && cellWriteMode === CellWriteMode.quads && currentQuad && (onQuadFinish || !currentQuad.digits.length)) {
                    onStateChange(setQuadPositionAction(undefined, options));
                    ev.preventDefault();
                }
                break;
        }
    });

    const digitExamples = indexesFromTo(1, 4).map(digit => createCellDataByDisplayDigit(digit, state));

    return <>
        {ParentComponent && <ParentComponent {...props}/>}

        <CellWriteModeButton
            top={isHorizontal ? 3 : 4}
            left={isHorizontal ? 4 : 3}
            cellWriteMode={CellWriteMode.quads}
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
                    ]}
                />}
                {!isQuadle && <QuadByData
                    context={context}
                    cells={[{top: 0.5, left: 0.5}]}
                    expectedDigits={digitExamples}
                    radius={radius}
                />}
            </AutoSvg>}
            fullSize={true}
            title={`${translate(quads)} (${translate("shortcut")}: Q / End)`}
            context={context}
        />
    </>;
};
