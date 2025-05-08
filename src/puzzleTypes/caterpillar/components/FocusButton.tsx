import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import {
    ControlButtonItem,
    ControlButtonItemProps,
    ControlButtonRegion,
} from "../../../components/puzzle/controls/ControlButtonsManager";
import { profiler } from "../../../utils/profiler";
import { gameStateFocusRect, gameStateSetSelectedCells } from "../../../types/puzzle/GameState";
import { useEventListener } from "../../../hooks/useEventListener";
import { settings } from "../../../types/layout/Settings";
import { ControlButton } from "../../../components/puzzle/controls/ControlButton";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { CenterFocusStrong } from "@emotion-icons/material";
import { cancelOutsideClickProps } from "../../../utils/gestures";
import { usePuzzleContainer } from "../../../contexts/PuzzleContainerContext";
import { CaterpillarPTM } from "../types/CaterpillarPTM";
import { CaterpillarPuzzleExtension } from "../types/CaterpillarPuzzleExtension";
import { isCellInRect, Rect } from "../../../types/layout/Rect";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { Button } from "../../../components/layout/button/Button";
import { Translatable } from "../../../types/translations/Translatable";
import { getGridRegionCells } from "../../../types/puzzle/GridRegion";
import { translate } from "../../../utils/translate";

const buttonLabel: Translatable = {
    [LanguageCode.en]: "Focus next grid",
    [LanguageCode.ru]: "Перейти к следующему полю",
    [LanguageCode.de]: "Fokus auf nächstes Raster",
};

const focusNextGrid = <T extends AnyPTM>(context: PuzzleContext<CaterpillarPTM<T>>, fieldRect: Rect) => {
    const { caterpillarGrids } = context.puzzle.extension as CaterpillarPuzzleExtension;

    const nextGrid =
        caterpillarGrids.find((grid) =>
            getGridRegionCells(grid.bounds).some(({ top, left }) => context.getUserDigit(top, left) === undefined),
        ) ?? caterpillarGrids[caterpillarGrids.length - 1];

    gameStateFocusRect(context, nextGrid.outsideBounds, fieldRect);

    // Select the first cell of the desired grid that doesn't belong to any other grid
    const nextSelectedCell = getGridRegionCells(nextGrid.bounds).find(
        (cell) => !caterpillarGrids.some((grid) => grid !== nextGrid && isCellInRect(grid.bounds, cell)),
    );
    if (nextSelectedCell) {
        context.onStateChange((context) => gameStateSetSelectedCells(context, [nextSelectedCell]));
    }
};

const FocusButton = observer(function FocusButtonComponent<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<CaterpillarPTM<T>>) {
    profiler.trace();

    const fieldRect = usePuzzleContainer(true)!;

    const handleAction = () => focusNextGrid(context, fieldRect);

    useEventListener(window, "keydown", (ev) => {
        if (!settings.isOpened && ev.code === "KeyF") {
            handleAction();
            ev.preventDefault();
        }
    });

    return (
        <ControlButton
            top={top}
            left={left}
            cellSize={context.cellSizeForSidePanel}
            onClick={handleAction}
            title={translate(buttonLabel) + " (F)"}
        >
            <CenterFocusStrong />
        </ControlButton>
    );
});

export const FocusButtonItem = <T extends AnyPTM>(): ControlButtonItem<CaterpillarPTM<T>> => ({
    key: "caterpillar-focus",
    region: ControlButtonRegion.additional,
    Component: FocusButton,
});

interface FocusButtonRuleProps<T extends AnyPTM> {
    context: PuzzleContext<CaterpillarPTM<T>>;
}
export const FocusButtonRule = observer(function FocusButtonRule<T extends AnyPTM>({
    context,
}: FocusButtonRuleProps<T>) {
    profiler.trace();

    const fieldRect = usePuzzleContainer(true)!;

    return (
        <Button
            cellSize={context.cellSizeForSidePanel}
            {...cancelOutsideClickProps}
            onClick={() => focusNextGrid(context, fieldRect)}
        >
            <CenterFocusStrong size={"1em"} />

            <span>&nbsp;{translate(buttonLabel)}</span>
        </Button>
    );
});
