import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "../../../components/sudoku/controls/CellWriteModeButton";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {QuadMastersGameState} from "../types/QuadMastersGameState";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {Quads} from "../data/translations";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {QuadByData} from "../../../components/sudoku/constraints/quad/Quad";
import {textColor} from "../../../components/app/globals";

export const QuadMastersControls = (
    {context}: ControlsProps<number, QuadMastersGameState, QuadMastersGameState>
) => {
    const translate = useTranslate();

    return <CellWriteModeButton
        top={3}
        left={4}
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

            <QuadByData
                puzzle={context.puzzle}
                cells={[{top: 0.5, left: 0.5}]}
                expectedDigits={[1, 2, 3, 4]}
            />
        </AutoSvg>}
        fullSize={true}
        title={translate(Quads)}
        context={context}
    />;
};
