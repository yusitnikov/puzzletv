import {SettingsContentProps} from "../../../components/sudoku/controls/settings/SettingsContent";
import {useTranslate} from "../../../hooks/useTranslate";
import {isShowingAllInfiniteRingsAllowed, useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {SettingsItem} from "../../../components/sudoku/controls/settings/SettingsItem";
import {SettingsCheckbox} from "../../../components/sudoku/controls/settings/SettingsCheckbox";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const InfiniteRingsSettings = (visibleRingsCountArg = 2) => function InfiniteRingsSettingsComponent<T extends AnyPTM>(
    {context, cellSize}: SettingsContentProps<T>
) {
    const translate = useTranslate();

    const [isShowingAllInfiniteRings, setIsShowingAllInfiniteRings] = useIsShowingAllInfiniteRings(context, visibleRingsCountArg);

    if (!isShowingAllInfiniteRingsAllowed(visibleRingsCountArg)) {
        return null;
    }

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
