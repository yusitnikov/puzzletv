import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {GridParser} from "./GridParser";
import {
    AntikingConstraintConfig,
    AntiknightConstraintConfig,
    ArrowConstraintConfig,
    ArrowStyle,
    ArrowSymbolParams,
    BasicShapeStyle, BetweenLinesConstraintConfig,
    BulbWithArrows,
    Cage,
    CageStyle,
    CellId,
    CloneConstraintConfig,
    ColumnIndexerConstraintConfig,
    CompressedCell,
    CompressedCosmeticConfig,
    CompressedPuzzle,
    ConstraintType,
    CornerId,
    CosmeticCageConstraintConfig,
    CosmeticLineConstraintConfig,
    CosmeticLineStyle,
    CosmeticSymbol,
    CosmeticSymbolConstraintConfig,
    CustomConstraintConfig,
    DiagonalMinusConstraintConfig,
    DiagonalPlusConstraintConfig,
    DiagonalType,
    DifferenceConstraintConfig,
    DifferentValuesConstraintConfig,
    DisjointGroupsConstraintConfig, DoubleArrowConstraintConfig,
    EdgeClue,
    EdgeId,
    EllipseSymbolParams,
    EvenConstraintConfig,
    GivensConstraintConfig,
    GlobalEntropyConstraintConfig,
    KillerCagesConstraintConfig,
    LineConstraintConfigBase,
    LineStyle,
    LineWithEndPointsStyle,
    LittleKiller,
    LittleKillersConstraintConfig,
    LockoutLineConstraintConfig,
    LookAndSayCagesConstraintConfig,
    MaximumConstraintConfig,
    MinimumConstraintConfig,
    NonconsecutiveConstraintConfig,
    NumberedRoomsConstraintConfig,
    OddConstraintConfig,
    OuterCellId,
    OuterClue,
    QuadrupleClue,
    QuadrupleConstraintConfig,
    RatioConstraintConfig,
    RectangleSymbolParams,
    RegionsConstraintConfig,
    RowIndexerConstraintConfig,
    SandwichSumsConstraintConfig,
    SkyscrapersConstraintConfig,
    Stroke,
    SudokuBlob,
    SudokuLayer,
    SymbolParams,
    SymbolType,
    TextSymbolParams,
    ThermometerConstraintConfig,
    ThermometerStyle,
    XSumsConstraintConfig,
    XVConstraintConfig
} from "../../types/SudokuMaker";
import {PuzzleImporter} from "./PuzzleImporter";
import {Position, stringifyCellCoords} from "../../types/layout/Position";
import {CellColor} from "../../types/sudoku/CellColor";
import {ObjectParser, ObjectParserFieldMap} from "../../types/struct/ObjectParser";
import {splitArrayIntoChunks} from "../../utils/array";
import {decompressFromEncodedURIComponent} from "lz-string";
import {getPuzzleImportLoader} from "./Import";
import {RenbanConstraint} from "../../components/sudoku/constraints/renban/Renban";
import {Constraint} from "../../types/sudoku/Constraint";
import {WhispersConstraint} from "../../components/sudoku/constraints/whispers/Whispers";
import {PalindromeConstraint} from "../../components/sudoku/constraints/palindrome/Palindrome";
import {RegionSumLineConstraint} from "../../components/sudoku/constraints/region-sum-line/RegionSumLine";
import {LineConstraint} from "../../components/sudoku/constraints/line/Line";
import {SandwichSumConstraint} from "../../components/sudoku/constraints/sandwich-sum/SandwichSum";
import {OutsideClueLineDirectionType} from "../../components/sudoku/constraints/outside-clue/OutsideClue";
import {XSumConstraint} from "../../components/sudoku/constraints/x-sum/XSum";
import {NumberedRoomConstraint} from "../../components/sudoku/constraints/numbered-room/NumberedRoom";
import {SkyscraperConstraint} from "../../components/sudoku/constraints/skyscraper/Skyscraper";

export class SudokuMakerGridParser<T extends AnyPTM> extends GridParser<T, CompressedPuzzle> {
    constructor(puzzleJson: CompressedPuzzle, offsetX: number, offsetY: number) {
        super(
            puzzleJson,
            offsetX,
            offsetY,
            Math.round(Math.sqrt(puzzleJson.cells.length)),
            sudokuMakerColorsMap,
        );
    }

    addToImporter(importer: PuzzleImporter<T>) {
        new ObjectParser<CompressedPuzzle>({
            cells: (cellsFlat) => {
                const cells = splitArrayIntoChunks(cellsFlat, this.size);

                const allGridCells: (CompressedCell & Position)[] = cells.flatMap(
                    (row, top) => row.map(
                        (cell, left) => ({top, left, ...cell})
                    )
                );

                for (const {top, left, ...cell} of allGridCells) {
                    new ObjectParser<CompressedCell>({
                        value: (value, {given}) => {
                            if (value !== undefined) {
                                if (given) {
                                    importer.addGiven(this, top, left, value);
                                } else {
                                    importer.addSolutionDigit(this, top, left, value);
                                }
                            }
                        },
                        given: undefined,
                        colors: (colorsBitMask = 0) => {
                            for (let color = 0; color < 10; color++) {
                                if ((colorsBitMask & (1 << color)) !== 0) {
                                    importer.addSolutionColors(this, top, left, sudokuMakerColors[color]);
                                }
                            }
                        },
                        candidates: undefined,
                        cornerPencilMarks: undefined,
                    }).parse(cell, `SudokuMaker cell ${stringifyCellCoords({top, left})}`);
                }
            },
            constraints: (constraints) => {
                for (const constraint of constraints) {
                    switch (constraint.type) {
                        case ConstraintType.Givens:
                            new ObjectParser<GivensConstraintConfig>({
                                type: undefined,
                            }).parse(constraint, "givens");
                            break;
                        case ConstraintType.Regions:
                            new ObjectParser<RegionsConstraintConfig>({
                                type: undefined,
                                regions: (cellsFlat) => {
                                    const cells = splitArrayIntoChunks(cellsFlat, this.size);
                                    importer.addRegions(this, cells);
                                },
                            }).parse(constraint, "regions");
                            break;
                        case ConstraintType.DiagonalMinus:
                            new ObjectParser<DiagonalMinusConstraintConfig>({
                                type: undefined,
                                // TODO
                                style: lineStyleValidator.bind("diagonal style"),
                            }).parse(constraint, "diagonal-");
                            importer.addNegativeDiagonal(this);
                            break;
                        case ConstraintType.DiagonalPlus:
                            new ObjectParser<DiagonalPlusConstraintConfig>({
                                type: undefined,
                                // TODO
                                style: lineStyleValidator.bind("diagonal style"),
                            }).parse(constraint, "diagonal+");
                            importer.addPositiveDiagonal(this);
                            break;
                        case ConstraintType.Antiking:
                            new ObjectParser<AntikingConstraintConfig>({
                                type: undefined,
                            }).parse(constraint, "anti-king");
                            importer.addAntiKing();
                            break;
                        case ConstraintType.Antiknight:
                            new ObjectParser<AntiknightConstraintConfig>({
                                type: undefined,
                            }).parse(constraint, "anti-knight");
                            importer.addAntiKnight();
                            break;
                        case ConstraintType.DisjointGroups:
                            new ObjectParser<DisjointGroupsConstraintConfig>({
                                type: undefined,
                            }).parse(constraint, "disjoint groups");
                            importer.addDisjointGroups(this);
                            break;
                        case ConstraintType.Nonconsecutive:
                            new ObjectParser<NonconsecutiveConstraintConfig>({
                                type: undefined,
                            }).parse(constraint, "non-consecutive");
                            importer.addNonConsecutive();
                            break;
                        case ConstraintType.GlobalEntropy:
                            new ObjectParser<GlobalEntropyConstraintConfig>({
                                type: undefined,
                                groups: undefined,
                            }).parse(constraint, "global entropy");
                            // TODO
                            // importer.addItems(GlobalEntropyConstraint());
                            break;
                        case ConstraintType.Even:
                            new ObjectParser<EvenConstraintConfig>({
                                type: undefined,
                                cells: (cells) => {
                                    for (const cell of cells) {
                                        importer.addEven(this, this.parseCellId(cell));
                                    }
                                },
                                // TODO
                                style: undefined,
                            }).parse(constraint, "even");
                            break;
                        case ConstraintType.Odd:
                            new ObjectParser<OddConstraintConfig>({
                                type: undefined,
                                cells: (cells) => {
                                    for (const cell of cells) {
                                        importer.addOdd(this, this.parseCellId(cell));
                                    }
                                },
                                // TODO
                                style: undefined,
                            }).parse(constraint, "odd");
                            break;
                        case ConstraintType.Maximum:
                            new ObjectParser<MaximumConstraintConfig>({
                                type: undefined,
                                cells: (cells) => {
                                    for (const cell of cells) {
                                        importer.addMaximum(this, this.parseCellId(cell));
                                    }
                                },
                                // TODO
                                style: undefined,
                            }).parse(constraint, "maximum");
                            break;
                        case ConstraintType.Minimum:
                            new ObjectParser<MinimumConstraintConfig>({
                                type: undefined,
                                cells: (cells) => {
                                    for (const cell of cells) {
                                        importer.addMinimum(this, this.parseCellId(cell));
                                    }
                                },
                                // TODO
                                style: undefined,
                            }).parse(constraint, "minimum");
                            break;
                        case ConstraintType.Difference:
                            new ObjectParser<DifferenceConstraintConfig>({
                                type: undefined,
                                clues: (clues) => {
                                    for (const clue of clues) {
                                        new ObjectParser<EdgeClue<number>>({
                                            edge: (edgeId, {value}) => {
                                                importer.addWhiteKropki(
                                                    this,
                                                    ...this.parseEdgeId(edgeId),
                                                    value,
                                                    false,
                                                );
                                            },
                                            value: undefined,
                                        }).parse(clue, "edge clue");
                                    }
                                },
                                negative: (negative) => {
                                    // TODO
                                },
                                overrideNegativeRatios: (overrideNegativeRatios) => {
                                    // TODO
                                },
                            }).parse(constraint, "difference");
                            break;
                        case ConstraintType.Ratio:
                            new ObjectParser<RatioConstraintConfig>({
                                type: undefined,
                                clues: (clues) => {
                                    for (const clue of clues) {
                                        new ObjectParser<EdgeClue<number>>({
                                            edge: (edgeId, {value}) => {
                                                importer.addBlackKropki(
                                                    this,
                                                    ...this.parseEdgeId(edgeId),
                                                    value,
                                                    false,
                                                );
                                            },
                                            value: undefined,
                                        }).parse(clue, "edge clue");
                                    }
                                },
                                negative: (negative) => {
                                    // TODO
                                },
                                overrideNegativeDifferences: (overrideNegativeDifferences) => {
                                    // TODO
                                },
                            }).parse(constraint, "ratio");
                            break;
                        case ConstraintType.XV:
                            new ObjectParser<XVConstraintConfig>({
                                type: undefined,
                                clues: (clues) => {
                                    for (const clue of clues) {
                                        new ObjectParser<EdgeClue<number>>({
                                            edge: (edgeId, {value}) => {
                                                switch (value) {
                                                    case 5:
                                                        importer.addV(this, ...this.parseEdgeId(edgeId));
                                                        break;
                                                    case 10:
                                                        importer.addX(this, ...this.parseEdgeId(edgeId));
                                                        break;
                                                    default:
                                                        console.warn("Unsupported XV value", value);
                                                        break;
                                                }
                                            },
                                            value: undefined,
                                        }).parse(clue, "edge clue");
                                    }
                                },
                                negative: (negative) => {
                                    // TODO
                                },
                            }).parse(constraint, "xv");
                            break;
                        case ConstraintType.Thermometer:
                            new ObjectParser<ThermometerConstraintConfig>({
                                type: undefined,
                                thermometers: (
                                    thermometers,
                                    {
                                        // TODO
                                        slow,
                                        style: {
                                            color,
                                            thickness,
                                            // TODO
                                            bulbRadius,
                                        },
                                    }
                                ) => {
                                    for (const cells of thermometers) {
                                        importer.addThermometer(this, this.parseCellIds(cells), color, thickness);
                                    }
                                },
                                slow: undefined,
                                style: (style) => {
                                    new ObjectParser<ThermometerStyle>({
                                        color: undefined,
                                        thickness: undefined,
                                        bulbRadius: undefined,
                                    }).parse(style, "thermometer style");
                                },
                            }).parse(constraint, "thermometer");
                            break;
                        case ConstraintType.KillerCages:
                            new ObjectParser<KillerCagesConstraintConfig>({
                                type: undefined,
                                cages: (
                                    cages,
                                    {
                                        style: {
                                            cage: {color: lineColor},
                                            text: {color: fontColor},
                                        },
                                    }
                                ) => {
                                    for (const cage of cages) {
                                        new ObjectParser<Cage<number>>({
                                            cells: (cells, {value}) => {
                                                importer.addKillerCage(
                                                    this,
                                                    this.parseCellIds(cells),
                                                    value || undefined,
                                                    lineColor,
                                                    fontColor,
                                                );
                                            },
                                            value: undefined,
                                        }).parse(cage, "killer cage item");
                                    }
                                },
                                style: cageStyleValidator.bind("killer cage style"),
                            }).parse(constraint, "killer cage");
                            break;
                        case ConstraintType.Clone:
                            new ObjectParser<CloneConstraintConfig>({
                                type: undefined,
                                groups: (clones, {style: {color}}) => {
                                    for (const cells of clones) {
                                        if (cells.length === 2) {
                                            importer.addClones(this, this.parseCellIds(cells), color);
                                        }
                                    }
                                },
                                style: colorStyleValidator.bind("clone style"),
                            }).parse(constraint, "clone");
                            break;
                        case ConstraintType.Quadruple:
                            new ObjectParser<QuadrupleConstraintConfig>({
                                type: undefined,
                                clues: (
                                    quadruples,
                                    // TODO
                                    {style: {singleLine}}
                                ) => {
                                    for (const quadruple of quadruples) {
                                        new ObjectParser<QuadrupleClue>({
                                            corner: (cornerId, {digits}) => {
                                                importer.addQuadruple(this, this.parseCornerId(cornerId), digits);
                                            },
                                            digits: undefined,
                                        }).parse(quadruple, "quadruple");
                                    }
                                },
                                style: (style) => {
                                    new ObjectParser({
                                        singleLine: undefined,
                                    }).parse(style, "quadruple style");
                                },
                            }).parse(constraint, "quadruple");
                            break;
                        case ConstraintType.LookAndSayCages:
                            new ObjectParser<LookAndSayCagesConstraintConfig>({
                                type: undefined,
                                cages: (
                                    cages,
                                    {
                                        style: {
                                            cage: {color: lineColor},
                                            text: {color: textColor},
                                        },
                                    }
                                ) => {
                                    for (const cage of cages) {
                                        new ObjectParser<Cage>({
                                            cells: (cells, {value}) => {
                                                // TODO: implement look and say cage
                                                importer.addCosmeticCage(
                                                    this,
                                                    this.parseCellIds(cells),
                                                    value,
                                                    lineColor,
                                                    textColor,
                                                );
                                            },
                                            value: undefined,
                                        }).parse(cage);
                                    }
                                },
                                style: cageStyleValidator.bind("look and say cage style"),
                            }).parse(constraint, "look and say cage");
                            break;
                        case ConstraintType.DifferentValues:
                            new ObjectParser<DifferentValuesConstraintConfig>({
                                type: undefined,
                                cells: (
                                    cells ,
                                    // TODO
                                    {style: {color, offset}}
                                ) => {
                                    importer.addExtraRegion(this, this.parseCellIds(cells));
                                },
                                style: (style) => {
                                    new ObjectParser({
                                        color: undefined,
                                        offset: undefined
                                    }).parse(style, "extra region style");
                                },
                            }).parse(constraint, "extra region");
                            break;
                        case ConstraintType.Renban:
                            this.addSimpleLineConstraint(importer, constraint, RenbanConstraint);
                            break;
                        case ConstraintType.Whisper:
                            this.addSimpleLineConstraint(
                                importer,
                                constraint,
                                (cells, split, color, thickness) => WhispersConstraint(
                                    cells,
                                    split,
                                    constraint.minDifference,
                                    color,
                                    thickness,
                                ),
                                {minDifference: undefined}
                            );
                            break;
                        case ConstraintType.Palindrome:
                            this.addSimpleLineConstraint(importer, constraint, PalindromeConstraint);
                            break;
                        case ConstraintType.BetweenLines:
                            new ObjectParser<BetweenLinesConstraintConfig>({
                                type: undefined,
                                lines: (
                                    lines,
                                    // TODO
                                    {style: {lines: {color, thickness}, endPoints: {size, fill, stroke}}}
                                ) => {
                                    for (const cells of lines) {
                                        importer.addBetweenLine(this, this.parseCellIds(cells), color, thickness);
                                    }
                                },
                                style: lineWithEndpointsValidator.bind("between line style"),
                            }).parse(constraint, "between line");
                            break;
                        case ConstraintType.RegionSumLine:
                            this.addSimpleLineConstraint(
                                importer,
                                constraint,
                                RegionSumLineConstraint,
                                // TODO
                                {singleRegionTotals: undefined},
                            );
                            break;
                        case ConstraintType.Sequence:
                            this.addSimpleLineConstraint(
                                importer,
                                constraint,
                                // TODO
                                (cells, split, color, thickness) => LineConstraint(
                                    cells,
                                    color,
                                    thickness,
                                    split,
                                ),
                            );
                            break;
                        case ConstraintType.EntropyLines:
                            this.addSimpleLineConstraint(
                                importer,
                                constraint,
                                // TODO
                                (cells, split, color, thickness) => LineConstraint(
                                    cells,
                                    color,
                                    thickness,
                                    split,
                                ),
                                // TODO
                                {groups: undefined},
                            );
                            break;
                        case ConstraintType.LockoutLines:
                            new ObjectParser<LockoutLineConstraintConfig>({
                                type: undefined,
                                lines: (
                                    lines,
                                    // TODO
                                    {style: {lines: {color, thickness}, endPoints: {size, fill, stroke}}}
                                ) => {
                                    for (const cells of lines) {
                                        importer.addLockoutLine(this, this.parseCellIds(cells), color, thickness);
                                    }
                                },
                                style: lineWithEndpointsValidator.bind("lockout line style"),
                            }).parse(constraint, "lockout line");
                            break;
                        case ConstraintType.Arrow:
                            new ObjectParser<ArrowConstraintConfig>({
                                type: undefined,
                                bulbsWithArrows: (
                                    bulbsWithArrow,
                                    // TODO
                                    {style: {bulb: bulbStyle, arrow: {color, thickness, headSize}}}
                                ) => {
                                    for (const bulbWithArrow of bulbsWithArrow) {
                                        new ObjectParser<BulbWithArrows>({
                                            bulbCells: undefined,
                                            arrows: (arrows, {bulbCells}) => {
                                                for (const arrowCells of arrows) {
                                                    if (arrowCells.length) {
                                                        importer.addArrow(
                                                            this,
                                                            this.parseCellIds(bulbCells),
                                                            this.parseCellIds(arrowCells),
                                                        );
                                                    }
                                                }
                                            },
                                        }).parse(bulbWithArrow, "bulb with arrow");
                                    }
                                },
                                style: (style) => {
                                    new ObjectParser({
                                        arrow: (arrowStyle: ArrowStyle) => {
                                            new ObjectParser<ArrowStyle>({
                                                color: undefined,
                                                thickness: undefined,
                                                headSize: undefined,
                                            }).parse(arrowStyle, "arrow line style");
                                        },
                                        bulb: basicShapeStyleValidator.bind("arrow circle style"),
                                    }).parse(style, "arrow style");
                                },
                            }).parse(constraint, "arrow");
                            break;
                        case ConstraintType.DoubleArrow:
                            new ObjectParser<DoubleArrowConstraintConfig>({
                                type: undefined,
                                lines: (
                                    lines,
                                    // TODO
                                    {style: {lines: {color, thickness}, endPoints: {size, fill, stroke}}}
                                ) => {
                                    for (const cells of lines) {
                                        importer.addDoubleArrowLine(this, this.parseCellIds(cells), color, thickness);
                                    }
                                },
                                style: lineWithEndpointsValidator.bind("double arrow line style"),
                            }).parse(constraint, "double arrow line");
                            break;
                        case ConstraintType.LittleKillers:
                            new ObjectParser<LittleKillersConstraintConfig>({
                                type: undefined,
                                clues: (
                                    clues,
                                    {style: {text: {color: textColor}, arrow: {color: arrowColor}}}
                                ) => {
                                    for (const clue of clues) {
                                        importer.addMargin();

                                        new ObjectParser<LittleKiller>({
                                            outerCell: (outerCellId, {value, diagonal}) => {
                                                const outerCell = this.parseOuterCellId(outerCellId);
                                                importer.addLittleKiller(
                                                    this,
                                                    outerCell,
                                                    parseDiagonalType(diagonal),
                                                    value,
                                                    textColor,
                                                    arrowColor,
                                                );
                                            },
                                            value: undefined,
                                            diagonal: undefined,
                                        }).parse(clue, "little killer");
                                    }
                                },
                                style: (style) => {
                                    new ObjectParser({
                                        text: colorStyleValidator.bind("text style"),
                                        arrow: colorStyleValidator.bind("arrow style"),
                                    }).parse(style, "little killer style");
                                },
                            }).parse(constraint, "little killers");
                            break;
                        case ConstraintType.SandwichSums:
                            this.addSimpleOutsideClueConstraint(importer, constraint, SandwichSumConstraint);
                            break;
                        case ConstraintType.XSums:
                            this.addSimpleOutsideClueConstraint(importer, constraint, XSumConstraint);
                            break;
                        case ConstraintType.Skyscrapers:
                            this.addSimpleOutsideClueConstraint(importer, constraint, SkyscraperConstraint);
                            break;
                        case ConstraintType.NumberedRooms:
                            this.addSimpleOutsideClueConstraint(importer, constraint, NumberedRoomConstraint);
                            break;
                        case ConstraintType.RowIndexer:
                            new ObjectParser<RowIndexerConstraintConfig>({
                                type: undefined,
                                cells: (cells, {style: {color}}) => {
                                    for (const cellId of cells) {
                                        importer.addRowIndexer(this, this.parseCellId(cellId), color);
                                    }
                                },
                                style: colorStyleValidator.bind("row indexer style"),
                            }).parse(constraint, "row indexer");
                            break;
                        case ConstraintType.ColumnIndexer:
                            new ObjectParser<ColumnIndexerConstraintConfig>({
                                type: undefined,
                                cells: (cells, {style: {color}}) => {
                                    for (const cellId of cells) {
                                        importer.addColumnIndexer(this, this.parseCellId(cellId), color);
                                    }
                                },
                                style: colorStyleValidator.bind("column indexer style"),
                            }).parse(constraint, "column indexer");
                            break;
                        case ConstraintType.Custom:
                            new ObjectParser<CustomConstraintConfig>({
                                type: undefined,
                                definition: (definition, {style, input}) => {
                                    // TODO
                                },
                                style: undefined,
                                input: undefined,
                            }).parse(constraint, "custom constraint");
                            break;
                        case ConstraintType.CosmeticLine:
                            new ObjectParser<CosmeticLineConstraintConfig>({
                                type: undefined,
                                lines: (lines, {style: {color, thickness, layer}}) => {
                                    for (const line of lines) {
                                        importer.addCosmeticLine(
                                            this,
                                            line.map(({x, y}) => ({
                                                top: y - 0.5,
                                                left: x - 0.5,
                                            })),
                                            color,
                                            thickness,
                                        );
                                    }
                                },
                                style: (style) => {
                                    new ObjectParser<CosmeticLineStyle>({
                                        color: undefined,
                                        thickness: undefined,
                                        layer: undefined,
                                    }).parse(style, "cosmetic line style");
                                },
                            }).parse(constraint, "cosmetic line");
                            break;
                        case ConstraintType.CosmeticCage:
                            new ObjectParser<CosmeticCageConstraintConfig>({
                                type: undefined,
                                cages: (cages, {style: {cage: {color: cageColor}, text: {color: fontColor}}}) => {
                                    for (const cage of cages) {
                                        new ObjectParser<Cage>({
                                            cells: (cells, {value}) => {
                                                importer.addCosmeticCage(
                                                    this,
                                                    this.parseCellIds(cells),
                                                    value,
                                                    cageColor,
                                                    fontColor,
                                                );
                                            },
                                            value: undefined,
                                        }).parse(cage, "cosmetic cage");
                                    }
                                },
                                style: cageStyleValidator.bind("cosmetic cages style"),
                            }).parse(constraint, "cosmetic cages");
                            break;
                        case ConstraintType.CosmeticSymbol:
                            const baseSymbolValidator = {
                                type: undefined,
                                angle: undefined,
                                fill: undefined,
                                stroke: undefined,
                                strokeWidth: undefined,
                            };
                            const addCosmeticSymbol = (x: number, y: number, params: SymbolParams, layer?: SudokuLayer) => {
                                const cell = {
                                    top: y - 0.5,
                                    left: x - 0.5,
                                };

                                switch (params.type) {
                                    case SymbolType.Ellipse:
                                        new ObjectParser<EllipseSymbolParams>({
                                            ...baseSymbolValidator,
                                            rx: (rx, {ry, fill, stroke, strokeWidth, angle}) => {
                                                importer.addCosmeticCircle(
                                                    this,
                                                    [cell],
                                                    rx * 2,
                                                    ry * 2,
                                                    fill,
                                                    stroke,
                                                    undefined,
                                                    undefined,
                                                    angle,
                                                    // TODO: layer
                                                );
                                            },
                                            ry: undefined,
                                        }).parse(params, "ellipse");
                                        break;
                                    case SymbolType.Rectangle:
                                        new ObjectParser<RectangleSymbolParams>({
                                            ...baseSymbolValidator,
                                            width: (width, {height, fill, stroke, strokeWidth, angle}) => {
                                                importer.addCosmeticRect(
                                                    this,
                                                    [cell],
                                                    width,
                                                    height,
                                                    fill,
                                                    stroke,
                                                    undefined,
                                                    undefined,
                                                    angle,
                                                    // TODO: layer
                                                );
                                            },
                                            height: undefined,
                                        }).parse(params, "rectangle");
                                        break;
                                    case SymbolType.Text:
                                        new ObjectParser<TextSymbolParams>({
                                            ...baseSymbolValidator,
                                            text: (text, {size, fill, angle}) => {
                                                importer.addCosmeticText(
                                                    this,
                                                    [cell],
                                                    text,
                                                    fill,
                                                    size,
                                                    angle,
                                                    // TODO: layer
                                                );
                                            },
                                            size: undefined,
                                        }).parse(params, "text");
                                        break;
                                    case SymbolType.Arrow:
                                        new ObjectParser<ArrowSymbolParams>({
                                            ...baseSymbolValidator,
                                            length: (length, {headSize, fill, stroke, strokeWidth, angle}) => {
                                                // TODO
                                            },
                                            headSize: undefined,
                                        }).parse(params, "decorative arrow");
                                        break;
                                    default:
                                        console.warn("Unrecognized SudokuMaker cosmetic symbol type", (params as any).type);
                                        break;
                                }
                                // TODO
                            };

                            if ("params" in constraint) {
                                new ObjectParser<CompressedCosmeticConfig>({
                                    type: undefined,
                                    symbols: (items, {params: paramsArray}) => {
                                        for (const [x, y, paramsIndex = 0, layer] of items) {
                                            addCosmeticSymbol(x, y, paramsArray[paramsIndex], layer);
                                        }
                                    },
                                    params: undefined,
                                }).parse(constraint, "cosmetic symbols");
                            } else {
                                new ObjectParser<CosmeticSymbolConstraintConfig>({
                                    type: undefined,
                                    symbols: (items) => {
                                        for (const item of items) {
                                            new ObjectParser<CosmeticSymbol>({
                                                params: (params, {position: {x, y}, layer}) => {
                                                    addCosmeticSymbol(x, y, params, layer);
                                                },
                                                position: undefined,
                                                layer: undefined,
                                            }).parse(item, "cosmetic symbol");
                                        }
                                    },
                                }).parse(constraint, "cosmetic symbols");
                            }
                            break;
                        case ConstraintType.SudokuRules:
                            // TODO
                            break;
                        default:
                            console.warn("Unrecognized SudokuMaker constraint type", (constraint as any).type);
                            break;
                    }
                }
            },
            name: (title) => importer.setTitle(title),
            author: (author) => importer.setAuthor(author),
            comment: (ruleset) => importer.setRuleset(ruleset),
        }).parse(this.puzzleJson, "SudokuMaker data");
    }

    private addSimpleLineConstraint<ConstraintT extends (LineConstraintConfigBase & {type: ConstraintType})>(
        importer: PuzzleImporter<T>,
        constraint: ConstraintT,
        factory: (cells: Position[], split?: boolean, lineColor?: string, lineWidth?: number) => Constraint<T, any>,
        extraField = {} as ObjectParserFieldMap<Omit<ConstraintT, keyof LineConstraintConfigBase | "type">>
    ) {
        new ObjectParser({
            type: undefined,
            lines: (lines, {style}) => {
                for (const cells of lines) {
                    importer.addSimpleLineConstraint(
                        this,
                        this.parseCellIds(cells, false),
                        true,
                        factory,
                        style.color,
                        style.thickness,
                    );
                }
            },
            style: lineStyleValidator.bind("line style"),
            ...extraField,
        } as ObjectParserFieldMap<ConstraintT>).parse(constraint, "line");
    }
    addSimpleOutsideClueConstraint(
        importer: PuzzleImporter<T>,
        constraint: OutsideClueConstraintConfig,
        factory: (clueCell: Position, lineCells: Position[], value: number, color?: string) => Constraint<T, any>,
    ) {
        new ObjectParser<OutsideClueConstraintConfig>({
            type: undefined,
            clues: (
                clues: OutsideClueConstraintConfig["clues"],
                {style: {color}}: OutsideClueConstraintConfig
            ) => {
                for (const clue of clues) {
                    new ObjectParser<OuterClue<number | undefined>>({
                        outerCell: (outerCellId, {value, diagonal}) => {
                            if (value !== undefined) {
                                importer.addSimpleOutsideClue(
                                    this,
                                    this.parseOuterCellId(outerCellId),
                                    value,
                                    factory,
                                    color,
                                    parseDiagonalType(diagonal),
                                );
                            }
                        },
                        value: undefined,
                        diagonal: undefined,
                    }).parse(clue, "outside clue");
                }
            },
            style: outerClueStyleValidator.bind("outside clue style"),
        }).parse(constraint, "outside clue");
    }

    parseCellId(cellId: CellId, offset = false): Position {
        const result: Position = {
            top: Math.floor(cellId / this.size),
            left: cellId % this.size,
        };
        return offset ? this.offsetCoords(result) : result;
    }
    parseCellIds(cellIds: CellId[], offset = false) {
        return cellIds.map((cellId) => this.parseCellId(cellId, offset));
    }

    parseCornerId(cellId: CornerId): Position {
        return {
            top: Math.floor(cellId / (this.size + 1)),
            left: cellId % (this.size + 1),
        };
    }

    parseOuterCellId(cellId: OuterCellId): Position {
        return {
            top: Math.floor(cellId / (this.size + 2)) - 1,
            left: cellId % (this.size + 2) - 1,
        };
    }

    parseEdgeId(edgeId: EdgeId): [Position, Position] {
        const left = edgeId % this.size;
        const topPair = Math.floor(edgeId / this.size);
        const top = Math.floor(topPair / 2);
        return topPair % 2 === 0
            ? [
                {top, left},
                {top, left: left - 1},
            ]
            : [
                {top, left},
                {top: top + 1, left},
            ];
    }

    get hasSolution() {
        return this.puzzleJson.cells.some(
            (cell) => cell && !cell.given && cell.value !== undefined
        );
    }
    get hasFog() {
        return false;
    }
    get hasCosmeticElements() {
        return this.puzzleJson.constraints.some(
            ({type}) => [
                ConstraintType.CosmeticLine,
                ConstraintType.CosmeticCage,
                ConstraintType.CosmeticSymbol,
            ].includes(type)
        );
    }
    get hasArrows() {
        return this.puzzleJson.constraints.some(({type}) => type === ConstraintType.Arrow);
    }

    get quadruplePositions() {
        return this.puzzleJson.constraints.flatMap(
            (constraint) => constraint.type === ConstraintType.Quadruple
                ? constraint.clues.map(({corner}) => this.offsetCoords(this.parseCornerId(corner)))
                : []
        );
    }
}

type OutsideClueConstraintConfig = SandwichSumsConstraintConfig | XSumsConstraintConfig | SkyscrapersConstraintConfig | NumberedRoomsConstraintConfig;

const parseDiagonalType = (type: DiagonalType | undefined): OutsideClueLineDirectionType => {
    switch (type) {
        case DiagonalType.PositiveDiagonal: return OutsideClueLineDirectionType.positiveDiagonal;
        case DiagonalType.NegativeDiagonal: return OutsideClueLineDirectionType.negativeDiagonal;
        // undefined:
        default: return OutsideClueLineDirectionType.straight;
    }
}

const colorStyleValidator = new ObjectParser<{color: string}>({color: undefined});
const outerClueStyleValidator = colorStyleValidator;
const lineStyleValidator = new ObjectParser<LineStyle | Stroke>({
    color: undefined,
    thickness: undefined,
});
const basicShapeStyleValidator = new ObjectParser<BasicShapeStyle>({
    size: undefined,
    fill: undefined,
    stroke: lineStyleValidator.bind("stroke style")
});
const lineWithEndpointsValidator = new ObjectParser<LineWithEndPointsStyle>({
    lines: lineStyleValidator.bind("line style"),
    endPoints: basicShapeStyleValidator.bind("endpoints style"),
});
const cageStyleValidator = new ObjectParser<CageStyle>({
    cage: colorStyleValidator.bind("cage line style"),
    text: colorStyleValidator.bind("cage text style"),
});

export const SudokuMakerGridParserFactory = <T extends AnyPTM>(load: string, offsetX: number, offsetY: number) => {
    load = decodeURIComponent(load);
    const jsonStr = decompressFromEncodedURIComponent(load);
    if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
        throw new Error("Failed to decode");
    }
    const json = JSON.parse(jsonStr) as SudokuBlob;
    return new SudokuMakerGridParser<T>(json.puzzle, offsetX, offsetY);
};

export const SudokuMaker = getPuzzleImportLoader("sudokumaker", SudokuMakerGridParserFactory);

enum SudokuMakerColor {
    white = "#ffffff",
    red = "#ec6688",
    orange = "#f6ab76",
    yellow = "#fde967",
    green = "#d3f284",
    darkGreen = "#7dcb88",
    cyan = "#81e1f7",
    blue = "#8197e4",
    purple = "#b569cc",
    pink = "#f376ed",
}
const sudokuMakerColors = [
    SudokuMakerColor.white,
    SudokuMakerColor.red,
    SudokuMakerColor.orange,
    SudokuMakerColor.yellow,
    SudokuMakerColor.green,
    SudokuMakerColor.darkGreen,
    SudokuMakerColor.cyan,
    SudokuMakerColor.blue,
    SudokuMakerColor.purple,
    SudokuMakerColor.pink,
];
const sudokuMakerColorsMap: Record<SudokuMakerColor, CellColor> = {
    [SudokuMakerColor.white]: CellColor.white,
    [SudokuMakerColor.red]: CellColor.red,
    [SudokuMakerColor.orange]: CellColor.orange,
    [SudokuMakerColor.yellow]: CellColor.yellow,
    [SudokuMakerColor.green]: CellColor.green,
    [SudokuMakerColor.darkGreen]: CellColor.green,
    [SudokuMakerColor.cyan]: CellColor.blue,
    [SudokuMakerColor.blue]: CellColor.blue,
    [SudokuMakerColor.purple]: CellColor.purple,
    [SudokuMakerColor.pink]: CellColor.purple,
};
