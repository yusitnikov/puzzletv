import {JigsawPTM} from "../types/JigsawPTM";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {getAllPuzzleConstraints} from "../../../types/sudoku/Constraint";
import {jssTag} from "../../jss/constraints/Jss";
import {JigsawJssCluesVisibility} from "../types/JigsawGameState";

export const JigsawMoveButtonHint = ({context}: ControlButtonItemProps<JigsawPTM>) => {
    const {
        puzzle: {importOptions: {angleStep} = {}},
        cellSizeForSidePanel: cellSize,
        state: {extension: {jssCluesVisibility}, processed: {cellWriteMode}},
        onStateChange,
    } = context;

    const translate = useTranslate();

    if (cellWriteMode !== CellWriteMode.move) {
        return null;
    }

    const paragraphStyles = {marginBottom: "0.5em"};

    const isJss = getAllPuzzleConstraints(context).some(({tags}) => tags?.includes(jssTag));

    return <Absolute
        left={0}
        top={0}
        width={cellSize * (3 + 2 * controlButtonPaddingCoeff)}
        style={{fontSize: cellSize * 0.25}}
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

        {isJss && <div style={paragraphStyles}>
            <label>
                {translate({
                    [LanguageCode.en]: "Show Japanese sums clues",
                    [LanguageCode.ru]: "Показывать японские суммы",
                })}:<br/>
                <select
                    value={jssCluesVisibility}
                    onChange={(ev) => onStateChange({extension: {jssCluesVisibility: Number(ev.target.value)}})}
                    style={{pointerEvents: "all", maxWidth: "100%", fontSize: "inherit"}}
                >
                    <option value={JigsawJssCluesVisibility.All}>{translate("Yes")}</option>
                    <option value={JigsawJssCluesVisibility.ForActiveRegion}>{translate({
                        [LanguageCode.en]: "For active jigsaw piece",
                        [LanguageCode.ru]: "Для активного куска пазла",
                    })}</option>
                    <option value={JigsawJssCluesVisibility.None}>{translate("No")}</option>
                </select>
            </label>
        </div>}
    </Absolute>;
};
