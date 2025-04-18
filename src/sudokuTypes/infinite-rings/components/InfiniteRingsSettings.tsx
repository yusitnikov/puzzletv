import { SettingsContentProps } from "../../../components/sudoku/controls/settings/SettingsContent";
import {
    focusRingsSetting,
    isShowingAllInfiniteRings,
    isShowingAllInfiniteRingsAllowed,
    showAllRingsSetting,
} from "../types/InfiniteRingsLayout";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { SettingsItem } from "../../../components/sudoku/controls/settings/SettingsItem";
import { SettingsCheckbox } from "../../../components/sudoku/controls/settings/SettingsCheckbox";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { ReactElement } from "react";
import { translate } from "../../../utils/translate";

export const InfiniteRingsSettings = (visibleRingsCountArg = 2) =>
    observer(function InfiniteRingsSettingsComponent<T extends AnyPTM>({ context, cellSize }: SettingsContentProps<T>) {
        profiler.trace();

        const showingAllInfiniteRings = isShowingAllInfiniteRings(context, visibleRingsCountArg);

        if (!isShowingAllInfiniteRingsAllowed(visibleRingsCountArg)) {
            return null;
        }

        return (
            <>
                <SettingsItem>
                    {translate({
                        [LanguageCode.en]: "Show all rings",
                        [LanguageCode.ru]: "Показывать все кольца",
                        [LanguageCode.de]: "Alle Ringe anzeigen",
                    })}
                    :
                    <SettingsCheckbox
                        type={"checkbox"}
                        cellSize={cellSize}
                        checked={showingAllInfiniteRings}
                        onChange={(ev) => showAllRingsSetting.set(ev.target.checked)}
                    />
                </SettingsItem>

                {showingAllInfiniteRings && (
                    <SettingsItem>
                        {translate({
                            [LanguageCode.en]: "Focus on two rings",
                            [LanguageCode.ru]: "Сосредоточиться на двух кольцах",
                            [LanguageCode.de]: "Konzentrieren Sie sich auf zwei Ringe",
                        })}
                        :
                        <SettingsCheckbox
                            type={"checkbox"}
                            cellSize={cellSize}
                            checked={focusRingsSetting.get()}
                            onChange={(ev) => focusRingsSetting.set(ev.target.checked)}
                        />
                    </SettingsItem>
                )}
            </>
        );
    }) as <T extends AnyPTM>(props: SettingsContentProps<T>) => ReactElement | null;
