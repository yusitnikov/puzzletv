import { getDefaultMaxDigit, getRegionCells, PuzzleDefinition } from "./PuzzleDefinition";
import {
    GameStateEx,
    gameStateGetCurrentGivenDigitsByCells,
    gameStateNormalizeLoopOffset,
    getEmptyGameState,
    getScaleLog,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
    setAllShareState,
} from "./GameState";
import { MessageWithClientId, myClientId, UseMultiPlayerResult } from "../../hooks/useMultiPlayer";
import { Dispatch } from "react";
import {
    coreGameStateActionTypes,
    GameStateAction,
    GameStateActionCallback,
    GameStateActionOrCallback,
} from "./GameStateAction";
import { PuzzleCellsIndex } from "./PuzzleCellsIndex";
import { AnyPTM } from "./PuzzleTypeMap";
import { comparer, computed, makeAutoObservable, runInAction } from "mobx";
import { computedFn, createViewModel } from "mobx-utils";
import { Position, PositionSet } from "../layout/Position";
import { isSelectableCell } from "./CellTypeProps";
import { TransformedCustomCellBounds } from "./CustomCellBounds";
import { controlKeysState } from "../../hooks/useControlKeysState";
import { getAllowedPuzzleInputModeInfos } from "./PuzzleInputModeInfo";
import { PuzzleInputMode } from "./PuzzleInputMode";
import { Constraint, toDecorativeConstraint } from "./Constraint";
import { GridLayer } from "./GridLayer";
import { getDefaultRegionsForRowsAndColumns } from "./GridSize";
import { GridLinesConstraint } from "../../components/puzzle/grid/GridLines";
import { RegionConstraint } from "../../components/puzzle/constraints/region/Region";
import { UserLinesConstraint } from "../../components/puzzle/constraints/user-lines/UserLines";
import { CellsMap, mergeCellsMaps } from "./CellsMap";
import { getFogPropsByContext, getFogVisibleCells } from "../../components/puzzle/constraints/fog/Fog";
import { setComparer, SetInterface } from "../struct/Set";
import { PuzzleLine } from "./PuzzleLine";
import { CellMark } from "./CellMark";
import { areCellStatesEqual, CellState } from "./CellState";
import { translate } from "../../utils/translate";
import { errorResultCheck, PuzzleResultCheck } from "./PuzzleResultCheck";
import { profiler } from "../../utils/profiler";
import { getGridRegionCells, GridRegion } from "./GridRegion";
import { PuzzleImportOptions } from "./PuzzleImportOptions";
import { CellPart } from "./CellPart";
import { AnimatedValue, mixAnimatedPosition, mixAnimatedValue } from "../struct/AnimatedValue";
import { settings } from "../layout/Settings";

const emptyObject = {};

export interface PuzzleContextOptions<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    puzzleIndex?: PuzzleCellsIndex<T>;
    myGameState: GameStateEx<T>;
    onStateChange?: Dispatch<GameStateActionOrCallback<any, T> | GameStateActionOrCallback<any, T>[]>;
    cellSize: number;
    cellSizeForSidePanel: number;
    isReadonlyContext: boolean;
    applyKeys: boolean;
    applyPendingMessages: boolean;
}

export interface PuzzleContextCreationOptions<T extends AnyPTM> extends Omit<PuzzleContextOptions<T>, "myGameState"> {
    myGameState: GameStateEx<T> | ((context: PuzzleContext<T>) => GameStateEx<T>);
}

// It's not a React context! Just a regular class.
export class PuzzleContext<T extends AnyPTM> implements PuzzleContextOptions<T> {
    puzzle: PuzzleDefinition<T>;
    puzzleIndex: PuzzleCellsIndex<T>;
    myGameState: GameStateEx<T>;
    cellSize: number;
    cellSizeForSidePanel: number;
    isReadonlyContext: boolean;
    applyKeys: boolean;
    applyPendingMessages: boolean;

    readonly multiPlayer: UseMultiPlayerResult<T>;

    private cache: Record<string, unknown> = {};
    private disposers: (() => void)[] = [];

    get regions() {
        profiler.trace();
        return this.puzzle.typeManager.getRegionsWithSameCoordsTransformation?.(this);
    }

    private get regionsByCellsMap() {
        profiler.trace();

        const result: CellsMap<{ index: number; region: GridRegion }> = {};
        for (const [index, region] of (this.regions ?? []).entries()) {
            for (const { top, left } of getGridRegionCells(region)) {
                result[top] ??= {};
                result[top][left] = { index, region };
            }
        }

        return result;
    }

    readonly getCellRegion = computedFn(function getCellRegion(
        this: PuzzleContext<T>,
        top: number,
        left: number,
    ): { index: number; region: GridRegion } | undefined {
        return this.regionsByCellsMap[top]?.[left];
    });

    get animated() {
        profiler.trace();

        return this.getCachedItem(
            "animatedGridTransform",
            () =>
                new AnimatedValue(
                    () => ({
                        loopOffset: this.loopOffset,
                        angle: this.angle,
                        scale: this.scale,
                    }),
                    () => (this.animating ? settings.animationSpeed.get() : 0),
                    (a, b, coeff) => ({
                        loopOffset: mixAnimatedPosition(a.loopOffset, b.loopOffset, coeff * 2),
                        angle: mixAnimatedValue(a.angle, b.angle, coeff),
                        scale: mixAnimatedValue(a.scale, b.scale, coeff * 2),
                    }),
                ),
        ).animatedValue;
    }
    // noinspection JSUnusedGlobalSymbols
    get animatedTop() {
        profiler.trace();
        return this.animated.loopOffset.top;
    }
    // noinspection JSUnusedGlobalSymbols
    get animatedLeft() {
        profiler.trace();
        return this.animated.loopOffset.left;
    }
    get animatedNormalizedLoopOffset() {
        profiler.trace();
        return gameStateNormalizeLoopOffset(this.puzzle, this.animated.loopOffset);
    }
    get animatedNormalizedTop() {
        profiler.trace();
        return this.animatedNormalizedLoopOffset.top;
    }
    get animatedNormalizedLeft() {
        profiler.trace();
        return this.animatedNormalizedLoopOffset.left;
    }
    get animatedAngle() {
        profiler.trace();
        return this.animated.angle;
    }
    get animatedScale() {
        profiler.trace();
        return this.animated.scale;
    }

    private _onStateChange?: Dispatch<GameStateActionOrCallback<any, T> | GameStateActionOrCallback<any, T>[]>;

    constructor({
        puzzle,
        puzzleIndex,
        myGameState,
        onStateChange,
        cellSize,
        cellSizeForSidePanel,
        isReadonlyContext,
        applyKeys,
        applyPendingMessages,
    }: PuzzleContextCreationOptions<T>) {
        makeAutoObservable<typeof this, "cache" | "disposers">(
            this,
            {
                puzzle: false,
                userDigits: computed({ equals: comparer.structural }),
                cells: computed<CellState<T>[][]>({
                    equals: (as, bs) =>
                        as.every((row, top) => row.every((a, left) => areCellStatesEqual(this, a, bs[top][left]))),
                }),
                lines: computed<SetInterface<PuzzleLine>>({ equals: setComparer }),
                marks: computed<SetInterface<CellMark>>({ equals: setComparer }),
                gridExtension: computed<T["gridStateEx"]>({
                    equals: (a, b) => {
                        const {
                            typeManager: {
                                areGridStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
                            },
                        } = this.puzzle;
                        return areGridStateExtensionsEqual(a, b);
                    },
                }),
                resultCheck: computed({ equals: comparer.structural }),
                importOptionOverrides: computed({ equals: comparer.structural }),
                cache: false,
                disposers: false,
            },
            {},
        );

        this.puzzle = puzzle;
        this.puzzleIndex = puzzleIndex ?? new PuzzleCellsIndex(puzzle);
        this._onStateChange = onStateChange;
        this.cellSize = cellSize;
        this.cellSizeForSidePanel = cellSizeForSidePanel;
        this.isReadonlyContext = isReadonlyContext;
        this.applyKeys = applyKeys;
        this.applyPendingMessages = applyPendingMessages;

        // Fields that depend on `this` are the last to initialize
        this.myGameState = typeof myGameState === "function" ? myGameState(this) : myGameState;
        this.multiPlayer = new UseMultiPlayerResult(this);
    }

    dispose(): void {
        for (const disposer of this.disposers) {
            disposer();
        }
        this.disposers = [];
        this.cache = {};
    }

    getCachedItem<ItemT>(
        key: string,
        createItem: () => ItemT,
        disposeItem = (item: ItemT) => {
            if (typeof (item as any)?.dispose === "function") {
                (item as any).dispose();
            }
        },
    ): ItemT {
        if (!(key in this.cache)) {
            const item = createItem();
            this.cache[key] = item;

            this.disposers.push(() => disposeItem(item));
        }

        return this.cache[key] as ItemT;
    }

    getComputedValue<ItemT>(key: string, getValue: () => ItemT): ItemT {
        return this.getCachedItem(key, () => computed(getValue, { name: key })).get();
    }

    update(updates: Partial<PuzzleContextOptions<T>>) {
        runInAction(() => {
            const {
                puzzle,
                myGameState,
                onStateChange,
                cellSize,
                cellSizeForSidePanel,
                isReadonlyContext,
                applyKeys,
                applyPendingMessages,
            } = updates;

            if (puzzle !== undefined) {
                (window as any).puzzle = this.puzzle;
                (window as any).context = this;
                this.puzzle = puzzle;
                this.puzzleIndex = new PuzzleCellsIndex(this.puzzle);
            }
            if (myGameState !== undefined /* && !areSameGameStates(this, myGameState, this.myGameState)*/) {
                this.myGameState = myGameState;
            }
            if ("onStateChange" in updates) {
                this._onStateChange = onStateChange;
            }
            if (cellSize !== undefined) {
                this.cellSize = cellSize;
            }
            if (cellSizeForSidePanel !== undefined) {
                this.cellSizeForSidePanel = cellSizeForSidePanel;
            }
            if (isReadonlyContext !== undefined) {
                this.isReadonlyContext = isReadonlyContext;
            }
            if (applyKeys !== undefined) {
                this.applyKeys = applyKeys;
            }
            if (applyPendingMessages !== undefined) {
                this.applyPendingMessages = applyPendingMessages;
            }
        });
    }

    cloneWith(updates: Partial<PuzzleContextOptions<T>>): PuzzleContext<T> {
        const context = createViewModel(this);
        context.update(updates);
        return context;
    }

    clone() {
        return new PuzzleContext(this);
    }

    private get shouldApplyReadOnlySafeContext() {
        profiler.trace();
        return !this.isReady || !this.lives;
    }

    get readOnlySafeContext(): PuzzleContext<T> {
        profiler.trace();

        return this.shouldApplyReadOnlySafeContext ? this.cloneWith({ onStateChange: () => {} }) : this;
    }

    mergeHostDataToState() {
        const finalSetSharedState = this.puzzle.params?.share
            ? setAllShareState
            : this.puzzle.typeManager.setSharedState;

        if (
            !finalSetSharedState ||
            this.multiPlayer.isHost ||
            !this.multiPlayer.isEnabled ||
            !this.multiPlayer.isLoaded ||
            !this.multiPlayer.hostData
        ) {
            return;
        }

        this.update({
            myGameState: mergeGameStateWithUpdates(
                this.myGameState,
                finalSetSharedState?.(this, this.multiPlayer.hostData) ?? {},
                {
                    currentPlayer: this.multiPlayer.hostData.currentPlayer,
                    playerObjects: this.multiPlayer.hostData.playerObjects,
                },
            ),
        });
    }

    processMessages(messages: MessageWithClientId[]) {
        let myGameState = this.myGameState;

        if (messages.length) {
            const allActionTypes = [
                ...coreGameStateActionTypes<T>(),
                ...(this.puzzle.typeManager.supportedActionTypes || []),
            ];

            const processedContext = this.clone().cloneWith({
                applyKeys: false,
                // Important: prevents recursive calls to processMessages()!
                applyPendingMessages: false,
                onStateChange: () => console.error("Unexpected state change inside of the messages loop!"),
            });

            for (const { data: message, clientId } of messages) {
                const {
                    type,
                    actionId,
                    params,
                    state: {
                        mode,
                        selected,
                        color,
                        line,
                        lineEnd,
                        lineCenters,
                        dragStart,
                        dragAction,
                        loopOffset,
                        angle,
                        scale,
                        ...otherState
                    },
                } = message;

                const actionType = allActionTypes.find(({ key }) => key === type)!;

                // Execute the action in player's context
                processedContext.update({
                    myGameState: mergeGameStateWithUpdates(
                        myGameState,
                        {
                            persistentInputMode: mode,
                            gestureInputMode: undefined,
                            selectedCells: PositionSet.unserialize(selected),
                            selectedColor: color,
                            currentMultiLine: line,
                            currentMultiLineEnd: lineEnd,
                            isCurrentMultiLineCenters: lineCenters,
                            dragStartPoint: dragStart,
                            dragAction,
                            loopOffset,
                            angle,
                            scale,
                        },
                        this.puzzle.typeManager.unserializeInternalState?.(this.puzzle, otherState) ?? {},
                    ),
                });

                const callback = actionType.callback(params, clientId, actionId);

                myGameState = mergeGameStateWithUpdates(
                    myGameState,
                    typeof callback === "function" ? callback(processedContext) : callback,
                );
            }

            processedContext.dispose();
        }

        return myGameState;
    }

    get state() {
        profiler.trace();

        return this.applyPendingMessages
            ? this.processMessages(
                  this.multiPlayer.myPendingMessages.map(({ data }) => ({
                      data,
                      clientId: myClientId,
                  })),
              )
            : this.myGameState;
    }

    // region State props
    get gridStateHistory() {
        profiler.trace();
        return this.state.gridStateHistory;
    }

    get currentGridState() {
        profiler.trace();
        return this.state.gridStateHistory.current;
    }

    // region currentGridState items
    get cells() {
        profiler.trace();
        return this.currentGridState.cells;
    }
    readonly getCell = computedFn(
        function getCell(this: PuzzleContext<T>, top: number, left: number) {
            return this.cells[top]?.[left];
        },
        { equals: (a, b) => areCellStatesEqual(this, a, b) },
    );
    readonly getCellData = computedFn(
        function getCellData(this: PuzzleContext<T>, top: number, left: number): T["cell"] | undefined {
            return this.getCell(top, left)?.usersDigit ?? this.allInitialDigits[top]?.[left];
        },
        { equals: comparer.structural },
    );
    readonly getCellDigit = computedFn(function getCellDigit(this: PuzzleContext<T>, top: number, left: number) {
        const cellData = this.getCellData(top, left);
        return cellData !== undefined
            ? this.puzzle.typeManager.getDigitByCellData(cellData, this, { top, left })
            : undefined;
    });
    // noinspection JSUnusedGlobalSymbols
    readonly getCellCenterDigits = computedFn(
        function getCellCenterDigits(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.centerDigits.sorted();
        },
        { equals: setComparer },
    );
    // noinspection JSUnusedGlobalSymbols
    readonly getCellCornerDigits = computedFn(
        function getCellCornerDigits(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.cornerDigits.sorted();
        },
        { equals: setComparer },
    );
    readonly getCellColors = computedFn(
        function getCellColors(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.colors.sorted();
        },
        { equals: setComparer },
    );

    get lines() {
        profiler.trace();
        return this.currentGridState.lines;
    }

    get linesWithHiddenLines() {
        profiler.trace();
        return this.lines.bulkAdd(this.puzzle.typeManager.getHiddenLines?.(this) ?? []);
    }

    get marks() {
        profiler.trace();
        return this.currentGridState.marks;
    }

    get gridExtension() {
        profiler.trace();
        return this.currentGridState.extension;
    }

    get userDigits(): CellsMap<T["cell"]> {
        profiler.trace();

        return mergeCellsMaps(this.allInitialDigits, gameStateGetCurrentGivenDigitsByCells(this.cells));
    }
    readonly getUserDigit = computedFn(
        function getUserDigit(this: PuzzleContext<T>, top: number, left: number): T["cell"] | undefined {
            return this.userDigits[top]?.[left];
        },
        { equals: comparer.structural },
    );
    // endregion

    get currentGridStateWithFogDemo() {
        profiler.trace();
        return (this.state.fogDemoGridStateHistory ?? this.state.gridStateHistory).current;
    }

    get persistentInputMode() {
        profiler.trace();
        return this.state.persistentInputMode;
    }

    get gestureInputMode() {
        profiler.trace();
        return this.state.gestureInputMode;
    }

    get stateInitialDigits() {
        profiler.trace();
        return this.state.initialDigits ?? {};
    }

    get allInitialDigits(): CellsMap<T["cell"]> {
        profiler.trace();
        return mergeCellsMaps(
            this.puzzle.initialDigits ?? {},
            this.stateInitialDigits,
            this.puzzle.typeManager.getInitialDigits?.(this) ?? {},
        );
    }

    get excludedDigits() {
        profiler.trace();
        return this.state.excludedDigits;
    }

    get isMultiSelection() {
        profiler.trace();
        return this.state.isMultiSelection;
    }

    get allSelectedCells() {
        profiler.trace();
        return this.state.selectedCells;
    }
    get selectedCells() {
        profiler.trace();
        return this.allSelectedCells.filter(({ top, left }) => top % 1 === 0 && left % 1 === 0);
    }
    readonly isSelectedCell = computedFn(function isSelectedCell(this: PuzzleContext<T>, top: number, left: number) {
        return this.allSelectedCells.contains({ top, left });
    });
    get selectedCellsCount() {
        profiler.trace();
        return this.allSelectedCells.size;
    }
    get firstSelectedCell() {
        profiler.trace();
        return this.selectedCells.first();
    }
    get lastSelectedCell() {
        profiler.trace();
        return this.selectedCells.last();
    }
    readonly isLastSelectedCell = computedFn(function isLastSelectedCell(
        this: PuzzleContext<T>,
        top: number,
        left: number,
    ) {
        const { lastSelectedCell } = this;
        return lastSelectedCell?.top === top && lastSelectedCell?.left === left;
    });

    get selectedColor() {
        profiler.trace();
        return this.state.selectedColor;
    }

    get currentMultiLine() {
        profiler.trace();
        return this.state.currentMultiLine;
    }

    get currentMultiLineEnd() {
        profiler.trace();
        return this.state.currentMultiLineEnd;
    }

    get isCurrentMultiLineCenters() {
        profiler.trace();
        return this.state.isCurrentMultiLineCenters;
    }

    get dragStartPoint() {
        profiler.trace();
        return this.state.dragStartPoint;
    }

    get dragAction() {
        profiler.trace();
        return this.state.dragAction;
    }

    get animating() {
        profiler.trace();
        return this.state.animating;
    }

    get loopOffset() {
        profiler.trace();
        return this.state.loopOffset;
    }

    get angle() {
        profiler.trace();
        return this.state.angle;
    }

    get scale() {
        profiler.trace();
        return this.state.scale;
    }

    get openedLmdOnce() {
        profiler.trace();
        return this.state.openedLmdOnce;
    }

    get lives() {
        profiler.trace();
        return this.state.lives;
    }

    get fogDemoGridStateHistory() {
        profiler.trace();
        return this.state.fogDemoGridStateHistory;
    }

    get currentPlayer() {
        profiler.trace();
        return this.state.currentPlayer;
    }

    get playerObjects() {
        profiler.trace();
        return this.state.playerObjects;
    }

    get stateExtension() {
        profiler.trace();
        return this.state.extension;
    }
    // endregion

    get resultCheck(): PuzzleResultCheck {
        profiler.trace();

        if (this.lives === 0) {
            return {
                isCorrectResult: false,
                isPending: false,
                resultPhrase: translate("You lost") + "!",
            };
        }

        return this.puzzle.resultChecker?.(this) ?? errorResultCheck();
    }

    get regionsForRowsAndColumns(): Constraint<T, any>[] {
        profiler.trace();

        const {
            disableSudokuRules,
            typeManager: {
                getRegionsForRowsAndColumns = disableSudokuRules ? () => [] : getDefaultRegionsForRowsAndColumns,
            },
        } = this.puzzle;

        return getRegionsForRowsAndColumns(this);
    }

    get puzzleInitialColors() {
        profiler.trace();

        const {
            puzzle: { initialColors = {} },
        } = this;

        return typeof initialColors === "function" ? initialColors(this) : initialColors;
    }

    get resolvedPuzzleItems(): Constraint<T, any>[] {
        profiler.trace();

        const { items = [] } = this.puzzle;

        return typeof items === "function" ? items(this) : items;
    }

    get resolvedStateItems(): Constraint<T, any>[] {
        profiler.trace();

        const { items = [] } = this.puzzle.typeManager;

        return typeof items === "function" ? items(this) : items;
    }

    get defaultPuzzleItems(): Constraint<T, any>[] {
        profiler.trace();

        const {
            regions = [],
            typeManager: { cosmeticRegions },
            noGridLines,
        } = this.puzzle;

        return [
            ...(noGridLines ? [] : [GridLinesConstraint<T>()]),
            ...regions.map((region) => {
                if (Array.isArray(region)) {
                    region = RegionConstraint<T>(region);
                }

                if (cosmeticRegions) {
                    region = toDecorativeConstraint(region);
                }

                return region;
            }),
            UserLinesConstraint(),
        ];
    }

    private get regionCellsIndex() {
        profiler.trace();

        const map: CellsMap<{ index: number; cells: Position[] }> = {};
        for (const [index, region] of (this.puzzle.regions ?? []).entries()) {
            const cells = getRegionCells(region);
            for (const { top, left } of cells) {
                map[top] = map[top] ?? {};
                map[top][left] = { index, cells };
            }
        }

        return map;
    }
    readonly getRegionByCell = computedFn(function getRegionByCell(this: PuzzleContext<T>, top: number, left: number) {
        return this.regionCellsIndex[top]?.[left];
    });

    get allItems() {
        profiler.trace();

        return [
            ...this.regionsForRowsAndColumns,
            ...this.defaultPuzzleItems,
            ...this.resolvedPuzzleItems,
            ...this.resolvedStateItems,
        ].filter(Boolean);
    }

    readonly getVisibleItemsForLayer = computedFn(
        function getVisibleItemsForLayer(this: PuzzleContext<T>, layer: GridLayer) {
            return this.allItems.filter(({ component }) => component?.[layer]);
        },
        { equals: comparer.shallow },
    );

    readonly getCellTransformedBounds = computedFn(function getCellTransformedBounds(
        this: PuzzleContext<T>,
        top: number,
        left: number,
    ): TransformedCustomCellBounds {
        return this.puzzleIndex.allCells[top][left].getTransformedBounds(this);
    });

    readonly isVisibleCellForState = computedFn(function isVisibleCellForState(
        this: PuzzleContext<T>,
        top: number,
        left: number,
    ) {
        return this.puzzleIndex.getCellTypeProps({ top, left }).isVisibleForState?.(this) !== false;
    });

    get centerLineSegments() {
        profiler.trace();
        return this.puzzleIndex.getLineSegmentsByType(this.linesWithHiddenLines.items, CellPart.center);
    }

    // noinspection JSUnusedGlobalSymbols
    get borderLineSegments() {
        profiler.trace();
        return this.puzzleIndex.getLineSegmentsByType(this.linesWithHiddenLines.items, CellPart.border);
    }

    // noinspection JSUnusedGlobalSymbols
    get cornerLineSegments() {
        profiler.trace();
        return this.puzzleIndex.getLineSegmentsByType(this.linesWithHiddenLines.items, CellPart.corner);
    }

    get isReady() {
        profiler.trace();

        return (
            !this.isReadonlyContext &&
            !this.multiPlayer.isDoubledConnected &&
            !(this.multiPlayer.isEnabled && (!this.multiPlayer.isLoaded || !this.multiPlayer.hostData)) &&
            (this.puzzle.typeManager.isReady?.(this) ?? true)
        );
    }

    get isMyTurn() {
        profiler.trace();

        return !this.multiPlayer.isEnabled || this.currentPlayer === myClientId || !!this.puzzle.params?.share;
    }

    get lastPlayerObjects(): Record<string, boolean> {
        profiler.trace();

        if (this.multiPlayer.isEnabled) {
            let sortedPlayerObjects = Object.entries(this.playerObjects).sort(([, a], [, b]) => b.index - a.index);
            if (sortedPlayerObjects.length) {
                const [, { clientId: lastClientId }] = sortedPlayerObjects[0];
                const lastPrevClientIdIndex = sortedPlayerObjects.findIndex(
                    ([, { clientId }]) => clientId !== lastClientId,
                );
                if (lastPrevClientIdIndex >= 0) {
                    sortedPlayerObjects = sortedPlayerObjects.slice(0, lastPrevClientIdIndex);
                }
                return Object.fromEntries(sortedPlayerObjects.map(([key]) => [key, true]));
            }
        }

        return emptyObject;
    }

    get scaleLog() {
        profiler.trace();

        return getScaleLog(this.scale, this.puzzle.typeManager.scaleStep);
    }

    get animatedScaleLog() {
        profiler.trace();

        return getScaleLog(this.animatedScale, this.puzzle.typeManager.scaleStep);
    }

    get visibleInputModeInfos() {
        profiler.trace();
        return getAllowedPuzzleInputModeInfos(this.puzzle, false);
    }

    get allInputModeInfos() {
        profiler.trace();
        return getAllowedPuzzleInputModeInfos(this.puzzle, true);
    }

    get inputMode(): PuzzleInputMode | number {
        profiler.trace();

        const { gestureInputMode, persistentInputMode } = this;

        if (gestureInputMode !== undefined) {
            return gestureInputMode;
        }

        if (this.applyKeys && !this.isReadonlyContext) {
            const { keysStr } = controlKeysState;

            for (const { mode, hotKeyStr } of this.allInputModeInfos) {
                if (hotKeyStr?.includes(keysStr)) {
                    return mode;
                }
            }

            return persistentInputMode;
        }

        return persistentInputMode;
    }

    get inputModeInfo() {
        profiler.trace();

        const { inputMode } = this;

        return this.allInputModeInfos.find(({ mode }) => mode === inputMode)!;
    }

    get lmdSolutionCode() {
        profiler.trace();
        return this.puzzle.getLmdSolutionCode?.(this);
    }

    get fogProps() {
        profiler.trace();
        return getFogPropsByContext(this);
    }

    get fogVisibleCells() {
        profiler.trace();
        const { fogProps } = this;
        return fogProps && getFogVisibleCells(this, fogProps);
    }

    get disableFogDemo(): boolean {
        const {
            puzzle: {
                typeManager: { disableFogDemo },
            },
        } = this;

        return typeof disableFogDemo === "function" ? disableFogDemo(this) : !!disableFogDemo;
    }

    get importOptionOverrides(): Partial<PuzzleImportOptions> {
        profiler.trace();
        return this.puzzle.typeManager.importOptionOverrides?.(this) ?? {};
    }

    get maxDigit() {
        profiler.trace();
        return this.importOptionOverrides.maxDigit ?? this.puzzle.maxDigit ?? getDefaultMaxDigit(this.puzzle);
    }

    get maxDigitInCurrentMode() {
        profiler.trace();

        const { supportZero } = this.puzzle;

        const { isDigitMode, maxDigit: maxDigitFunc = this.maxDigit + (isDigitMode && supportZero ? 1 : 0) } =
            this.inputModeInfo;

        return typeof maxDigitFunc === "function" ? maxDigitFunc(this) : maxDigitFunc;
    }

    onStateChange(actionsOrCallbacks: GameStateActionOrCallback<any, T> | GameStateActionOrCallback<any, T>[]) {
        if (this._onStateChange) {
            this._onStateChange(actionsOrCallbacks);
            return;
        }

        const { isEnabled, isHost } = this.multiPlayer;

        actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

        const processedContext = this.cloneWith({
            // Important: prevent unnecessary calls to processMessages()
            applyPendingMessages: false,
            onStateChange: () => {},
        });
        for (const actionOrCallback of actionsOrCallbacks) {
            const asAction = actionOrCallback as GameStateAction<any, T>;
            const isAction = typeof asAction.type === "object";

            if (
                !isAction ||
                !isEnabled ||
                isHost ||
                (!this.puzzle.params?.share && !this.puzzle.typeManager.isGlobalAction?.(asAction, processedContext))
            ) {
                const callback = isAction
                    ? asAction.type.callback(asAction.params, myClientId, asAction.actionId)
                    : (actionOrCallback as PartialGameStateEx<T> | GameStateActionCallback<T>);

                const updates = typeof callback === "function" ? callback(processedContext) : callback;
                if (updates.selectedCells) {
                    updates.selectedCells = updates.selectedCells.filter((cell) =>
                        isSelectableCell(processedContext.puzzleIndex.getCellTypeProps(cell)),
                    );
                }

                processedContext.update({
                    myGameState: mergeGameStateWithUpdates(processedContext.myGameState, updates),
                });
            } else {
                this.multiPlayer.sendMessage({
                    type: asAction.type.key,
                    actionId: asAction.actionId,
                    params: asAction.params,
                    state: {
                        mode: processedContext.inputMode,
                        selected: processedContext.myGameState.selectedCells.serialize(),
                        color: processedContext.myGameState.selectedColor,
                        line: processedContext.myGameState.currentMultiLine,
                        lineEnd: processedContext.myGameState.currentMultiLineEnd,
                        lineCenters: processedContext.myGameState.isCurrentMultiLineCenters,
                        dragStart: processedContext.myGameState.dragStartPoint,
                        dragAction: processedContext.myGameState.dragAction,
                        loopOffset: processedContext.myGameState.loopOffset,
                        angle: processedContext.myGameState.angle,
                        scale: processedContext.myGameState.scale,
                        ...this.puzzle.typeManager.getInternalState?.(this.puzzle, processedContext.myGameState),
                    },
                });
            }
        }

        this.update({ myGameState: processedContext.myGameState });
    }
}

export interface PuzzleContextProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
}

export const createEmptyContextForPuzzle = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    cellSize = 1,
    emptyGameState = false,
): PuzzleContext<T> => {
    return new PuzzleContext({
        puzzle,
        myGameState: emptyGameState
            ? (emptyObject as unknown as GameStateEx<T>)
            : (context) => getEmptyGameState(context, false, true),
        cellSize,
        cellSizeForSidePanel: cellSize,
        isReadonlyContext: true,
        applyKeys: false,
        applyPendingMessages: false,
    });
};
