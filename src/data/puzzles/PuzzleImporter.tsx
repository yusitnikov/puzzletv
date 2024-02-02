import {Position, PositionLiteral, PositionSet} from "../../types/layout/Position";
import {GivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {CellColorValue} from "../../types/sudoku/CellColor";
import {Constraint, isValidFinishedPuzzleByConstraints, toInvisibleConstraint} from "../../types/sudoku/Constraint";
import {
    allDrawingModes,
    importGivenColorsAsSolution,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition
} from "../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";
import {FieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {indexes} from "../../utils/indexes";
import {SudokuCellsIndex} from "../../types/sudoku/SudokuCellsIndex";
import {isVisibleCell} from "../../types/sudoku/CellTypeProps";
import {createEmptyContextForPuzzle} from "../../types/sudoku/PuzzleContext";
import {doesGridRegionContainCell} from "../../types/sudoku/GridRegion";
import {
    FillableCalculatorDigitConstraint
} from "../../components/sudoku/constraints/fillable-calculator-digit/FillableCalculatorDigit";
import {ReactNode} from "react";
import {ParsedRulesHtml} from "../../components/sudoku/rules/ParsedRulesHtml";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {GridParser} from "./GridParser";
import {LittleKillerConstraintByCells} from "../../components/sudoku/constraints/little-killer/LittleKiller";
import {
    detectOutsideClueDirection,
    getLineCellsByOutsideCell,
    OutsideClueLineDirectionLiteral,
    OutsideClueLineDirectionType
} from "../../components/sudoku/constraints/outside-clue/OutsideClue";
import {XSumConstraint} from "../../components/sudoku/constraints/x-sum/XSum";
import {SkyscraperConstraint} from "../../components/sudoku/constraints/skyscraper/Skyscraper";
import {SandwichSumConstraint} from "../../components/sudoku/constraints/sandwich-sum/SandwichSum";
import {NumberedRoomConstraint} from "../../components/sudoku/constraints/numbered-room/NumberedRoom";
import {
    NegativeDiagonalConstraint,
    PositiveDiagonalConstraint
} from "../../components/sudoku/constraints/main-diagonal/MainDiagonal";
import {RegionSumLineConstraint} from "../../components/sudoku/constraints/region-sum-line/RegionSumLine";
import {PalindromeConstraint} from "../../components/sudoku/constraints/palindrome/Palindrome";
import {RenbanConstraint} from "../../components/sudoku/constraints/renban/Renban";
import {WhispersConstraint} from "../../components/sudoku/constraints/whispers/Whispers";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {
    DecorativeCageConstraint,
    KillerCageConstraint
} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {AntiKnightConstraint} from "../../types/sudoku/constraints/AntiKnight";
import {AntiKingConstraint} from "../../types/sudoku/constraints/AntiKing";
import {
    NonConsecutiveNeighborsConstraint
} from "../../components/sudoku/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import {DisjointGroupsConstraint} from "../../types/sudoku/constraints/DisjointGroups";
import {QuadConstraint} from "../../components/sudoku/constraints/quad/Quad";
import {KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import {VMarkConstraint, XMarkConstraint} from "../../components/sudoku/constraints/xv/XV";
import {ThermometerConstraint} from "../../components/sudoku/constraints/thermometer/Thermometer";
import {EvenConstraint} from "../../components/sudoku/constraints/even/Even";
import {OddConstraint} from "../../components/sudoku/constraints/odd/Odd";
import {MaxConstraint, MinConstraint} from "../../components/sudoku/constraints/min-max/MinMax";
import {
    BoxIndexerConstraint,
    ColumnIndexerConstraint,
    RowIndexerConstraint
} from "../../components/sudoku/constraints/indexer/Indexer";
import {CloneConstraint} from "../../components/sudoku/constraints/clone/Clone";
import {BetweenLineConstraint} from "../../components/sudoku/constraints/between-line/BetweenLine";
import {LockoutLineConstraint} from "../../components/sudoku/constraints/lockout-line/LockoutLine";
import {LineConstraint} from "../../components/sudoku/constraints/line/Line";
import {EllipseConstraint, RectConstraint} from "../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {TextConstraint} from "../../components/sudoku/constraints/text/Text";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";
import {DoubleArrowConstraint} from "../../components/sudoku/constraints/double-arrow/DoubleArrow";
import {
    EntropicLineConstraint, ModularLineConstraint,
    ParityLineConstraint
} from "../../components/sudoku/constraints/entropy-line/EntropicLine";

export class PuzzleImporter<T extends AnyPTM> {
    private readonly regions: Position[][] = [];
    private readonly initialDigits: GivenDigitsMap<T["cell"]> = {};
    private readonly initialLetters: GivenDigitsMap<string> = {};
    private readonly initialColors: GivenDigitsMap<CellColorValue[]> = {};
    private readonly solutionColors: GivenDigitsMap<CellColorValue[]> = {};
    private readonly items: Constraint<T, any>[] = [];
    private readonly puzzle: PuzzleDefinition<T>;
    private inactiveCells: PositionSet;
    private importedTitle = false;

    constructor(
        slug: string,
        private readonly importOptions: PuzzleImportOptions,
        private readonly typeManager: SudokuTypeManager<T>,
        fieldSize: FieldSize,
    ) {
        const {
            digitsCount,
            noSpecialRules,
            loopX,
            loopY,
            allowOverrideColors = false,
            supportZero,
        } = importOptions;

        this.puzzle = {
            noIndex: true,
            slug,
            title: {[LanguageCode.en]: "Untitled"},
            typeManager,
            fieldSize,
            regions: this.regions,
            digitsCount,
            loopHorizontally: loopX,
            loopVertically: loopY,
            fieldMargin: loopX || loopY ? 0.99 : 0,
            allowDrawing: allDrawingModes,
            initialDigits: this.initialDigits,
            initialLetters: this.initialLetters,
            initialColors: this.initialColors,
            solutionColors: this.solutionColors,
            items: this.items,
            allowOverridingInitialColors: allowOverrideColors,
            supportZero,
            importOptions,
            resultChecker: noSpecialRules ? isValidFinishedPuzzleByConstraints : undefined,
        };

        this.inactiveCells = new PositionSet(indexes(fieldSize.rowsCount).flatMap(
            (top) => indexes(fieldSize.columnsCount).map((left) => ({top, left}))
        ));
    }

    private get cosmeticsLayer() {
        return this.importOptions.rotatableClues && this.importOptions.keepCircles
            ? FieldLayer.beforeSelection
            : this.importOptions.cosmeticsBehindFog
                ? FieldLayer.regular
                : FieldLayer.afterLines;
    }

    addGrid<JsonT>(gridParser: GridParser<T, JsonT>) {
        const {columnsCount, rowsCount, minDigit, maxDigit} = gridParser;

        this.inactiveCells = this.inactiveCells.bulkRemove(gridParser.offsetCoordsArray(indexes(rowsCount).flatMap(
            (top) => indexes(columnsCount).map((left) => ({top, left}))
        )));

        if (minDigit === 0) {
            this.puzzle.supportZero = true;
        }
        if (maxDigit !== undefined) {
            this.puzzle.digitsCount = Math.max(this.puzzle.digitsCount ?? 0, maxDigit);
        }

        gridParser.addToImporter(this);
    }

    setTitle(title = "") {
        if (title && !this.importedTitle) {
            this.puzzle.title = {[LanguageCode.en]: title};
            this.importedTitle = true;
        }
    }
    setAuthor(author = "") {
        if (author) {
            this.puzzle.author ??= {[LanguageCode.en]: author};
        }
    }
    setRuleset(ruleset = "") {
        if (ruleset && !this.puzzle.rules) {
            let parsedRules: ReactNode;
            if (this.importOptions.htmlRules) {
                parsedRules = <ParsedRulesHtml>{ruleset}</ParsedRulesHtml>;
            } else {
                parsedRules = <>{ruleset.split("\n").map(
                    (line, index) => <RulesParagraph key={index}>{line || <span>&nbsp;</span>}</RulesParagraph>
                )}</>;
            }
            this.puzzle.rules = () => parsedRules;
        }
    }
    setSuccessMessage(message: string) {
        this.puzzle.successMessage = message;
    }

    isVisibleGridCell({top, left}: Position) {
        return isVisibleCell(this.typeManager.getCellTypeProps?.(
            {
                top: Math.floor(top),
                left: Math.floor(left),
            },
            this.puzzle
        ));
    }

    fixCellPosition(cell: Position) {
        return this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell;
    }
    fixCellPositions(cells: Position[]) {
        return cells.map((cell) => this.fixCellPosition(cell));
    }

    addRegions<JsonT>(gridParser: GridParser<T, JsonT>, cellRegions: (number|null|undefined)[][]) {
        const {
            size,
            columnsCount,
            rowsCount,
            regionWidth,
            regionHeight,
            offsetX,
            offsetY,
        } = gridParser;

        const allGridCells: (Position & {region: number|null|undefined})[] = cellRegions
            .flatMap(
                (row, top) => row.map(
                    (region, left) => ({...gridParser.offsetCoords({top, left}), region})
                )
            );
        const validGridCells = allGridCells.filter((cell) => this.isVisibleGridCell(cell));

        const emptyContext = createEmptyContextForPuzzle(this.puzzle);
        const faces = this.typeManager.getRegionsWithSameCoordsTransformation?.(emptyContext, true) ?? [{
            top: offsetY,
            left: offsetX,
            width: columnsCount,
            height: rowsCount,
        }];
        const regions = faces.flatMap(face => {
            const validFaceCells = validGridCells.filter((cell) => doesGridRegionContainCell(face, cell));

            return indexes(size)
                .map(regionIndex => validFaceCells.filter(
                    ({top, left, region}) => {
                        if (region === undefined) {
                            const topIndex = Math.floor((top - offsetY) / regionHeight);
                            const leftIndex = Math.floor((left - offsetX) / regionWidth);
                            region = leftIndex + topIndex * regionHeight;
                        }

                        return region === regionIndex;
                    }
                ))
                .filter(({length}) => length);
        });
        if (regions.length > 1) {
            this.regions.push(...regions);
        }
    }

    toggleSudokuRules(enable: boolean) {
        this.puzzle.disableSudokuRules = !enable;
    }

    addItems(...items: Constraint<T, any>[]) {
        this.items.push(...items);
    }

    // region Add specific items
    // region Global constraints
    addAntiKnight() {
        this.addItems(AntiKnightConstraint());
    }
    addAntiKing() {
        this.addItems(AntiKingConstraint());
    }
    addNonConsecutive() {
        this.addItems(NonConsecutiveNeighborsConstraint());
    }
    addDisjointGroups(gridParser: GridParser<T, any>) {
        // TODO: support custom regions
        // TODO: support grid offset
        this.addItems(DisjointGroupsConstraint(gridParser.regionWidth, gridParser.regionHeight));
    }
    // endregion

    addFog(
        gridParser: GridParser<T, any>,
        startCell3x3Literals: PositionLiteral[] = [],
        startCellLiterals: PositionLiteral[] = [],
        bulbCellLiterals = startCell3x3Literals,
    ) {
        this.puzzle.prioritizeSelection = true;

        this.addItems(FogConstraint(
            gridParser.offsetCoordsArray(startCell3x3Literals),
            gridParser.offsetCoordsArray(startCellLiterals),
            gridParser.offsetCoordsArray(bulbCellLiterals),
        ));
    }

    addClones(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        color?: string,
    ) {
        const visibleCells = gridParser.offsetCoordsArray(cells)
            .filter((cell) => this.isVisibleGridCell(cell));

        if (visibleCells.length > 1) {
            this.addItems(CloneConstraint(visibleCells, color));
        }
    }

    addQuadruple(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        values: number[],
    ) {
        this.addItems(QuadConstraint(
            gridParser.offsetCoords(cellLiteral),
            values.map((digit) => this.typeManager.createCellDataByImportedDigit(digit)),
        ));
    }

    // region Domino
    addWhiteKropki(gridParser: GridParser<T, any>, cell1: PositionLiteral, cell2: PositionLiteral, value?: number, autoShowValue = true) {
        this.addItems(KropkiDotConstraint(
            this.fixCellPosition(gridParser.offsetCoords(cell1)),
            this.fixCellPosition(gridParser.offsetCoords(cell2)),
            false,
            value,
            undefined,
            autoShowValue || value !== 1,
        ));
    }
    addBlackKropki(gridParser: GridParser<T, any>, cell1: PositionLiteral, cell2: PositionLiteral, value?: number, autoShowValue = true) {
        this.addItems(KropkiDotConstraint(
            this.fixCellPosition(gridParser.offsetCoords(cell1)),
            this.fixCellPosition(gridParser.offsetCoords(cell2)),
            true,
            value,
            undefined,
            autoShowValue || value !== 2,
        ));
    }
    addX(gridParser: GridParser<T, any>, cell1: PositionLiteral, cell2: PositionLiteral) {
        this.addItems(XMarkConstraint(
            this.fixCellPosition(gridParser.offsetCoords(cell1)),
            this.fixCellPosition(gridParser.offsetCoords(cell2)),
        ));
    }
    addV(gridParser: GridParser<T, any>, cell1: PositionLiteral, cell2: PositionLiteral) {
        this.addItems(VMarkConstraint(
            this.fixCellPosition(gridParser.offsetCoords(cell1)),
            this.fixCellPosition(gridParser.offsetCoords(cell2)),
        ));
    }
    // endregion

    // region Cages
    addKillerCage(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        value?: number,
        lineColor?: string,
        fontColor?: string,
    ) {
        this.addItems(KillerCageConstraint(
            gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell)),
            value,
            false,
            undefined,
            lineColor,
            fontColor,
        ));
    }
    addExtraRegion(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
    ) {
        // TODO: implement visuals
        this.addItems(KillerCageConstraint(
            gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell)),
        ));
    }
    // endregion

    // region Arrows
    addArrow(
        gridParser: GridParser<T, any>,
        circleCellLiterals: PositionLiteral[],
        [lineStartLiteral, ...lineLiterals]: PositionLiteral[],
    ) {
        this.addItems(ArrowConstraint(
            gridParser.offsetCoordsArray(circleCellLiterals)
                .filter((cell) => this.isVisibleGridCell(cell)),
            gridParser.offsetCoordsArray(lineLiterals)
                .filter((cell) => this.isVisibleGridCell(cell)),
            this.importOptions.transparentArrowCircle,
            lineStartLiteral && gridParser.offsetCoords(lineStartLiteral),
            !!this.importOptions["product-arrow"],
            false,
        ));
    }
    addArrows(
        gridParser: GridParser<T, any>,
        circleCellLiterals: PositionLiteral[],
        lines: PositionLiteral[][],
    ) {
        for (const line of lines) {
            this.addArrow(gridParser, circleCellLiterals, line);
        }
        if (lines.length === 0) {
            this.addArrow(gridParser, circleCellLiterals, []);
        }
    }
    // endregion

    // region Lines
    addSimpleLineConstraint(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        factory: (cells: Position[], split?: boolean, lineColor?: string, lineWidth?: number) => Constraint<T, any>,
        lineColor?: string,
        lineWidth?: number,
    ) {
        const visibleCells = gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell));
        this.checkForOutsideCells(visibleCells);
        const constraint = factory(visibleCells, false, lineColor, lineWidth);
        this.addItems(display ? constraint : toInvisibleConstraint(constraint));
    }
    addRegionSumLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, RegionSumLineConstraint, lineColor, lineWidth);
    }
    addRenban(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, RenbanConstraint, lineColor, lineWidth);
    }
    addWhispers(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        value?: number,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(
            gridParser,
            cells,
            display,
            (cells, split, lineColor, lineWidth) => WhispersConstraint<T>(
                cells,
                split,
                value,
                lineColor,
                lineWidth,
            ),
            lineColor,
            lineWidth,
        );
    }
    addEntropicLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, EntropicLineConstraint, lineColor, lineWidth);
    }
    addModularLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, ModularLineConstraint, lineColor, lineWidth);
    }
    // noinspection JSUnusedGlobalSymbols
    addParityLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, ParityLineConstraint, lineColor, lineWidth);
    }
    addPalindrome(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(gridParser, cells, display, PalindromeConstraint, lineColor, lineWidth);
    }
    addThermometer(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        slow = false,
        lineColor?: string,
        lineWidth?: number,
        bulbRadius?: number,
    ) {
        this.addSimpleLineConstraint(
            gridParser,
            cells,
            true,
            (cells, split, lineColor, lineWidth) => ThermometerConstraint(
                cells,
                split,
                slow,
                lineColor,
                lineWidth,
                bulbRadius,
            ),
            lineColor,
            lineWidth,
        );
    }
    addBetweenLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addItems(BetweenLineConstraint(
            gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell)),
            false,
            lineColor,
            lineWidth,
        ));
    }
    addDoubleArrowLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        const constraint = DoubleArrowConstraint<T>(
            gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell)),
            false,
            lineColor,
            lineWidth,
        );
        this.addItems(display ? constraint : toInvisibleConstraint(constraint));
    }
    addLockoutLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        display: boolean,
        lineColor?: string,
        lineWidth?: number,
    ) {
        const constraint = LockoutLineConstraint<T>(
            gridParser.offsetCoordsArray(cells).filter((cell) => this.isVisibleGridCell(cell)),
            false,
            lineColor,
            lineWidth,
        );
        this.addItems(display ? constraint : toInvisibleConstraint(constraint));
    }
    // endregion

    // region Single cell
    addEven(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string, size?: number) {
        this.addItems(EvenConstraint(gridParser.offsetCoords(cellLiteral), color, size));
    }
    addOdd(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string, size?: number) {
        this.addItems(OddConstraint(gridParser.offsetCoords(cellLiteral), color, size));
    }
    addMaximum(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string) {
        this.addItems(MaxConstraint(gridParser.offsetCoords(cellLiteral), color));
    }
    addMinimum(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string) {
        this.addItems(MinConstraint(gridParser.offsetCoords(cellLiteral), color));
    }
    addRowIndexer(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string) {
        this.addItems(RowIndexerConstraint(gridParser.offsetCoords(cellLiteral), gridParser.fieldSize, color));
    }
    addColumnIndexer(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string) {
        this.addItems(ColumnIndexerConstraint(gridParser.offsetCoords(cellLiteral), gridParser.fieldSize, color));
    }
    addBoxIndexer(gridParser: GridParser<T, any>, cellLiteral: PositionLiteral, color?: string) {
        this.addItems(BoxIndexerConstraint(gridParser.offsetCoords(cellLiteral), gridParser.fieldSize, color));
    }
    // endregion

    // region Main diagonal
    addDiagonalConstraint(
        gridParser: GridParser<T, any>,
        factory: (size: number) => Constraint<T, any>,
    ) {
        // TODO: support grid offset
        this.addItems(factory(gridParser.size));
    }
    addPositiveDiagonal(gridParser: GridParser<T, any>) {
        this.addDiagonalConstraint(gridParser, PositiveDiagonalConstraint);
    }
    addNegativeDiagonal(gridParser: GridParser<T, any>) {
        this.addDiagonalConstraint(gridParser, NegativeDiagonalConstraint);
    }
    // endregion

    // region Outside clues
    addLittleKiller(
        gridParser: GridParser<T, any>,
        startCell: PositionLiteral,
        directionLiteral: OutsideClueLineDirectionLiteral,
        value?: number,
        textColor?: string,
        arrowColor?: string,
    ) {
        this.addMargin();

        const direction = detectOutsideClueDirection(startCell, gridParser.fieldSize, directionLiteral);

        this.addItems(LittleKillerConstraintByCells<T>(
            gridParser.offsetCoordsArray(getLineCellsByOutsideCell(startCell, gridParser.fieldSize, direction)),
            direction,
            value,
            textColor,
            arrowColor,
        ));
    }

    addSimpleOutsideClue(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        value: number,
        factory: (clueCell: Position, lineCells: Position[], value: number, color?: string) => Constraint<T, any>,
        color?: string,
        directionLiteral: OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType.straight,
    ) {
        this.addMargin();

        this.addItems(factory(
            gridParser.offsetCoords(cellLiteral),
            gridParser.offsetCoordsArray(getLineCellsByOutsideCell(cellLiteral, gridParser.fieldSize, directionLiteral)),
            value,
            color,
        ));
    }
    addSkyscraper(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        value: number,
        color?: string,
        directionLiteral?: OutsideClueLineDirectionLiteral,
    ) {
        this.addSimpleOutsideClue(gridParser, cellLiteral, value, SkyscraperConstraint, color, directionLiteral);
    }
    addSandwichSum(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        value: number,
        color?: string,
        directionLiteral?: OutsideClueLineDirectionLiteral,
    ) {
        this.addSimpleOutsideClue(gridParser, cellLiteral, value, SandwichSumConstraint, color, directionLiteral);
    }
    addXSum(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        value: number,
        color?: string,
        directionLiteral?: OutsideClueLineDirectionLiteral,
    ) {
        this.addSimpleOutsideClue(gridParser, cellLiteral, value, XSumConstraint, color, directionLiteral);
    }
    // noinspection JSUnusedGlobalSymbols
    addNumberedRoom(
        gridParser: GridParser<T, any>,
        cellLiteral: PositionLiteral,
        value: number,
        color?: string,
        directionLiteral?: OutsideClueLineDirectionLiteral,
    ) {
        this.addSimpleOutsideClue(gridParser, cellLiteral, value, NumberedRoomConstraint, color, directionLiteral);
    }
    // endregion

    // region Cosmetics
    addCosmeticLine(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        lineColor?: string,
        lineWidth?: number,
    ) {
        this.addSimpleLineConstraint(
            gridParser,
            cells,
            true,
            (cells, split, lineColor, lineWidth) => LineConstraint(cells, lineColor, lineWidth, split),
            lineColor,
            lineWidth,
        );
    }
    addCosmeticRect(
        gridParser: GridParser<T, any>,
        cellLiterals: PositionLiteral[],
        width: number,
        height: number,
        backgroundColor?: string,
        borderColor?: string,
        text?: string,
        textColor?: string,
        angle?: number,
    ) {
        const cells = gridParser.offsetCoordsArray(cellLiterals);
        this.checkForOutsideCells(cells);
        this.addItems(RectConstraint(
            this.fixCellPositions(cells),
            {width, height},
            backgroundColor,
            borderColor,
            text,
            textColor,
            angle,
            this.cosmeticsLayer,
        ));
    }
    addCosmeticCircle(
        gridParser: GridParser<T, any>,
        cellLiterals: PositionLiteral[],
        width: number,
        height: number,
        backgroundColor?: string,
        borderColor?: string,
        text?: string,
        textColor?: string,
        angle?: number,
    ) {
        const cells = gridParser.offsetCoordsArray(cellLiterals);
        this.checkForOutsideCells(cells);
        this.addItems(EllipseConstraint(
            this.fixCellPositions(cells),
            {width, height},
            backgroundColor,
            borderColor,
            text,
            textColor,
            angle,
            this.cosmeticsLayer,
        ));
    }
    addCosmeticText(
        gridParser: GridParser<T, any>,
        cellLiterals: PositionLiteral[],
        text: string,
        color?: string,
        size?: number,
        angle?: number,
    ) {
        const cells = gridParser.offsetCoordsArray(cellLiterals);
        this.checkForOutsideCells(cells);
        this.addItems(TextConstraint(
            this.fixCellPositions(cells),
            text,
            color,
            size,
            angle,
            this.cosmeticsLayer,
        ));
    }
    addCosmeticCage(
        gridParser: GridParser<T, any>,
        cells: PositionLiteral[],
        text?: string,
        lineColor?: string,
        fontColor?: string,
    ) {
        const visibleCells = gridParser.offsetCoordsArray(cells)
            .filter((cell) => this.isVisibleGridCell(cell));
        this.checkForOutsideCells(visibleCells);
        this.addItems(DecorativeCageConstraint(
            visibleCells,
            text,
            false,
            undefined,
            lineColor,
            fontColor,
        ));
    }
    // endregion
    // endregion

    addMargin(margin = 1) {
        this.puzzle.fieldMargin = Math.max(this.puzzle.fieldMargin ?? 0, margin);
    }
    checkForOutsideCells(cells: Position[]) {
        const margin = Math.max(0, ...cells.flatMap(({top, left}) => [
            -top,
            -left,
            top + 1 - this.puzzle.fieldSize.rowsCount,
            left + 1 - this.puzzle.fieldSize.columnsCount,
        ]));

        if (margin > 0) {
            this.addMargin(margin);
        }
    };


    addGiven(gridParser: GridParser<T, any>, top: number, left: number, value: number | string) {
        const {top: offsetTop, left: offsetLeft} = gridParser.offsetCoords({top, left});

        switch (typeof value) {
            case "number":
                if (this.importOptions.fillableDigitalDisplay) {
                    // TODO: extract to a type manager
                    this.items.push(FillableCalculatorDigitConstraint({top: offsetTop, left: offsetLeft}, value));
                } else {
                    if (gridParser.hasSolution) {
                        this.addSolutionDigit(gridParser, top, left, value);
                    }
                    this.initialDigits[offsetTop] = this.initialDigits[offsetTop] || {};
                    this.initialDigits[offsetTop][offsetLeft] = this.typeManager.createCellDataByImportedDigit(value);
                }
                break;
            case "string":
                this.initialLetters[offsetTop] = this.initialLetters[offsetTop] || {};
                this.initialLetters[offsetTop][offsetLeft] = value;
                break;
        }
    }

    addSolutionDigit(gridParser: GridParser<T, any>, top: number, left: number, value: number | string) {
        const offsetCoords = gridParser.offsetCoords({top, left});
        top = offsetCoords.top;
        left = offsetCoords.left;

        this.puzzle.solution ??= {};
        this.puzzle.solution[top] ??= {};
        this.puzzle.solution[top][left] = value;
    }

    addInitialColors(gridParser: GridParser<T, any>, top: number, left: number, ...colors: CellColorValue[]) {
        const offsetCoords = gridParser.offsetCoords({top, left});
        top = offsetCoords.top;
        left = offsetCoords.left;

        if (colors.length) {
            this.initialColors[top] = this.initialColors[top] ?? {};
            this.initialColors[top][left] = this.initialColors[top][left] ?? [];
            this.initialColors[top][left].push(...this.processColors(gridParser, colors, false));
        }
    }

    addSolutionColors(gridParser: GridParser<T, any>, top: number, left: number, ...colors: CellColorValue[]) {
        const offsetCoords = gridParser.offsetCoords({top, left});
        top = offsetCoords.top;
        left = offsetCoords.left;

        if (colors.length) {
            this.solutionColors[top] = this.solutionColors[top] ?? {};
            this.solutionColors[top][left] = this.solutionColors[top][left] ?? [];
            this.solutionColors[top][left].push(...this.processColors(gridParser, colors, true));
        }
    }

    processColor(gridParser: GridParser<T, any>, color: CellColorValue, forceMapping: boolean): CellColorValue {
        return forceMapping || this.typeManager.mapImportedColors
            ? gridParser.colorsMap[color as string] ?? color
            : color;
    }
    processColors(gridParser: GridParser<T, any>, colors: CellColorValue[], forceMapping: boolean) {
        return colors.map((color) => this.processColor(gridParser, color, forceMapping));
    }

    importGivenColorsAsSolution() {
        importGivenColorsAsSolution(this.puzzle);
    }

    finalize(): PuzzleDefinition<T> {
        this.puzzle.inactiveCells = this.inactiveCells.items;

        if (Object.keys(this.puzzle.solution ?? {}).length || Object.keys(this.puzzle.solutionColors ?? {}).length) {
            this.puzzle.resultChecker = isValidFinishedPuzzleByEmbeddedSolution;
        }

        if (this.importOptions.splitUnconnectedRegions) {
            this.splitUnconnectedRegions();
        }

        return this.puzzle;
    }

    private splitUnconnectedRegions() {
        const cellsIndex = new SudokuCellsIndex(this.puzzle.typeManager.postProcessPuzzle?.(this.puzzle) ?? this.puzzle);

        this.puzzle.regions = cellsIndex.splitUnconnectedRegions(this.regions);
    }
}
