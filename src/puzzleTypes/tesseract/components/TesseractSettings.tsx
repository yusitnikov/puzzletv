import { SettingsContentProps } from "../../../components/puzzle/controls/settings/SettingsContent";
import { SettingsItem } from "../../../components/puzzle/controls/settings/SettingsItem";
import { SettingsSelect } from "../../../components/puzzle/controls/settings/SettingsSelect";
import { TesseractHighlightType, useTesseractHighlightType } from "../types/TesseractHighlight";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const TesseractSettings = observer(function TesseractSettings<T extends AnyPTM>({
    cellSize,
}: SettingsContentProps<T>) {
    profiler.trace();

    const [selectionType, setSelectionType] = useTesseractHighlightType();

    return (
        <SettingsItem>
            <span>
                {translate({
                    [LanguageCode.en]: "Highlight cells seen by tesseract",
                    [LanguageCode.ru]: "Подсвечивать клетки, видимые тессерактом",
                    [LanguageCode.de]: "Markieren Sie die von Tesseract gesehenen Zellen",
                })}
                :
            </span>

            <SettingsSelect
                cellSize={cellSize}
                value={selectionType}
                onChange={({ target: { value } }) => setSelectionType(value as TesseractHighlightType)}
            >
                <option value={TesseractHighlightType.Always}>
                    {translate({
                        [LanguageCode.en]: "Always",
                        [LanguageCode.ru]: "Всегда",
                        [LanguageCode.de]: "Immer",
                    })}
                </option>
                <option value={TesseractHighlightType.Clues}>
                    {translate({
                        [LanguageCode.en]: "Only circles",
                        [LanguageCode.ru]: "Только круги",
                        [LanguageCode.de]: "Nur Kreise",
                    })}
                </option>
                <option value={TesseractHighlightType.Never}>
                    {translate({
                        [LanguageCode.en]: "Never",
                        [LanguageCode.ru]: "Никогда",
                        [LanguageCode.de]: "Nie",
                    })}
                </option>
            </SettingsSelect>
        </SettingsItem>
    );
}) as <T extends AnyPTM>(props: SettingsContentProps<T>) => ReactElement;
