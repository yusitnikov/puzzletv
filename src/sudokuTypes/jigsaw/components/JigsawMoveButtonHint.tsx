import { JigsawPTM } from "../types/JigsawPTM";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { Absolute } from "../../../components/layout/absolute/Absolute";
import { controlButtonPaddingCoeff } from "../../../components/sudoku/controls/ControlButton";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { ControlButtonItemProps } from "../../../components/sudoku/controls/ControlButtonsManager";
import { jssTag } from "../../jss/constraints/Jss";
import { JigsawJssCluesVisibility } from "../types/JigsawGameState";
import { observer } from "mobx-react-lite";
import { useComputed } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";
import { JigsawSudokuPhrases } from "../types/JigsawSudokuPhrases";
import { translate } from "../../../utils/translate";

interface JigsawMoveButtonHintProps extends ControlButtonItemProps<JigsawPTM> {
    phrases: JigsawSudokuPhrases;
}

export const JigsawMoveButtonHint = observer(function JigsawMoveButtonHint({
    context,
    phrases,
}: JigsawMoveButtonHintProps) {
    profiler.trace();

    const isJss = useComputed(function isJss() {
        return context.allItems.some(({ tags }) => tags?.includes(jssTag));
    });

    if (context.cellWriteMode !== CellWriteMode.move) {
        return null;
    }

    const {
        puzzle: { importOptions: { angleStep } = {} },
        cellSizeForSidePanel: cellSize,
        stateExtension: { jssCluesVisibility },
    } = context;

    const paragraphStyles = { marginBottom: "0.5em" };

    return (
        <Absolute
            left={0}
            top={0}
            width={cellSize * (3 + 2 * controlButtonPaddingCoeff)}
            style={{ fontSize: cellSize * 0.25 }}
        >
            <div style={paragraphStyles}>{translate(phrases.dragPieceToMove(!!angleStep))}.</div>
            <div style={paragraphStyles}>
                {translate({
                    [LanguageCode.en]: "Drag the grid to move it, use +/- buttons to zoom",
                    [LanguageCode.ru]: "Перетащите поле, чтобы двигать его. Нажмите на +/- для увел./отдаления поля",
                    [LanguageCode.de]: "Ziehen Sie das Raster, um es zu verschieben. Drücken Sie +/- zum Zoomen",
                })}
                .
            </div>

            {isJss() && (
                <div style={paragraphStyles}>
                    <label>
                        {translate({
                            [LanguageCode.en]: "Show Japanese sums clues",
                            [LanguageCode.ru]: "Показывать японские суммы",
                            [LanguageCode.de]: "Hinweise zu japanischen Summen anzeigen",
                        })}
                        :<br />
                        <select
                            value={jssCluesVisibility}
                            onChange={(ev) =>
                                context.onStateChange({ extension: { jssCluesVisibility: Number(ev.target.value) } })
                            }
                            style={{ pointerEvents: "all", maxWidth: "100%", fontSize: "inherit" }}
                        >
                            <option value={JigsawJssCluesVisibility.All}>{translate("Yes")}</option>
                            <option value={JigsawJssCluesVisibility.ForActiveRegion}>
                                {translate(phrases.forActivePiece)}
                            </option>
                            <option value={JigsawJssCluesVisibility.None}>{translate("No")}</option>
                        </select>
                    </label>
                </div>
            )}
        </Absolute>
    );
});
