import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {indexes} from "../../../utils/indexes";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {useEventListener} from "../../../hooks/useEventListener";
import {useControlKeysState} from "../../../hooks/useControlKeysState";
import {Fragment, MouseEvent, PointerEvent, ReactNode, useMemo, useState} from "react";
import {CellState} from "../../../types/sudoku/CellState";
import {CellBackground} from "../cell/CellBackground";
import {CellSelection, CellSelectionColor} from "../cell/CellSelection";
import {CellDigits} from "../cell/CellDigits";
import {FieldSvg} from "./FieldSvg";
import {
    gameStateApplyArrowToSelectedCells,
    gameStateClearSelectedCells,
    gameStateGetCurrentFieldState, gameStateGetCurrentGivenDigitsByCells,
    gameStateSelectAllCells,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCell,
    ProcessedGameState
} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {textColor} from "../../app/globals";
import {FieldLayerContext, useIsFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Constraint, ConstraintOrComponent} from "../../../types/sudoku/Constraint";
import {mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {RegionConstraint} from "../constraints/region/Region";

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
        items: itemsOrFn = [],
    } = puzzle;

    const {
        isValidCell = () => true,
        getRegionsWithSameCoordsTransformation,
        getCellSelectionType,
        getRegionsForRowsAndColumns = () => [
            ...indexes(fieldSize.rowsCount).map(top => RegionConstraint(
                indexes(fieldSize.columnsCount).map(left => ({left, top})),
                false,
                "row"
            )),
            ...indexes(fieldSize.columnsCount).map(left => RegionConstraint(
                indexes(fieldSize.rowsCount).map(top => ({left, top})),
                false,
                "column"
            )),
        ],
    } = typeManager;

    const items: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[] = useMemo(() => [
        <FieldLines puzzle={puzzle} cellSize={cellSize}/>,
        ...getRegionsForRowsAndColumns(puzzle, state),
        ...fieldSize.regions.map(region => RegionConstraint(region)),
        ...(
            typeof itemsOrFn === "function"
                ? itemsOrFn(state)
                : itemsOrFn as ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        ),
    ], [itemsOrFn, puzzle, state, cellSize, fieldSize, getRegionsForRowsAndColumns]);

    const constraints: Constraint<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[] = items
        .map(item => item as Constraint<CellType, {}, GameStateExtensionType, ProcessedGameStateExtensionType>)
        .filter(item => item.name);

    const ItemsInOneRegion = () => <>
        {items.map((item, index) => {
            const constraint = item as Constraint<CellType, {}, GameStateExtensionType, ProcessedGameStateExtensionType>;
            if (constraint?.name) {
                const {component: Component, ...otherData} = constraint;

                return Component && <Component
                    key={index}
                    gameState={state}
                    cellSize={cellSize}
                    {...otherData}
                />;
            } else {
                return <Fragment key={index}>{item as ReactNode}</Fragment>;
            }
        })}
    </>;

    const fullMargin = fieldMargin + fieldSize.fieldSize;
    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(puzzle) || [{
        left: -fullMargin,
        top: -fullMargin,
        width: fieldSize.columnsCount + fullMargin * 2,
        height: fieldSize.rowsCount + fullMargin * 2,
    }];

    const Items = () => <>
        {regionsWithSameCoordsTransformation.map((rect, index) => <FieldRect
            key={`items-region-${index}`}
            puzzle={puzzle}
            clip={true}
            {...rect}
        >
            <AutoSvg
                left={-rect.left}
                top={-rect.top}
                width={1}
                height={1}
            >
                <ItemsInOneRegion/>
            </AutoSvg>
        </FieldRect>)}
    </>;

    const {selectedCells, isReady, enableConflictChecker} = state;
    const {cells} = gameStateGetCurrentFieldState(state);

    if (!isReady) {
        onStateChange = () => {
        };
    }

    const userDigits = useMemo(
        () => mergeGivenDigitsMaps(gameStateGetCurrentGivenDigitsByCells(cells), initialDigits),
        [cells, initialDigits]
    );

    const {isAnyKeyDown} = useControlKeysState();

    const [isDeleteSelectedCellsStroke, setIsDeleteSelectedCellsStroke] = useState(false);

    // Handle outside click
    useEventListener(window, "mousedown", () => {
        if (!isAnyKeyDown) {
            onStateChange(gameStateClearSelectedCells);
        }

        setIsDeleteSelectedCellsStroke(false);
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

    const renderCellsLayer = (keyPrefix: string, renderer: (cellState: CellState<CellType>, cellPosition: Position) => ReactNode, clip = false, useShadow = false) =>
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

                return <FieldRect
                    key={`cell-${keyPrefix}-${rowIndex}-${columnIndex}`}
                    puzzle={puzzle}
                    clip={clip}
                    {...cellPosition}
                >
                    {renderer(cellState, cellPosition)}
                </FieldRect>;
            }))}
        </FieldSvg>;

    return <>
        <style dangerouslySetInnerHTML={{
            __html: `
            html,
            body {
                overflow: hidden;
            }
        `
        }}/>

        <Absolute
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
                    <Items/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("background", ({colors}) => <CellBackground
                colors={colors}
            />)}

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
            >
                <FieldLayerContext.Provider value={FieldLayer.beforeSelection}>
                    <Items/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("selection", (cellState, cellPosition) => {
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
                    <Items/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
                useShadow={false}
            >
                <FieldLayerContext.Provider value={FieldLayer.lines}>
                    <Items/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            <FieldSvg
                fieldSize={fieldSize}
                fieldMargin={fieldMargin}
                cellSize={cellSize}
            >
                <FieldLayerContext.Provider value={FieldLayer.top}>
                    <Items/>
                </FieldLayerContext.Provider>
            </FieldSvg>

            {renderCellsLayer("digits", (cellState, cell) => {
                let isValidUserDigit = true;
                const userDigit = userDigits[cell.top]?.[cell.left];
                if (enableConflictChecker && userDigit !== undefined) {
                    for (const constraint of constraints) {
                        if (constraint.cells.length && !constraint.cells.some((constraintCell: Position) => isSamePosition(constraintCell, cell))) {
                            continue;
                        }

                        if (!constraint.isValidCell(cell, userDigits, puzzle, state)) {
                            isValidUserDigit = false;
                            break;
                        }
                    }
                }

                return <CellDigits
                    puzzle={puzzle}
                    data={cellState}
                    initialData={initialDigits?.[cell.top]?.[cell.left]}
                    size={1}
                    cellPosition={cell}
                    state={state}
                    isValidUserDigit={isValidUserDigit}
                />;
            }, false, true)}

            {renderCellsLayer("mouse-handler", (cellState, cellPosition) => <rect
                width={1}
                height={1}
                fill={"none"}
                stroke={"none"}
                style={{
                    cursor: isReady ? "pointer" : undefined,
                    touchAction: "none",
                    userSelect: "none",
                    pointerEvents: "all",
                }}
                onMouseDown={(ev: MouseEvent<any>) => {
                    // Make sure that clicking on the grid won't be recognized as an outside click and won't try to drag
                    ev.preventDefault();
                    ev.stopPropagation();
                }}
                onPointerDown={({target, pointerId, ctrlKey, shiftKey, isPrimary}: PointerEvent<any>) => {
                    if ((target as Element).hasPointerCapture?.(pointerId)) {
                        (target as Element).releasePointerCapture?.(pointerId);
                    }

                    const isMultiSelection = ctrlKey || shiftKey || !isPrimary;

                    setIsDeleteSelectedCellsStroke(isMultiSelection && selectedCells.contains(cellPosition));
                    onStateChange(
                        gameState => isMultiSelection
                            ? gameStateToggleSelectedCell(gameState, cellPosition)
                            : gameStateSetSelectedCells(gameState, [cellPosition])
                    );
                }}
                onPointerEnter={({buttons}: PointerEvent<any>) => {
                    if (buttons !== 1) {
                        return;
                    }

                    onStateChange(gameState => gameStateToggleSelectedCell(gameState, cellPosition, !isDeleteSelectedCellsStroke));
                }}
            />, true)}
        </Absolute>
    </>;
};

export const FieldLines = ({puzzle, cellSize}: Pick<FieldProps<any, any, any>, "puzzle" | "cellSize">) => {
    const isLayer = useIsFieldLayer(FieldLayer.lines);

    const {
        typeManager: {
            borderColor = textColor,
        },
        fieldSize: {columnsCount, rowsCount},
    } = puzzle;

    return isLayer && <>
        {indexes(rowsCount, true).map(rowIndex => {
            return <line
                key={`h-line-${rowIndex}`}
                x1={0}
                y1={rowIndex}
                x2={columnsCount}
                y2={rowIndex}
                stroke={borderColor}
                strokeWidth={1 / cellSize}
            />;
        })}

        {indexes(columnsCount, true).flatMap(columnIndex => <line
            key={`v-line-${columnIndex}`}
            x1={columnIndex}
            y1={0}
            x2={columnIndex}
            y2={rowsCount}
            stroke={borderColor}
            strokeWidth={1 / cellSize}
        />)}
    </>;
};
