import {JigsawPTM} from "../types/JigsawPTM";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";

export const JigsawMoveButtonHint = (
    {
        context: {
            puzzle: {importOptions: {angleStep} = {}},
            cellSizeForSidePanel: cellSize,
            state: {processed: {cellWriteMode}}
        },
    }: ControlButtonItemProps<JigsawPTM>
) => {
    const translate = useTranslate();

    const paragraphStyles = {marginBottom: "0.5em"};

    return <>
        {cellWriteMode === CellWriteMode.move && <Absolute
            left={0}
            top={0}
            width={cellSize * (3 + 2 * controlButtonPaddingCoeff)}
            style={{fontSize: cellSize * 0.3}}
        >
            <div style={paragraphStyles}>
                {translate({
                    [LanguageCode.en]: "Drag the jigsaw piece to move it" + (angleStep ? ", click it to rotate" : ""),
                    [LanguageCode.ru]: "Перетащите кусок пазла, чтобы двигать его" + (angleStep ? ". Щелкните по нему, чтобы повернуть" : ""),
                })}.
            </div>
            <div style={paragraphStyles}>
                {translate({
                    [LanguageCode.en]: "Drag the grid to move it, use +/- buttons to zoom",
                    [LanguageCode.ru]: "Перетащите поле, чтобы двигать его. Используйте кнопки +/- для увеличения/отдаления поля",
                })}.
            </div>
        </Absolute>}
    </>;
};
