import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {Position} from "../../../types/layout/Position";
import {FC, useMemo} from "react";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {CellWriteMode, getAllowedCellWriteModeInfos} from "../../../types/sudoku/CellWriteMode";
import {ResetButton} from "./ResetButton";
import {SettingsButton} from "./SettingsButton";
import {ResultCheckButton} from "./ResultCheckButton";
import {MainDigitModeButton} from "./MainDigitModeButton";
import {CornerDigitModeButton} from "./CornerDigitModeButton";
import {CenterDigitModeButton} from "./CenterDigitModeButton";
import {ColorDigitModeButton} from "./ColorDigitModeButton";
import {ShadingDigitModeButton} from "./ShadingDigitModeButton";
import {LinesDigitModeButton} from "./LinesDigitModeButton";
import {MoveDigitModeButton} from "./MoveDigitModeButton";
import {UndoButton} from "./UndoButton";
import {RedoButton} from "./RedoButton";
import {DeleteButton} from "./DeleteButton";
import {MultiSelectionButton} from "./MultiSelectionButton";
import {isTouchDevice} from "../../../utils/isTouchDevice";

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

export interface ControlButtonItemProps<CellType, ExType = {}, ProcessedExType = {}> extends Position {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export interface ControlButtonItem<CellType, ExType, ProcessedExType> {
    key: string;
    region: ControlButtonRegion;
    Component: FC<ControlButtonItemProps<CellType, ExType, ProcessedExType>>;
}

export class ControlButtonsManager<CellType, ExType, ProcessedExType> {
    private readonly regions: Record<ControlButtonRegion, Omit<ControlButtonItem<CellType, ExType, ProcessedExType>, "region">[]> = {
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
        private readonly puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        private readonly isHorizontal: boolean,
    ) {
        const {
            resultChecker,
            forceAutoCheckOnFinish = false,
            hideDeleteButton,
        } = puzzle;

        const {
            [ControlButtonRegion.modes]: modes,
            [ControlButtonRegion.right]: right,
            [ControlButtonRegion.bottom]: bottom,
            [ControlButtonRegion.additional]: additional,
            [ControlButtonRegion.custom]: custom,
        } = this.regions;

        const allowedCellWriteModes = getAllowedCellWriteModeInfos(puzzle);

        if (allowedCellWriteModes.length > 1) {
            modes.push(
                ...[
                    {
                        mode: CellWriteMode.main,
                        Component: MainDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.corner,
                        Component: CornerDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.center,
                        Component: CenterDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.color,
                        Component: ColorDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.shading,
                        Component: ShadingDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.lines,
                        Component: LinesDigitModeButton,
                    },
                    {
                        mode: CellWriteMode.move,
                        Component: MoveDigitModeButton,
                    },
                ]
                    .filter(({mode}) => allowedCellWriteModes.find((item) => item.mode === mode))
                    .map(({mode, Component}) => ({key: `mode-${mode}`, Component}))
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

        if (isTouchDevice) {
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
                const {region, ...other} = item;
                this.regions[region].push(other);
            }
        }

        this.isCompact = !allowedCellWriteModes.some(
            ({mode, isDigitMode}) => isDigitMode || [CellWriteMode.color, CellWriteMode.shading].includes(mode)
        );

        const hasBottomRowControls = additional.length !== 0 || modes.length + right.length > 8;
        if (hasBottomRowControls) {
            // noinspection JSUnusedAssignment
            this.isHorizontal = isHorizontal = true;
        }

        this.width = this.isCompact ? 3 : 5;
        this.height = (this.isCompact ? 2 : 4) + (hasBottomRowControls ? 1 : 0);
    }

    render(context: PuzzleContext<CellType, ExType, ProcessedExType>) {
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
        const isColorMode = context.state.processed.cellWriteMode === CellWriteMode.color;

        const isRevertedRight = this.isCompact === this.isHorizontal;
        const rightColumn = this.isCompact ? 1 : 4;

        return <>
            {modes.slice(0, realHeight).map(({key, Component}, index) => <Component
                key={key}
                context={context}
                top={index}
                left={3}
            />)}

            {[...right, ...modes.slice(realHeight)].map(({key, Component}, index) => <Component
                key={key}
                context={context}
                top={isRevertedRight ? rightColumn : index}
                left={isRevertedRight ? index : rightColumn}
            />)}

            {bottom.map(({key, Component}, index) => (!isColorMode || index !== 1) && <Component
                key={key}
                context={context}
                top={isRevertedBottom ? index : bottomRow}
                left={isRevertedBottom ? bottomRow : index}
            />)}

            {additional.map(({key, Component}, index) => <Component
                key={key}
                context={context}
                top={realHeight - 1}
                left={index}
            />)}

            {custom.map(({key, Component}) => <Component
                key={key}
                context={context}
                top={0}
                left={0}
            />)}
        </>;
    }
}

export const useControlButtonsManager = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    isHorizontal: boolean,
) => useMemo(() => new ControlButtonsManager(puzzle, isHorizontal), [puzzle, isHorizontal]);
