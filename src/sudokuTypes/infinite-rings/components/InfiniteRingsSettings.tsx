import {SettingsContentProps} from "../../../components/sudoku/controls/settings/SettingsContent";
import {useTranslate} from "../../../hooks/useTranslate";
import {
    isShowingAllInfiniteRingsAllowed,
    useIsFocusingInfiniteRings,
    useIsShowingAllInfiniteRings
} from "../types/InfiniteRingsLayout";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {SettingsItem} from "../../../components/sudoku/controls/settings/SettingsItem";
import {SettingsCheckbox} from "../../../components/sudoku/controls/settings/SettingsCheckbox";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const InfiniteRingsSettings = (visibleRingsCountArg = 2) => function InfiniteRingsSettingsComponent<T extends AnyPTM>(
    {context, cellSize}: SettingsContentProps<T>
) {
    const translate = useTranslate();

    const [isShowingAllInfiniteRings, setIsShowingAllInfiniteRings] = useIsShowingAllInfiniteRings(context, visibleRingsCountArg);
    const [isFocusingInfiniteRings, setIsFocusingInfiniteRings] = useIsFocusingInfiniteRings();

    if (!isShowingAllInfiniteRingsAllowed(visibleRingsCountArg)) {
        return null;
    }

    return <>
        <SettingsItem>
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

        {isShowingAllInfiniteRings && <SettingsItem>
            {translate({
                [LanguageCode.en]: "Focus on two rings",
                [LanguageCode.ru]: "Сосредоточиться на двух кольцах",
            })}:

            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={isFocusingInfiniteRings}
                onChange={(ev) => setIsFocusingInfiniteRings(ev.target.checked)}
            />
        </SettingsItem>}
    </>;
};
