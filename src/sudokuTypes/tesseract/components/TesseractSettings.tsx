import {SettingsContentProps} from "../../../components/sudoku/controls/settings/SettingsContent";
import {SettingsItem} from "../../../components/sudoku/controls/settings/SettingsItem";
import {useTranslate} from "../../../hooks/useTranslate";
import {SettingsSelect} from "../../../components/sudoku/controls/settings/SettingsSelect";
import {TesseractSelectionType, useTesseractSelectionType} from "../types/TesseractSelection";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ReactElement} from "react";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const TesseractSettings = observer(function TesseractSettings<T extends AnyPTM>({cellSize}: SettingsContentProps<T>) {
    profiler.trace();

    const translate = useTranslate();

    const [selectionType, setSelectionType] = useTesseractSelectionType();

    return <SettingsItem>
        <span>{translate({
            [LanguageCode.en]: "Highlight cells seen by tesseract",
            [LanguageCode.ru]: "Подсвечивать клетки, видимые тессерактом",
        })}:</span>

        <SettingsSelect
            cellSize={cellSize}
            value={selectionType}
            onChange={({target: {value}}) => setSelectionType(value as TesseractSelectionType)}
        >
            <option value={TesseractSelectionType.Always}>{translate({
                [LanguageCode.en]: "Always",
                [LanguageCode.ru]: "Всегда",
            })}</option>
            <option value={TesseractSelectionType.Clues}>{translate({
                [LanguageCode.en]: "Only circles",
                [LanguageCode.ru]: "Только круги",
            })}</option>
            <option value={TesseractSelectionType.Never}>{translate({
                [LanguageCode.en]: "Never",
                [LanguageCode.ru]: "Никогда",
            })}</option>
        </SettingsSelect>
    </SettingsItem>;
}) as <T extends AnyPTM>(props: SettingsContentProps<T>) => ReactElement;
