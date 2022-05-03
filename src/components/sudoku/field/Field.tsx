import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {Fragment, ReactNode, useMemo, useState} from "react";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection, CellSelectionColor} from "../cell/CellSelection";
import {CellDigits, shouldSkipCellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateApplyCurrentMultiLine,
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState,
    gameStateResetCurrentMultiLine,
    gameStateSelectAllCells,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {FieldLayerContext} from "../../../contexts/FieldLayerContext";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {
    asConstraint,
    ConstraintOrComponent,
    getAllPuzzleConstraintsAndComponents,
    isConstraint,
    isValidUserDigit,
    prepareGivenDigitsMapForConstraints
} from "../../../types/sudoku/Constraint";
import {FieldCellMouseHandler} from "./FieldCellMouseHandler";
import {isNoSelectionWriteMode} from "../../../types/sudoku/CellWriteMode";

export interface FieldProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    rect: Rect;
    cellSize: number;
}

export const Field = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        puzzle,
        state,
        onStateChange,
        rect,
        cellSize
    }: FieldProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        typeManager,
        fieldSize,
        fieldMargin = 0,
        initialDigits = {},
    } = puzzle;

    const {
        isValidCell = () => true,
        getRegionsWithSameCoordsTransformation,
        getCellSelectionType,
    } = typeManager;

    const items = useMemo(() => getAllPuzzleConstraintsAndComponents(puzzle, state, cellSize), [puzzle, state, cellSize]);

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(puzzle);

    const itemsProps: ItemsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> = {
        items,
        puzzle,
        state,
        regionsWithSameCoordsTransformation,
        cellSize,
    };

    const {selectedCells, isReady, cellWriteMode, enableConflictChecker} = state;
    const {cells} = gameStateGetCurrentFieldState(state);

    if (!isReady) {
        onStateChange = () => {};
    }

    const userDigits = useMemo(() => prepareGivenDigitsMapForConstraints(puzzle, cells), [puzzle, cells]);

    const {isAnyKeyDown} = useControlKeysState();

    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useEventListener(window, "mousedown", () => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }

        setIsDeleteSelectedCellsStroke(false);
        onStateChange(gameStateResetCurrentMultiLine);
    });

    useEventListener(window, "mouseup", () => {
        onStateChange(gameState => gameStateApplyCurrentMultiLine(typeManager, gameState));
    });

    // Handle arrows
    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        // Use the key modifiers from the event - they are always up-to-date
        const isAnyKeyDown = ctrlKey || shiftKey;

        const handleArrow = (xDirection: number, yDirection: number, isMainKeyboard = true) => (isMainKeyboard || !ctrlKey) && onStateChange(
            gameState => gameStateApplyArrowToSelectedCells(puzzle, gameState, xDirection, yDirection, isAnyKeyDown, isMainKeyboard)
        );

        switch (code) {
            case "ArrowLeft":
                handleArrow(-1, 0);
                break;
            case "ArrowRight":
                handleArrow(1, 0);
                break;
            case "ArrowUp":
                handleArrow(0, -1);
                break;
            case "ArrowDown":
                handleArrow(0, 1);
                break;
            case "KeyA":
                if (ctrlKey && !shiftKey) {
                    onStateChange(gameState => gameStateSelectAllCells(puzzle, gameState));
                    ev.preventDefault();
                }
                handleArrow(-1, 0, false);
                break;
            case "KeyD":
                handleArrow(1, 0, false);
                break;
            case "KeyW":
                handleArrow(0, -1, false);
                break;
            case "KeyS":
                handleArrow(0, 1, false);
                break;
            case "Escape":
                if (!isAnyKeyDown) {
                    onStateChange(gameStateClearSelectedCells);
                    ev.preventDefault();
                }
                break;
        }
    });

    const renderCellsLayer = (keyPrefix: string, renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode, useShadow = false) =>
        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
            useShadow={useShadow}
        >
            {cells.flatMap((row, rowIndex) => row.map((cellState, columnIndex) => {
                const cellPosition: Position = {
                    left: columnIndex,
                    top: rowIndex,
                };

                if (!isValidCell(cellPosition, puzzle)) {
                    return null;
                }

                const content = renderer(cellState, cellPosition);

                return content && <FieldRect
                    key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
                    puzzle={puzzle}
                    {...cellPosition}
                >
                    {content}
                </FieldRect>;
            }))}
        </FieldSvg>;

    return <Absolute
        {...rect}
        angle={typeManager.getFieldAngle?.(state)}
        style={{backgroundColor: "white"}}
    >
        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
        >
            <FieldLayerContext.Provider value={FieldLayer.beforeBackground}>
                <Items {...itemsProps}/>
            </FieldLayerContext.Provider>
        </FieldSvg>

        {renderCellsLayer("background", ({colors}) => !!colors?.size && <CellBackground
            colors={colors}
        />)}

        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
        >
            <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                <Items {...itemsProps}/>
            </FieldLayerContext.Provider>
        </FieldSvg>

        {!isNoSelectionWriteMode(cellWriteMode) && renderCellsLayer("selection", (cellState, cellPosition) => {
            let color = "";
            let width = 1;

            if (selectedCells.contains(cellPosition)) {
                color = selectedCells.last()?.left === cellPosition.left && selectedCells.last()?.top === cellPosition.top
                    ? CellSelectionColor.mainCurrent
                    : CellSelectionColor.mainPrevious;
            } else if (getCellSelectionType) {
                const customSelection = getCellSelectionType(cellPosition, puzzle, state);
                if (customSelection) {
                    color = customSelection.color;
                    width = customSelection.strokeWidth;
                }
            }

            return !!color && <CellSelection
                size={cellSize}
                color={color}
                strokeWidth={width}
            />;
        })}

        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
        >
            <FieldLayerContext.Provider value={FieldLayer.regular}>
                <Items {...itemsProps}/>
            </FieldLayerContext.Provider>
        </FieldSvg>

        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
            useShadow={false}
        >
            <FieldLayerContext.Provider value={FieldLayer.lines}>
                <Items {...itemsProps}/>
            </FieldLayerContext.Provider>
        </FieldSvg>

        <FieldSvg
            fieldSize={fieldSize}
            fieldMargin={fieldMargin}
            cellSize={cellSize}
        >
            <FieldLayerContext.Provider value={FieldLayer.top}>
                <Items {...itemsProps}/>
            </FieldLayerContext.Provider>
        </FieldSvg>

        {renderCellsLayer("digits", (cellState, cell) => {
            const initialData = initialDigits?.[cell.top]?.[cell.left];

            return !shouldSkipCellDigits(initialData, cellState) && <CellDigits
                puzzle={puzzle}
                data={cellState}
                initialData={initialData}
                size={1}
                cellPosition={cell}
                state={state}
                isValidUserDigit={!enableConflictChecker || isValidUserDigit(cell, userDigits, items, puzzle, state)}
            />;
        }, true)}

        {isReady && renderCellsLayer("mouse-handler", (cellState, cellPosition) => <FieldCellMouseHandler
            state={state}
            onStateChange={onStateChange}
            cellPosition={cellPosition}
            isDeleteSelectedCellsStroke={isDeleteSelectedCellsStroke}
            onIsDeleteSelectedCellsStrokeChange={setIsDeleteSelectedCellsStroke}
        />)}
    </Absolute>;
};

interface ItemsInOneRegionProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    items: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[];
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    cellSize: number;
}

const ItemsInOneRegion = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {items, puzzle, state, cellSize}: ItemsInOneRegionProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    return <>
        {items.map((item, index) => {
            if (isConstraint(item)) {
                const {component: Component, ...otherData} = asConstraint(item);

                return Component && <Component
                    key={index}
                    puzzle={puzzle}
                    gameState={state}
                    cellSize={cellSize}
                    {...otherData}
                />;
            } else {
                return (item as any)?.key
                    ? item as ReactNode
                    : <Fragment key={index}>{item as ReactNode}</Fragment>;
            }
        })}
    </>;
};

interface ItemsProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>
    extends ItemsInOneRegionProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    regionsWithSameCoordsTransformation?: Rect[];
}

const Items = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {
        regionsWithSameCoordsTransformation,
        ...otherProps
    }: ItemsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => <>
    {regionsWithSameCoordsTransformation?.map((rect, index) => <FieldRect
        key={`items-region-${index}`}
        puzzle={otherProps.puzzle}
        clip={true}
        {...rect}
    >
        <AutoSvg
            left={-rect.left}
            top={-rect.top}
            width={1}
            height={1}
        >
            <ItemsInOneRegion {...otherProps}/>
        </AutoSvg>
    </FieldRect>)}

    {!regionsWithSameCoordsTransformation && <ItemsInOneRegion {...otherProps}/>}
</>;
