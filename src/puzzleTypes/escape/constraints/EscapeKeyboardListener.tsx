import { Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { EscapePTM } from "../types/EscapePTM";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { useEventListener } from "../../../hooks/useEventListener";
import { CellsMap, mergeCellsMaps } from "../../../types/puzzle/CellsMap";
import { settings } from "../../../types/layout/Settings";

const EscapeKeyboardListener = observer(function EscapeMonsterFc({ context }: ConstraintProps<EscapePTM>) {
    useEventListener(window, "keydown", (ev) => {
        if (!context.isReady || settings.isOpened || context.resultCheck.isCorrectResult) {
            return;
        }

        if (ev.key === " ") {
            ev.preventDefault();
            ev.stopPropagation();

            const newInitialDigits: CellsMap<number> = {};
            for (const { top, left } of context.selectedCells.items) {
                if (context.allInitialDigits[top]?.[left] !== undefined) {
                    continue;
                }

                const { usersDigit, centerDigits, cornerDigits } = context.getCell(top, left);
                let value = usersDigit;
                if (value === undefined && centerDigits.size === 1) {
                    value = centerDigits.first();
                }
                if (value === undefined && cornerDigits.size === 1) {
                    value = cornerDigits.first();
                }
                if (value !== undefined) {
                    newInitialDigits[top] ??= {};
                    newInitialDigits[top][left] = value;
                }
            }

            context.onStateChange({
                initialDigits: mergeCellsMaps(context.stateInitialDigits, newInitialDigits),
            });
        }
    });

    return null;
});

export const EscapeKeyboardListenerConstraint: Constraint<EscapePTM> = {
    name: "escape keyboard listener",
    cells: [],
    props: undefined,
    component: { [GridLayer.regular]: EscapeKeyboardListener },
};
