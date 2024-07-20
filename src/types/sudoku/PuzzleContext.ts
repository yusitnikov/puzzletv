import {getDefaultDigitsCount, getRegionCells, PuzzleDefinition} from "./PuzzleDefinition";
import {
    GameStateEx,
    gameStateGetCurrentGivenDigitsByCells,
    gameStateNormalizeLoopOffset,
    getEmptyGameState,
    getScaleLog,
    mergeGameStateWithUpdates,
    PartialGameStateEx,
    ProcessedGameStateAnimatedValues,
    setAllShareState
} from "./GameState";
import {MessageWithClientId, myClientId, UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
import {Dispatch, ReactNode} from "react";
import {
    coreGameStateActionTypes,
    GameStateAction,
    GameStateActionCallback,
    GameStateActionOrCallback
} from "./GameStateAction";
import {SudokuCellsIndex} from "./SudokuCellsIndex";
import {AnyPTM} from "./PuzzleTypeMap";
import {comparer, computed, makeAutoObservable, runInAction} from "mobx";
import {computedFn, createViewModel} from "mobx-utils";
import {Position, PositionSet} from "../layout/Position";
import {isSelectableCell} from "./CellTypeProps";
import {TransformedCustomCellBounds} from "./CustomCellBounds";
import {controlKeysState} from "../../hooks/useControlKeysState";
import {getAllowedCellWriteModeInfos} from "./CellWriteModeInfo";
import {getFinalCellWriteMode} from "../../hooks/sudoku/useFinalCellWriteMode";
import {CellWriteMode} from "./CellWriteMode";
import {Constraint} from "./Constraint";
import {FieldLayer} from "./FieldLayer";
import {getDefaultRegionsForRowsAndColumns} from "./FieldSize";
import {FieldLinesConstraint} from "../../components/sudoku/field/FieldLines";
import {RegionConstraint} from "../../components/sudoku/constraints/region/Region";
import {UserLinesConstraint} from "../../components/sudoku/constraints/user-lines/UserLines";
import {GivenDigitsMap, mergeGivenDigitsMaps} from "./GivenDigitsMap";
import {getFogPropsByContext, getFogVisibleCells} from "../../components/sudoku/constraints/fog/Fog";
import {setComparer, SetInterface} from "../struct/Set";
import {PuzzleLine} from "./PuzzleLine";
import {CellMark} from "./CellMark";
import {areCellStatesEqual, CellState} from "./CellState";
import {LanguageCode} from "../translations/LanguageCode";
import {translate} from "../../utils/translate";
import {PartiallyTranslatable} from "../translations/Translatable";
import {PuzzleResultCheck} from "./PuzzleResultCheck";
import {profiler} from "../../utils/profiler";
import {getGridRegionCells, GridRegion} from "./GridRegion";
import {PuzzleImportOptions} from "./PuzzleImportOptions";

const emptyObject = {};

export interface PuzzleContextOptions<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    puzzleIndex?: SudokuCellsIndex<T>;
    processedGameStateExtension?: T["processedStateEx"];
    animated?: ProcessedGameStateAnimatedValues;
    myGameState: GameStateEx<T>;
    onStateChange?: Dispatch<
        GameStateActionOrCallback<any, T> |
        GameStateActionOrCallback<any, T>[]
    >;
    cellSize: number;
    cellSizeForSidePanel: number;
    isReadonlyContext: boolean;
    applyKeys: boolean;
    applyPendingMessages: boolean;
    languageCode?: LanguageCode;
}

// It's not a React context! Just a regular class.
export class PuzzleContext<T extends AnyPTM> implements PuzzleContextOptions<T> {
    puzzle: PuzzleDefinition<T>;
    puzzleIndex: SudokuCellsIndex<T>;
    myGameState: GameStateEx<T>;
    cellSize: number;
    cellSizeForSidePanel: number;
    isReadonlyContext: boolean;
    applyKeys: boolean;
    applyPendingMessages: boolean;
    languageCode = LanguageCode.en;

    readonly multiPlayer: UseMultiPlayerResult<T>;

    private _processedGameStateExtension?: T["processedStateEx"];
    get processedGameStateExtension() {
        profiler.trace();

        return this._processedGameStateExtension
            ?? this.puzzle.typeManager.getProcessedGameStateExtension?.(this)
            ?? (emptyObject as T["processedStateEx"]);
    }

    get regions() {
        profiler.trace();
        return this.puzzle.typeManager.getRegionsWithSameCoordsTransformation?.(this);
    }

    private get regionsByCellsMap() {
        profiler.trace();

        const result: GivenDigitsMap<GridRegion> = {};
        for (const region of this.regions ?? []) {
            for (const {top, left} of getGridRegionCells(region)) {
                result[top] ??= {};
                result[top][left] = region;
            }
        }

        return result;
    }

    readonly getCellRegion = computedFn(
        function getCellRegion(this: PuzzleContext<T>, top: number, left: number): GridRegion | undefined {
            return this.regionsByCellsMap[top]?.[left];
        }
    );

    private _animated?: ProcessedGameStateAnimatedValues;
    get animated(): ProcessedGameStateAnimatedValues {
        profiler.trace();
        return this._animated ?? this.state;
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

    private _onStateChange?: Dispatch<
        GameStateActionOrCallback<any, T> |
        GameStateActionOrCallback<any, T>[]
    >;

    constructor(
        {
            puzzle,
            puzzleIndex,
            processedGameStateExtension,
            animated,
            myGameState,
            onStateChange,
            cellSize,
            cellSizeForSidePanel,
            isReadonlyContext,
            applyKeys,
            applyPendingMessages,
        }: PuzzleContextOptions<T>
    ) {
        makeAutoObservable(this, {
            userDigits: computed({equals: comparer.structural}),
            cells: computed<CellState<T>[][]>({
                equals: (as, bs) => as.every(
                    (row, top) => row.every(
                        (a, left) => areCellStatesEqual(this, a, bs[top][left])
                    )
                ),
            }),
            lines: computed<SetInterface<PuzzleLine>>({equals: setComparer}),
            marks: computed<SetInterface<CellMark>>({equals: setComparer}),
            fieldExtension: computed<T["fieldStateEx"]>({equals: (a, b) => {
                const {
                    typeManager: {
                        areFieldStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
                    },
                } = this.puzzle;
                return areFieldStateExtensionsEqual(a, b);
            }}),
            resultCheck: computed({equals: comparer.structural}),
            importOptionOverrides: computed({equals: comparer.structural}),
        }, {});

        this.puzzle = puzzle;
        this.puzzleIndex = puzzleIndex ?? new SudokuCellsIndex(this.puzzle);
        this._processedGameStateExtension = processedGameStateExtension;
        this._animated = animated;
        this.myGameState = myGameState;
        this._onStateChange = onStateChange;
        this.cellSize = cellSize;
        this.cellSizeForSidePanel = cellSizeForSidePanel;
        this.isReadonlyContext = isReadonlyContext;
        this.applyKeys = applyKeys;
        this.applyPendingMessages = applyPendingMessages;

        this.multiPlayer = new UseMultiPlayerResult(this);
    }

    update(updates: Partial<PuzzleContextOptions<T>>) {
        runInAction(() => {
            const {
                puzzle,
                processedGameStateExtension,
                animated,
                myGameState,
                onStateChange,
                cellSize,
                cellSizeForSidePanel,
                isReadonlyContext,
                applyKeys,
                applyPendingMessages,
                languageCode,
            } = updates;

            if (puzzle !== undefined) {
                (window as any).puzzle = this.puzzle;
                (window as any).context = this;
                this.puzzle = puzzle;
                this.puzzleIndex = new SudokuCellsIndex(this.puzzle);
            }
            if ("processedGameStateExtension" in updates) {
                this._processedGameStateExtension = processedGameStateExtension;
            }
            if ("animated" in updates) {
                this._animated = animated;
            }
            if (myGameState !== undefined/* && !areSameGameStates(this, myGameState, this.myGameState)*/) {
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
            if (languageCode !== undefined) {
                this.languageCode = languageCode;
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

        return this.shouldApplyReadOnlySafeContext
            ? this.cloneWith({onStateChange: () => {}})
            : this;
    }

    mergeHostDataToState() {
        const finalSetSharedState = this.puzzle.params?.share
            ? setAllShareState
            : this.puzzle.typeManager.setSharedState;

        if (!finalSetSharedState || this.multiPlayer.isHost || !this.multiPlayer.isEnabled || !this.multiPlayer.isLoaded || !this.multiPlayer.hostData) {
            return;
        }

        this.update({
            myGameState: mergeGameStateWithUpdates(
                this.myGameState,
                finalSetSharedState?.(this, this.multiPlayer.hostData) ?? {},
                {
                    currentPlayer: this.multiPlayer.hostData.currentPlayer,
                    playerObjects: this.multiPlayer.hostData.playerObjects,
                }
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
                processedGameStateExtension: undefined,
                animated: undefined,
                applyKeys: false,
                // Important: prevents recursive calls to processMessages()!
                applyPendingMessages: false,
                onStateChange: () => console.error("Unexpected state change inside of the messages loop!"),
            });

            for (const {data: message, clientId} of messages) {
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

                const actionType = allActionTypes.find(({key}) => key === type)!;

                // Execute the action in player's context
                processedContext.update({
                    myGameState: mergeGameStateWithUpdates(
                        myGameState,
                        {
                            persistentCellWriteMode: mode,
                            gestureCellWriteMode: undefined,
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
                        this.puzzle.typeManager.unserializeInternalState?.(this.puzzle, otherState) ?? {}
                    ),
                });

                const callback = actionType.callback(
                    params,
                    clientId,
                    actionId,
                );

                myGameState = mergeGameStateWithUpdates(
                    myGameState,
                    typeof callback === "function" ? callback(processedContext) : callback,
                );
            }
        }

        return myGameState;
    }

    get state() {
        profiler.trace();

        return this.applyPendingMessages
            ? this.processMessages(
                this.multiPlayer.myPendingMessages.map(({data}) => ({
                    data,
                    clientId: myClientId,
                }))
            )
            : this.myGameState;
    }

    // region State props
    get fieldStateHistory() {
        profiler.trace();
        return this.state.fieldStateHistory;
    }

    get currentFieldState() {
        profiler.trace();
        return this.state.fieldStateHistory.current;
    }

    // region currentFieldState items
    get cells() {
        profiler.trace();
        return this.currentFieldState.cells;
    }
    readonly getCell = computedFn(
        function getCell(this: PuzzleContext<T>, top: number, left: number) {
            return this.cells[top]?.[left];
        },
        {equals: (a, b) => areCellStatesEqual(this, a, b)}
    );
    readonly getCellDigit = computedFn(
        function getCellDigit(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.usersDigit;
        },
        {equals: comparer.structural}
    );
    // noinspection JSUnusedGlobalSymbols
    readonly getCellCenterDigits = computedFn(
        function getCellCenterDigits(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.centerDigits.sorted();
        },
        {equals: setComparer}
    );
    // noinspection JSUnusedGlobalSymbols
    readonly getCellCornerDigits = computedFn(
        function getCellCornerDigits(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.cornerDigits.sorted();
        },
        {equals: setComparer}
    );
    readonly getCellColors = computedFn(
        function getCellColors(this: PuzzleContext<T>, top: number, left: number) {
            return this.getCell(top, left)?.colors.sorted();
        },
        {equals: setComparer}
    );

    get lines() {
        profiler.trace();
        return this.currentFieldState.lines;
    }

    get marks() {
        profiler.trace();
        return this.currentFieldState.marks;
    }

    get fieldExtension() {
        profiler.trace();
        return this.currentFieldState.extension;
    }

    get userDigits(): GivenDigitsMap<T["cell"]> {
        profiler.trace();

        return mergeGivenDigitsMaps(
            this.allInitialDigits,
            gameStateGetCurrentGivenDigitsByCells(this.cells),
        );
    }
    readonly getUserDigit = computedFn(
        function getUserDigit(this: PuzzleContext<T>, top: number, left: number): T["cell"] | undefined {
            return this.userDigits[top]?.[left];
        },
        {equals: comparer.structural}
    );
    // endregion

    get currentFieldStateWithFogDemo() {
        profiler.trace();
        return (this.state.fogDemoFieldStateHistory ?? this.state.fieldStateHistory).current;
    }

    get persistentCellWriteMode() {
        profiler.trace();
        return this.state.persistentCellWriteMode;
    }

    get gestureCellWriteMode() {
        profiler.trace();
        return this.state.gestureCellWriteMode;
    }

    get stateInitialDigits() {
        profiler.trace();
        return this.state.initialDigits ?? {};
    }

    get allInitialDigits(): GivenDigitsMap<T["cell"]> {
        profiler.trace();
        return mergeGivenDigitsMaps(
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

    get selectedCells() {
        profiler.trace();
        return this.state.selectedCells;
    }
    readonly isSelectedCell = computedFn(function isSelectedCell(this: PuzzleContext<T>, top: number, left: number) {
        return this.selectedCells.contains({top, left});
    });
    get selectedCellsCount() {
        profiler.trace();
        return this.selectedCells.size;
    }
    get firstSelectedCell() {
        profiler.trace();
        return this.selectedCells.first();
    }
    get lastSelectedCell() {
        profiler.trace();
        return this.selectedCells.last();
    }
    readonly isLastSelectedCell = computedFn(function isLastSelectedCell(this: PuzzleContext<T>, top: number, left: number) {
        const {lastSelectedCell} = this;
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

    get fogDemoFieldStateHistory() {
        profiler.trace();
        return this.state.fogDemoFieldStateHistory;
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

    get resultCheck(): PuzzleResultCheck<ReactNode> {
        profiler.trace();

        if (this.lives === 0) {
            return {
                isCorrectResult: false,
                resultPhrase: this.translate("You lost") + "!",
            };
        }

        const result = this.puzzle.resultChecker?.(this) ?? false;
        return typeof result === "boolean"
            ? {
                isCorrectResult: result,
                resultPhrase: result
                    ? (this.puzzle.successMessage ?? `${this.translate("Absolutely right")}!`)
                    : `${this.translate("Something's wrong here")}...`
            }
            : {
                isCorrectResult: result.isCorrectResult,
                resultPhrase: typeof result.resultPhrase === "string" || (result.resultPhrase && typeof result.resultPhrase === "object" && LanguageCode.en in result.resultPhrase)
                    ? this.translate(result.resultPhrase as PartiallyTranslatable<ReactNode>)
                    : result.resultPhrase,
                forceShowResult: result.forceShowResult,
            };
    }

    get regionsForRowsAndColumns(): Constraint<T, any>[] {
        profiler.trace();

        const {
            disableSudokuRules,
            typeManager: {
                getRegionsForRowsAndColumns = disableSudokuRules
                    ? (() => [])
                    : getDefaultRegionsForRowsAndColumns,
            },
        } = this.puzzle;

        return getRegionsForRowsAndColumns(this);
    }

    get puzzleInitialColors() {
        profiler.trace();

        const {puzzle: {initialColors = {}}} = this;

        return typeof initialColors === "function"
            ? initialColors(this)
            : initialColors;
    }

    get resolvedPuzzleItems(): Constraint<T, any>[] {
        profiler.trace();

        const {items = []} = this.puzzle;

        return typeof items === "function"
            ? items(this)
            : items;
    }

    get resolvedStateItems(): Constraint<T, any>[] {
        profiler.trace();

        const {items = []} = this.puzzle.typeManager;

        return typeof items === "function"
            ? items(this)
            : items;
    }

    get defaultPuzzleItems(): Constraint<T, any>[] {
        profiler.trace();

        const {regions = []} = this.puzzle;

        return [
            FieldLinesConstraint(),
            ...regions.map(
                (region) => Array.isArray(region)
                    ? RegionConstraint<T>(region)
                    : region
            ),
            UserLinesConstraint(),
        ];
    }

    private get regionCellsIndex() {
        profiler.trace();

        const map: GivenDigitsMap<{ index: number, cells: Position[] }> = {};
        for (const [index, region] of (this.puzzle.regions ?? []).entries()) {
            const cells = getRegionCells(region);
            for (const {top, left} of cells) {
                map[top] = map[top] ?? {};
                map[top][left] = {index, cells};
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
        function getVisibleItemsForLayer(this: PuzzleContext<T>, layer: FieldLayer) {
            return this.allItems.filter(({component}) => component?.[layer]);
        },
        {equals: comparer.shallow}
    );

    readonly getCellTransformedBounds = computedFn(function getCellTransformedBounds(
        this: PuzzleContext<T>, top: number, left: number
    ): TransformedCustomCellBounds {
        return this.puzzleIndex.allCells[top][left].getTransformedBounds(this);
    });

    readonly isVisibleCellForState = computedFn(function isVisibleCellForState(
        this: PuzzleContext<T>, top: number, left: number
    ) {
        return this.puzzleIndex.getCellTypeProps({top, left}).isVisibleForState?.(this) !== false;
    });

    get centerLineSegments() {
        profiler.trace();
        return this.puzzleIndex.getCenterLineSegments(this.lines.items);
    }

    get isReady() {
        profiler.trace();

        return !this.isReadonlyContext
            && !this.multiPlayer.isDoubledConnected
            && !(this.multiPlayer.isEnabled && (!this.multiPlayer.isLoaded || !this.multiPlayer.hostData))
            && (this.puzzle.typeManager.isReady?.(this) ?? true);
    }

    get isMyTurn() {
        profiler.trace();

        return !this.multiPlayer.isEnabled
            || this.currentPlayer === myClientId
            || !!this.puzzle.params?.share;
    }

    get lastPlayerObjects(): Record<string, boolean> {
        profiler.trace();

        if (this.multiPlayer.isEnabled) {
            let sortedPlayerObjects = Object.entries(this.playerObjects)
                .sort(([, a], [, b]) => b.index - a.index);
            if (sortedPlayerObjects.length) {
                const [, {clientId: lastClientId}] = sortedPlayerObjects[0];
                const lastPrevClientIdIndex = sortedPlayerObjects.findIndex(([, {clientId}]) => clientId !== lastClientId);
                if (lastPrevClientIdIndex >= 0) {
                    sortedPlayerObjects = sortedPlayerObjects.slice(0, lastPrevClientIdIndex);
                }
                return Object.fromEntries(
                    sortedPlayerObjects.map(([key]) => [key, true])
                )
            }
        }

        return emptyObject;
    }

    get scaleLog() {
        profiler.trace();

        return getScaleLog(
            this.scale,
            this.puzzle.typeManager.scaleStep
        );
    }

    get animatedScaleLog() {
        profiler.trace();

        return getScaleLog(
            this.animatedScale,
            this.puzzle.typeManager.scaleStep
        );
    }

    get visibleCellWriteModeInfos() {
        profiler.trace();
        return getAllowedCellWriteModeInfos(this.puzzle, false);
    }

    get allCellWriteModeInfos() {
        profiler.trace();
        return getAllowedCellWriteModeInfos(this.puzzle, true);
    }

    get cellWriteMode(): CellWriteMode | number {
        profiler.trace();

        return this.applyKeys
            ? getFinalCellWriteMode(
                controlKeysState,
                this.persistentCellWriteMode,
                this.gestureCellWriteMode,
                this.allCellWriteModeInfos,
                this.isReadonlyContext
            )
            : this.gestureCellWriteMode ?? this.persistentCellWriteMode;
    }

    get cellWriteModeInfo() {
        profiler.trace();

        const {cellWriteMode} = this;

        return this.allCellWriteModeInfos.find(({mode}) => mode === cellWriteMode)!;
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
        const {fogProps} = this;
        return fogProps && getFogVisibleCells(this, fogProps);
    }

    get disableFogDemo(): boolean {
        const {puzzle: {typeManager: {disableFogDemo}}} = this;

        return typeof disableFogDemo === "function" ? disableFogDemo(this) : !!disableFogDemo;
    }

    get importOptionOverrides(): Partial<PuzzleImportOptions> {
        profiler.trace();
        return this.puzzle.typeManager.importOptionOverrides?.(this) ?? {};
    }

    get digitsCount() {
        profiler.trace();
        return this.importOptionOverrides.digitsCount
            ?? this.puzzle.digitsCount
            ?? getDefaultDigitsCount(this.puzzle);
    }

    get digitsCountInCurrentMode() {
        profiler.trace();

        const {supportZero} = this.puzzle;

        const {
            isDigitMode,
            digitsCount: digitsCountFunc = this.digitsCount + (isDigitMode && supportZero ? 1 : 0),
        } = this.cellWriteModeInfo;

        return typeof digitsCountFunc === "function"
            ? digitsCountFunc(this)
            : digitsCountFunc;
    }

    translate<PhraseT = string>(phrase: PartiallyTranslatable<PhraseT>) {
        return translate(phrase, this.languageCode);
    }

    onStateChange(
        actionsOrCallbacks: GameStateActionOrCallback<any, T> | GameStateActionOrCallback<any, T>[],
    ) {
        if (this._onStateChange) {
            this._onStateChange(actionsOrCallbacks);
            return;
        }

        const {isEnabled, isHost} = this.multiPlayer;

        actionsOrCallbacks = actionsOrCallbacks instanceof Array ? actionsOrCallbacks : [actionsOrCallbacks];

        const processedContext = this.cloneWith({
            animated: undefined,
            // Important: prevent unnecessary calls to processMessages()
            applyPendingMessages: false,
            onStateChange: () => {},
        });
        for (const actionOrCallback of actionsOrCallbacks) {
            const asAction = actionOrCallback as GameStateAction<any, T>;
            const isAction = typeof asAction.type === "object";

            if (!isAction || !isEnabled || isHost || (!this.puzzle.params?.share && !this.puzzle.typeManager.isGlobalAction?.(asAction, processedContext))) {
                const callback = isAction
                    ? asAction.type.callback(asAction.params, myClientId, asAction.actionId)
                    : actionOrCallback as PartialGameStateEx<T> | GameStateActionCallback<T>;

                const updates = typeof callback === "function" ? callback(processedContext) : callback;
                if (updates.selectedCells) {
                    updates.selectedCells = updates.selectedCells.filter((cell) =>
                        isSelectableCell(processedContext.puzzleIndex.getCellTypeProps(cell)));
                }

                processedContext.update({myGameState: mergeGameStateWithUpdates(processedContext.myGameState, updates)});
            } else {
                this.multiPlayer.sendMessage({
                    type: asAction.type.key,
                    actionId: asAction.actionId,
                    params: asAction.params,
                    state: {
                        mode: processedContext.cellWriteMode,
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

        this.update({myGameState: processedContext.myGameState});
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
            ? emptyObject as unknown as GameStateEx<T>
            : getEmptyGameState(puzzle, false, true),
        cellSize,
        cellSizeForSidePanel: cellSize,
        isReadonlyContext: true,
        applyKeys: false,
        applyPendingMessages: false,
    });
};
