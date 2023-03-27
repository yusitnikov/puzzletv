import {SettingsContentProps} from "../../../components/sudoku/controls/settings/SettingsContent";
import {useTranslate} from "../../../hooks/useTranslate";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {SettingsItem} from "../../../components/sudoku/controls/settings/SettingsItem";
import {SettingsCheckbox} from "../../../components/sudoku/controls/settings/SettingsCheckbox";

export const InfiniteRingsSettings = <CellType, ExType, ProcessedExType>(
    {cellSize}: SettingsContentProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    const [isShowingAllInfiniteRings, setIsShowingAllInfiniteRings] = useIsShowingAllInfiniteRings();

    return <SettingsItem>
        {translate({
            [LanguageCode.en]: "Show all rings",
            [LanguageCode.ru]: "Показывать все кольца",
        })}:

        <SettingsCheckbox
            type={"checkbox"}
            cellSize={cellSize}
            checked={isShowingAllInfiniteRings}
            onChange={(ev) => setIsShowingAllInfiniteRings(ev.target.checked)}
        />
    </SettingsItem>
};
