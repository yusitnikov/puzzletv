import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { Position } from "../../../types/layout/Position";
import { ComponentType, ReactElement, useMemo } from "react";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeInfo, getAllowedPuzzleInputModeInfos } from "../../../types/puzzle/PuzzleInputModeInfo";
import { ResetButton } from "./ResetButton";
import { SettingsButton } from "./SettingsButton";
import { ResultCheckButton } from "./ResultCheckButton";
import { UndoButton } from "./UndoButton";
import { RedoButton } from "./RedoButton";
import { DeleteButton } from "./DeleteButton";
import { MultiSelectionButton } from "./MultiSelectionButton";
import { isTouchDevice } from "../../../utils/isTouchDevice";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export enum ControlButtonRegion {
    // main digit, corner marks, center marks, colors, pen tool, etc.
    modes,
    // reset, settings, solution check, etc.
    right,
    // undo, redo, delete
    bottom,
    // misc buttons below the "bottom" region, e.g. animation speed, sticky mode, zoom
    additional,
    // buttons with random positioning (usually it's something in the digits area)
    custom,
}

export interface ControlButtonItemProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
    info?: PuzzleInputModeInfo<T>;
}

export type ControlButtonItemPropsGenericFc = <T extends AnyPTM>(
    props: ControlButtonItemProps<T>,
) => ReactElement | null;

export interface ControlButtonItem<T extends AnyPTM> {
    key: string;
    region: ControlButtonRegion;
    Component: ComponentType<ControlButtonItemProps<T>>;
    info?: PuzzleInputModeInfo<T>;
}

export class ControlButtonsManager<T extends AnyPTM> {
    private readonly regions: Record<ControlButtonRegion, Omit<ControlButtonItem<T>, "region">[]> = {
        [ControlButtonRegion.modes]: [],
        [ControlButtonRegion.right]: [],
        [ControlButtonRegion.bottom]: [],
        [ControlButtonRegion.additional]: [],
        [ControlButtonRegion.custom]: [],
    };

    private readonly isCompact: boolean;
    public readonly width: number;
    public readonly height: number;

    constructor(
        private readonly puzzle: PuzzleDefinition<T>,
        private readonly isHorizontal: boolean,
    ) {
        const { resultChecker, forceAutoCheckOnFinish = false, hideDeleteButton } = puzzle;

        const {
            [ControlButtonRegion.modes]: modes,
            [ControlButtonRegion.right]: right,
            [ControlButtonRegion.bottom]: bottom,
            [ControlButtonRegion.additional]: additional,
            [ControlButtonRegion.custom]: custom,
        } = this.regions;

        const allowedInputModes = getAllowedPuzzleInputModeInfos(puzzle);

        if (allowedInputModes.length > 1) {
            modes.push(
                ...allowedInputModes
                    .filter(({ mode, mainButtonContent }) => mainButtonContent)
                    .map<Omit<ControlButtonItem<T>, "region">>((info) => ({
                        key: `mode-${info.mode}`,
                        Component: info.mainButtonContent!,
                        info,
                    })),
            );
        }

        right.push(
            {
                key: "reset",
                Component: ResetButton,
            },
            {
                key: "settings",
                Component: SettingsButton,
            },
        );

        if (resultChecker) {
            (forceAutoCheckOnFinish ? custom : right).push({
                key: "result-check",
                Component: ResultCheckButton,
            });
        }

        if (isTouchDevice || process.env.REACT_APP_FORCE_MULTI_SELECTION) {
            right.push({
                key: "multi-selection",
                Component: MultiSelectionButton,
            });
        }

        bottom.push(
            {
                key: "undo",
                Component: UndoButton,
            },
            {
                key: "redo",
                Component: RedoButton,
            },
        );

        if (!hideDeleteButton) {
            bottom.push({
                key: "delete",
                Component: DeleteButton,
            });
        }

        for (const item of puzzle.typeManager.controlButtons ?? []) {
            if (item) {
                const { region, ...other } = item;
                this.regions[region].push(other);
            }
        }

        this.isCompact = !allowedInputModes.some(
            ({ mode, isDigitMode }) => isDigitMode || [PuzzleInputMode.color, PuzzleInputMode.shading].includes(mode),
        );

        const hasBottomRowControls = additional.length !== 0 || modes.length + right.length > 8;
        if (hasBottomRowControls) {
            // noinspection JSUnusedAssignment
            this.isHorizontal = isHorizontal = true;
        }

        this.width = this.isCompact ? 3 : 5;
        this.height = (this.isCompact ? 2 : 4) + (hasBottomRowControls ? 1 : 0);
    }

    render(context: PuzzleContext<T>) {
        const {
            [ControlButtonRegion.modes]: modes,
            [ControlButtonRegion.right]: right,
            [ControlButtonRegion.bottom]: bottom,
            [ControlButtonRegion.additional]: additional,
            [ControlButtonRegion.custom]: custom,
        } = this.regions;

        const realHeight = this.isHorizontal ? this.height : this.width;

        const isRevertedBottom = this.isCompact && !this.isHorizontal;
        const bottomRow = this.isCompact ? 0 : 3;

        const isRevertedRight = this.isCompact === this.isHorizontal;
        const rightColumn = this.isCompact ? 1 : 4;

        return (
            <>
                {modes.slice(0, realHeight).map(({ key, Component, info }, index) => (
                    <Component key={key} context={context} top={index} left={3} info={info} />
                ))}

                {[...right, ...modes.slice(realHeight)].map(({ key, Component, info }, index) => (
                    <Component
                        key={key}
                        context={context}
                        top={isRevertedRight ? rightColumn : index}
                        left={isRevertedRight ? index : rightColumn}
                        info={info}
                    />
                ))}

                {bottom.map(({ key, Component, info }, index) => {
                    const content = (
                        <Component
                            key={key}
                            context={context}
                            top={isRevertedBottom ? index : bottomRow}
                            left={isRevertedBottom ? bottomRow : index}
                            info={info}
                        />
                    );

                    if (!(context.maxDigitInCurrentMode < 10 || index !== 1)) {
                        // Render the button as hidden, but support the hotkeys
                        return (
                            <div key={key} style={{ display: "none" }}>
                                {content}
                            </div>
                        );
                    }

                    return content;
                })}

                {additional.map(({ key, Component, info }, index) => (
                    <Component key={key} context={context} top={realHeight - 1} left={index} info={info} />
                ))}

                {custom.map(({ key, Component, info }) => (
                    <Component key={key} context={context} top={0} left={0} info={info} />
                ))}
            </>
        );
    }
}

export const useControlButtonsManager = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, isHorizontal: boolean) =>
    useMemo(() => new ControlButtonsManager(puzzle, isHorizontal), [puzzle, isHorizontal]);
