import {ReactNode} from "react";
import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
    PuzzleDefinitionLoader
} from "../../types/sudoku/PuzzleDefinition";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {decompressFromBase64} from "lz-string";
import {sha1} from "hash.js";
import {indexes} from "../../utils/indexes";
import {
    parsePositionLiteral,
    Position,
    PositionLiteral,
    PositionSet,
    stringifyCellCoords
} from "../../types/layout/Position";
import {calculateDefaultRegionWidth, FieldSize} from "../../types/sudoku/FieldSize";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {GivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {CellColor, CellColorValue} from "../../types/sudoku/CellColor";
import {ObjectParser} from "../../types/struct/ObjectParser";
import {splitArrayIntoChunks} from "../../utils/array";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {
    getLittleKillerCellsByStartAndDirection,
    LittleKillerConstraintByCells
} from "../../components/sudoku/constraints/little-killer/LittleKiller";
import {
    DecorativeCageConstraint,
    KillerCageConstraint
} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {EvenConstraint} from "../../components/sudoku/constraints/even/Even";
import {OddConstraint} from "../../components/sudoku/constraints/odd/Odd";
import {LineConstraint} from "../../components/sudoku/constraints/line/Line";
import {RenbanConstraint} from "../../components/sudoku/constraints/renban/Renban";
import {GermanWhispersConstraint} from "../../components/sudoku/constraints/german-whispers/GermanWhispers";
import {PalindromeConstraint} from "../../components/sudoku/constraints/palindrome/Palindrome";
import {ArrowConstraint} from "../../components/sudoku/constraints/arrow/Arrow";
import {InBetweenLineConstraint} from "../../components/sudoku/constraints/in-between-line/InBetweenLine";
import {ThermometerConstraint} from "../../components/sudoku/constraints/thermometer/Thermometer";
import {AntiKnightConstraint} from "../../types/sudoku/constraints/AntiKnight";
import {
    NonConsecutiveNeighborsConstraint
} from "../../components/sudoku/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import {AntiKingConstraint} from "../../types/sudoku/constraints/AntiKing";
import {DisjointGroupsConstraint} from "../../types/sudoku/constraints/DisjointGroups";
import {
    NegativeDiagonalConstraint,
    PositiveDiagonalConstraint
} from "../../components/sudoku/constraints/main-diagonal/MainDiagonal";
import {QuadConstraint} from "../../components/sudoku/constraints/quad/Quad";
import {VMarkConstraint, XMarkConstraint} from "../../components/sudoku/constraints/xv/XV";
import {MaxConstraint, MinConstraint} from "../../components/sudoku/constraints/min-max/MinMax";
import {KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";
import {TextConstraint} from "../../components/sudoku/constraints/text/Text";
import {EllipseConstraint, RectConstraint} from "../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {SandwichSumConstraint} from "../../components/sudoku/constraints/sandwich-sum/SandwichSum";
import {CloneConstraint} from "../../components/sudoku/constraints/clone/Clone";
import {
    CenteredCalculatorDigitComponentType,
    RegularCalculatorDigitComponentType
} from "../../components/sudoku/digit/CalculatorDigit";
import {RegularDigitComponentType} from "../../components/sudoku/digit/RegularDigit";
import {
    FillableCalculatorDigitConstraint
} from "../../components/sudoku/constraints/fillable-calculator-digit/FillableCalculatorDigit";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";
import {LatinDigitSudokuTypeManager} from "../../sudokuTypes/latin/types/LatinDigitSudokuTypeManager";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";
import {CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {SafeCrackerSudokuTypeManager} from "../../sudokuTypes/safe-cracker/types/SafeCrackerSudokuTypeManager";
import {RotatableDigitSudokuTypeManager} from "../../sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";
import {FPuzzlesGridCell, FPuzzlesLittleKillerSum, FPuzzlesPuzzle, FPuzzlesText} from "fpuzzles-data";
import {InfiniteSudokuTypeManager} from "../../sudokuTypes/infinite-rings/types/InfiniteRingsSudokuTypeManager";
import {ParsedRulesHtml} from "../../components/sudoku/rules/ParsedRulesHtml";
import {TesseractSudokuTypeManager} from "../../sudokuTypes/tesseract/types/TesseractSudokuTypeManager";
import {YajilinFogSudokuTypeManager} from "../../sudokuTypes/yajilin-fog/types/YajilinFogSudokuTypeManager";
import {JigsawSudokuTypeManager} from "../../sudokuTypes/jigsaw/types/JigsawSudokuTypeManager";
import {
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType,
    sanitizeImportOptions
} from "../../types/sudoku/PuzzleImportOptions";
import {createEmptyContextForPuzzle} from "../../types/sudoku/PuzzleContext";
import {doesGridRegionContainCell} from "../../types/sudoku/GridRegion";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {JssSudokuTypeManager} from "../../sudokuTypes/jss/types/JssSudokuTypeManager";
import {isVisibleCell} from "../../types/sudoku/CellTypeProps";
import {SudokuCellsIndex} from "../../types/sudoku/SudokuCellsIndex";
import {RushHourSudokuTypeManager} from "../../sudokuTypes/rush-hour/types/RushHourSudokuTypeManager";
import {RotatableCluesSudokuTypeManager} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesSudokuTypeManager";
import {SokobanSudokuTypeManager} from "../../sudokuTypes/sokoban/types/SokobanSudokuTypeManager";
import {greenColor, purpleColor} from "../../components/app/globals";

export enum FPuzzleColor {
    white = "#FFFFFF",
    grey = "#A8A8A8",
    black = "#000000",
    red = "#FFA0A0",
    orange = "#FFE060",
    yellow = "#FFFFB0",
    lightGreen = "#B0FFB0",
    darkGreen = "#60D060",
    lightBlue = "#D0D0FF",
    darkBlue = "#8080F0",
    purple = "#FF80FF",
    pink = "#FFD0D0",
}

const fPuzzleColorsMap: Record<FPuzzleColor, CellColor> = {
    [FPuzzleColor.white]: CellColor.white,
    [FPuzzleColor.grey]: CellColor.darkGrey,
    [FPuzzleColor.black]: CellColor.black,
    [FPuzzleColor.red]: CellColor.red,
    [FPuzzleColor.orange]: CellColor.orange,
    [FPuzzleColor.yellow]: CellColor.yellow,
    [FPuzzleColor.lightGreen]: CellColor.green,
    [FPuzzleColor.darkGreen]: CellColor.green,
    [FPuzzleColor.lightBlue]: CellColor.blue,
    [FPuzzleColor.darkBlue]: CellColor.blue,
    [FPuzzleColor.purple]: CellColor.purple,
    [FPuzzleColor.pink]: CellColor.purple,
};

export const decodeFPuzzlesString = (load: string) => {
    load = decodeURIComponent(load);
    const jsonStr = decompressFromBase64(load);
    if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
        throw new Error("Failed to decode");
    }
    return JSON.parse(jsonStr) as FPuzzlesPuzzle;
};

const loadByImportOptions = (
    slug: string,
    importOptions: PuzzleImportOptions
): PuzzleDefinition<AnyPTM> => {
    let {
        load,
        offsetX: firstOffsetX = 0,
        offsetY: firstOffsetY = 0,
        extraGrids: extraGridLoad = {},
        type = PuzzleImportPuzzleType.Regular,
        digitType = PuzzleImportDigitType.Regular,
    } = importOptions;

    const puzzleJson = decodeFPuzzlesString(load);

    const extraGrids = (Array.isArray(extraGridLoad) ? extraGridLoad : Object.values(extraGridLoad))
        .map(({load, offsetX = 0, offsetY = 0}) => ({
            json: decodeFPuzzlesString(load),
            offsetX,
            offsetY,
        }));
    const allGrids = [
        {
            json: puzzleJson,
            offsetX: firstOffsetX,
            offsetY: firstOffsetY,
        },
        ...extraGrids,
    ];
    const columnsCount = Math.max(...allGrids.map(({offsetX, json: {size}}) => offsetX + size));
    const rowsCount = Math.max(...allGrids.map(({offsetY, json: {size}}) => offsetY + size));

    console.debug("Importing from f-puzzles:", ...allGrids);

    switch (type) {
        case PuzzleImportPuzzleType.Calculator:
            type = PuzzleImportPuzzleType.Regular;
            digitType = PuzzleImportDigitType.Calculator;
            break;
        case PuzzleImportPuzzleType.Latin:
            type = PuzzleImportPuzzleType.Regular;
            digitType = PuzzleImportDigitType.Latin;
            break;
    }

    const {
        digitsCount = puzzleJson.size,
        tesseract,
        yajilinFog,
        fillableDigitalDisplay,
        safeCrackerCodeLength = 6,
        visibleRingsCount = 2,
        startOffset = 0,
        jss,
        rotatableClues,
        sokoban,
    } = importOptions;

    const regularTypeManager = DigitSudokuTypeManager();
    const typesMap: Record<PuzzleImportPuzzleType, SudokuTypeManager<AnyPTM>> = {
        [PuzzleImportPuzzleType.Regular]: regularTypeManager,
        [PuzzleImportPuzzleType.Latin]: regularTypeManager,
        [PuzzleImportPuzzleType.Calculator]: regularTypeManager,
        [PuzzleImportPuzzleType.Cubedoku]: CubedokuTypeManager,
        [PuzzleImportPuzzleType.Rotatable]: RotatableDigitSudokuTypeManager,
        [PuzzleImportPuzzleType.SafeCracker]: SafeCrackerSudokuTypeManager({
            size: digitsCount,
            circleRegionsCount: Math.ceil((puzzleJson.size - 2) / 2),
            codeCellsCount: Math.min(puzzleJson.size, safeCrackerCodeLength),
        }),
        [PuzzleImportPuzzleType.InfiniteRings]: InfiniteSudokuTypeManager(
            regularTypeManager,
            visibleRingsCount,
            startOffset,
        ),
        [PuzzleImportPuzzleType.Jigsaw]: JigsawSudokuTypeManager(importOptions),
        [PuzzleImportPuzzleType.RushHour]: RushHourSudokuTypeManager,
    };

    let typeManager = typesMap[type] ?? regularTypeManager;
    if (sokoban) {
        typeManager = SokobanSudokuTypeManager;
    }
    if (tesseract) {
        typeManager = TesseractSudokuTypeManager(typeManager);
    }
    if (yajilinFog) {
        typeManager = YajilinFogSudokuTypeManager(typeManager);
    }
    if (jss) {
        typeManager = JssSudokuTypeManager(typeManager);
    }
    if (rotatableClues) {
        typeManager = RotatableCluesSudokuTypeManager(typeManager);
    }

    switch (digitType) {
        case PuzzleImportDigitType.Regular:
            typeManager = {
                ...typeManager,
                digitComponentType: RegularDigitComponentType(),
            };
            break;
        case PuzzleImportDigitType.Calculator:
            typeManager = {
                ...typeManager,
                digitComponentType: fillableDigitalDisplay
                    ? RegularCalculatorDigitComponentType()
                    : CenteredCalculatorDigitComponentType(),
            };
            break;
        case PuzzleImportDigitType.Latin:
            typeManager = LatinDigitSudokuTypeManager(typeManager);
            break;
    }

    const importer = new FPuzzlesImporter(slug, importOptions, typeManager, {
        fieldSize: Math.max(rowsCount, columnsCount),
        rowsCount,
        columnsCount,
    });
    for (const {json, offsetX, offsetY} of allGrids) {
        importer.addGrid(json, offsetX, offsetY);
    }
    return importer.finalize();
};

class FPuzzlesImporter<T extends AnyPTM> {
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
            importOptions,
            resultChecker: noSpecialRules ? isValidFinishedPuzzleByConstraints : undefined,
        };

        this.inactiveCells = new PositionSet(indexes(fieldSize.rowsCount).flatMap(
            (top) => indexes(fieldSize.columnsCount).map((left) => ({top, left}))
        ));
    }

    addGrid(puzzleJson: FPuzzlesPuzzle, offsetX: number, offsetY: number) {
        const {
            htmlRules,
            fillableDigitalDisplay,
            transparentArrowCircle = false,
            "product-arrow": productArrow,
            cosmeticsBehindFog,
        } = this.importOptions;

        const offsetCoords = (position: PositionLiteral): Position => {
            const {top, left} = parsePositionLiteral(position);
            return {
                top: top + offsetY,
                left: left + offsetX,
            };
        };
        const offsetCoordsArray = (positions: PositionLiteral[]) => positions.map(offsetCoords);

        this.inactiveCells = this.inactiveCells.bulkRemove(offsetCoordsArray(indexes(puzzleJson.size).flatMap(
            (top) => indexes(puzzleJson.size).map((left) => ({top, left}))
        )));

        const processInitialColors = (colors: CellColorValue[], forceMapping: boolean) => forceMapping || this.typeManager.mapImportedColors
            ? colors.map((color) => fPuzzleColorsMap[color as string as FPuzzleColor] ?? color)
            : colors;

        const parseOptionalNumber = (value?: string | number) => value === undefined ? undefined : Number(value);

        const checkForOutsideCells = (cells: Position[]) => {
            const margin = Math.max(0, ...cells.flatMap(({top, left}) => [
                -top,
                -left,
                top + 1 - this.puzzle.fieldSize.rowsCount,
                left + 1 - this.puzzle.fieldSize.columnsCount,
            ]));

            if (margin > 0) {
                this.puzzle.fieldMargin = Math.max(this.puzzle.fieldMargin || 0, margin);
            }
        };

        const isFowText = ({cells, value}: FPuzzlesText) => value === "💡"
            && cells.length === 1
            && puzzleJson.fogofwar?.includes(cells[0]);

        const cosmeticsLayer = cosmeticsBehindFog ? FieldLayer.regular : FieldLayer.afterLines;

        const isVisibleGridCell = (cell: Position) => isVisibleCell(this.typeManager.getCellTypeProps?.(cell, this.puzzle));

        // TODO: go over rangsk solver and populate constraints from there
        new ObjectParser<FPuzzlesPuzzle>({
            // region Core fields
            size: undefined,
            grid: (grid, {size}) => {
                const defaultRegionWidth = calculateDefaultRegionWidth(size);
                const defaultRegionHeight = size / defaultRegionWidth;
                const defaultRegionColumnsCount = size / defaultRegionWidth;

                const allGridCells: (FPuzzlesGridCell & Position)[] = grid
                    .flatMap(
                        (row, top) => row.map(
                            (cell, left) => ({...offsetCoords({top, left}), ...cell})
                        )
                    );
                const validGridCells = allGridCells.filter(isVisibleGridCell);

                const emptyContext = createEmptyContextForPuzzle(this.puzzle);
                const faces = this.typeManager.getRegionsWithSameCoordsTransformation?.(emptyContext, true) ?? [{
                    top: offsetY,
                    left: offsetX,
                    width: size,
                    height: size,
                }];
                const regions = faces.flatMap(face => {
                    const validFaceCells = validGridCells.filter((cell) => doesGridRegionContainCell(face, cell));

                    return indexes(size)
                        .map(regionIndex => validFaceCells.filter(
                            ({top, left, region}) => {
                                if (region === undefined) {
                                    const topIndex = Math.floor((top - offsetY) / defaultRegionHeight);
                                    const leftIndex = Math.floor((left - offsetX) / defaultRegionWidth);
                                    region = leftIndex + topIndex * defaultRegionColumnsCount;
                                }

                                return region === regionIndex;
                            }
                        ))
                        .filter(({length}) => length);
                });
                if (regions.length > 1) {
                    this.regions.push(...regions);
                }

                for (const {top, left, ...cell} of allGridCells) {
                    new ObjectParser<FPuzzlesGridCell>({
                        region: undefined,
                        value: (value, {given}) => {
                            if (!given) {
                                return;
                            }
                            switch (typeof value) {
                                case "number":
                                    if (fillableDigitalDisplay) {
                                        // TODO: extract to a type manager
                                        this.items.push(FillableCalculatorDigitConstraint({top, left}, value));
                                    } else {
                                        this.initialDigits[top] = this.initialDigits[top] || {};
                                        this.initialDigits[top][left] = this.typeManager.createCellDataByImportedDigit(value);
                                    }
                                    break;
                                case "string":
                                    this.initialLetters[top] = this.initialLetters[top] || {};
                                    this.initialLetters[top][left] = value;
                                    break;
                            }
                        },
                        given: undefined,
                        c: (color) => {
                            if (typeof color === "string") {
                                this.initialColors[top] = this.initialColors[top] || {};
                                this.initialColors[top][left] = processInitialColors([color], false);
                            }
                        },
                        cArray: (colors) => {
                            if (Array.isArray(colors) && colors.length) {
                                this.initialColors[top] = this.initialColors[top] || {};
                                this.initialColors[top][left] = processInitialColors(colors, false);
                            }
                        },
                        highlight: (color) => {
                            if (typeof color === "string") {
                                this.solutionColors[top] = this.solutionColors[top] || {};
                                this.solutionColors[top][left] = processInitialColors([color], true);
                            }
                        },
                        highlightArray: (colors) => {
                            if (Array.isArray(colors) && colors.length) {
                                this.solutionColors[top] = this.solutionColors[top] || {};
                                this.solutionColors[top][left] = processInitialColors(colors, true);
                            }
                        },
                        givenPencilMarks: undefined,
                        centerPencilMarks: (value) => value === undefined || value === null,
                        cornerPencilMarks: (value) => value === undefined || value === null,
                    }).parse(cell, `f-puzzles cell ${stringifyCellCoords({top, left})}`);
                }
            },
            title: (title) => {
                if (title && !this.importedTitle) {
                    this.puzzle.title = {[LanguageCode.en]: title};
                    this.importedTitle = true;
                }
            },
            author: (author) => {
                if (author) {
                    this.puzzle.author = this.puzzle.author ?? {[LanguageCode.en]: author};
                }
            },
            ruleset: (ruleset) => {
                if (ruleset && !this.puzzle.rules) {
                    let parsedRules: ReactNode;
                    if (htmlRules) {
                        parsedRules = <ParsedRulesHtml>{ruleset}</ParsedRulesHtml>;
                    } else {
                        parsedRules = <>{ruleset.split("\n").map(
                            (line, index) => <RulesParagraph key={index}>{line || <span>&nbsp;</span>}</RulesParagraph>
                        )}</>;
                    }
                    this.puzzle.rules = () => parsedRules;
                }
            },
            // region Constraints
            littlekillersum: (littleKillerSum, {size}) => {
                if (littleKillerSum instanceof Array) {
                    this.puzzle.fieldMargin = this.puzzle.fieldMargin || 1;

                    const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size};

                    this.items.push(...littleKillerSum.map(({cell, cells: [startCell], direction, value, ...other}: FPuzzlesLittleKillerSum) => {
                        ObjectParser.empty.parse(other, "f-puzzles little killer sum");

                        return LittleKillerConstraintByCells<T>(
                            offsetCoordsArray(getLittleKillerCellsByStartAndDirection(startCell, direction, fieldSize)),
                            direction,
                            parseOptionalNumber(value)
                        );
                    }));
                }
            },
            arrow: (arrow) => {
                if (arrow instanceof Array) {
                    this.items.push(...arrow.flatMap(({cells, lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles arrow");

                        const visibleCells = offsetCoordsArray(cells).filter(isVisibleGridCell);

                        return lines.length
                            ? lines.map(([lineStart, ...line]) => ArrowConstraint<T>(
                                visibleCells,
                                offsetCoordsArray(line).filter(isVisibleGridCell),
                                transparentArrowCircle,
                                offsetCoords(lineStart),
                                !!productArrow,
                                false,
                            ))
                            : ArrowConstraint<T>(
                                visibleCells,
                                [],
                                transparentArrowCircle,
                                undefined,
                                !!productArrow,
                                false,
                            );
                    }));
                }
            },
            killercage: (cage) => {
                if (cage instanceof Array) {
                    this.items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles killer cage");

                        const visibleCells = offsetCoordsArray(cells).filter(isVisibleGridCell);

                        return KillerCageConstraint<T>(
                            visibleCells,
                            parseOptionalNumber(value),
                            false,
                            undefined,
                            outlineC,
                            fontC,
                        );
                    }));
                }
            },
            antiknight: (antiKnight) => {
                if (antiKnight) {
                    this.items.push(AntiKnightConstraint());
                }
            },
            antiking: (antiKing) => {
                if (antiKing) {
                    this.items.push(AntiKingConstraint());
                }
            },
            disjointgroups: (disjointGroups, {size}) => {
                if (disjointGroups) {
                    // TODO: support custom regions
                    const regionWidth = calculateDefaultRegionWidth(size);
                    const regionHeight = size / regionWidth;
                    // TODO: support grid offset
                    this.items.push(DisjointGroupsConstraint(regionWidth, regionHeight));
                }
            },
            nonconsecutive: (nonConsecutive) => {
                if (nonConsecutive) {
                    this.items.push(NonConsecutiveNeighborsConstraint());
                }
            },
            ratio: (ratio) => {
                if (ratio instanceof Array) {
                    this.items.push(...ratio.map(({cells, value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles ratio");

                        const [cell1, cell2] = offsetCoordsArray(cells)
                            .map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell);

                        return KropkiDotConstraint<T>(cell1, cell2, true, parseOptionalNumber(value));
                    }));
                }
            },
            difference: (difference) => {
                if (difference instanceof Array) {
                    this.items.push(...difference.map(({cells, value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles difference");

                        const [cell1, cell2] = offsetCoordsArray(cells)
                            .map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell);

                        return KropkiDotConstraint<T>(cell1, cell2, false, parseOptionalNumber(value));
                    }));
                }
            },
            xv: (xv) => {
                if (xv instanceof Array) {
                    this.items.push(...xv.flatMap(({cells, value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles XV");

                        const [cell1, cell2] = offsetCoordsArray(cells)
                            .map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell);

                        switch (value) {
                            case "X": return [XMarkConstraint<T>(cell1, cell2)];
                            case "V": return [VMarkConstraint<T>(cell1, cell2)];
                            default: return [];
                        }
                    }));
                }
            },
            thermometer: (thermometer) => {
                if (thermometer instanceof Array) {
                    this.items.push(...thermometer.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles thermometer");

                        return lines.map((cells) => ThermometerConstraint<T>(
                            offsetCoordsArray(cells).filter(isVisibleGridCell),
                            undefined,
                            false,
                        ));
                    }));
                }
            },
            sandwichsum: (sandwichsum, {size}) => {
                if (sandwichsum instanceof Array) {
                    this.puzzle.fieldMargin = this.puzzle.fieldMargin || 1;

                    const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size};

                    this.items.push(...sandwichsum.flatMap(({cell, value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles sandwich sum");

                        // TODO: support grid offset
                        return value ? [SandwichSumConstraint<T>(offsetCoords(cell), fieldSize, Number(value))] : [];
                    }));
                }
            },
            even: (even) => {
                if (even instanceof Array) {
                    this.items.push(...even.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles even cell");

                        return EvenConstraint<T>(offsetCoords(cell));
                    }));
                }
            },
            odd: (odd) => {
                if (odd instanceof Array) {
                    this.items.push(...odd.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles odd cell");

                        return OddConstraint<T>(offsetCoords(cell));
                    }));
                }
            },
            extraregion: (extraregion) => {
                if (extraregion instanceof Array) {
                    this.items.push(...extraregion.map(({cells, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles extra region");

                        const visibleCells = offsetCoordsArray(cells).filter(isVisibleGridCell);

                        return KillerCageConstraint<T>(visibleCells);
                    }));
                }
            },
            clone: (clone) => {
                if (clone instanceof Array) {
                    this.items.push(...clone.flatMap(({cells, cloneCells, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles clone");

                        const uniqueCells = new PositionSet([
                            ...offsetCoordsArray(cells),
                            ...offsetCoordsArray(cloneCells),
                        ].filter(isVisibleGridCell)).items;

                        return uniqueCells.length > 1 ? [CloneConstraint<T>(uniqueCells)] : [];
                    }));
                }
            },
            quadruple: (quadruple) => {
                if (quadruple instanceof Array) {
                    this.items.push(...quadruple.map(({cells, values, ...other}) => {

                        ObjectParser.empty.parse(other, "f-puzzles quadruple");

                        return QuadConstraint<T>(offsetCoordsArray(cells)[3], values.map(this.typeManager.createCellDataByImportedDigit));
                    }));
                }
            },
            betweenline: (betweenLine) => {
                if (betweenLine instanceof Array) {
                    this.items.push(...betweenLine.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles between line");

                        return lines.map((cells) => InBetweenLineConstraint<T>(
                            offsetCoordsArray(cells).filter(isVisibleGridCell),
                            false
                        ));
                    }));
                }
            },
            minimum: (minimum) => {
                if (minimum instanceof Array) {
                    this.items.push(...minimum.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles minimum");

                        return MinConstraint<T>(offsetCoords(cell));
                    }));
                }
            },
            maximum: (maximum) => {
                if (maximum instanceof Array) {
                    this.items.push(...maximum.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles maximum");

                        return MaxConstraint<T>(offsetCoords(cell));
                    }));
                }
            },
            palindrome: (palindrome) => {
                if (palindrome instanceof Array) {
                    this.items.push(...palindrome.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles palindrome");

                        return lines.map((cells) => PalindromeConstraint<T>(
                            offsetCoordsArray(cells).filter(isVisibleGridCell),
                            false,
                        ));
                    }));
                }
            },
            renban: (renban) => {
                if (renban instanceof Array) {
                    this.items.push(...renban.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles renban line");

                        // Don't display the line - it's represented by a line constraint with isNewConstraint
                        return lines.map((cells) => RenbanConstraint<T>(
                            offsetCoordsArray(cells).filter(isVisibleGridCell),
                            false,
                            false,
                        ));
                    }));
                }
            },
            whispers: (whispers) => {
                if (whispers instanceof Array) {
                    this.items.push(...whispers.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles German whispers line");

                        // Don't display the line - it's represented by a line constraint with isNewConstraint
                        return lines.map((cells) => GermanWhispersConstraint<T>(
                            offsetCoordsArray(cells).filter(isVisibleGridCell),
                            false,
                            false
                        ));
                    }));
                }
            },
            line: (lineData) => {
                if (lineData instanceof Array) {
                    for (const {lines, outlineC, width, isNewConstraint, fromConstraint, ...other} of lineData) {
                        ObjectParser.empty.parse(other, "f-puzzles line");

                        let color = outlineC;
                        switch (fromConstraint) {
                            case "Whispers":
                                color = greenColor;
                                break;
                            case "Renban":
                                color = purpleColor;
                                break;
                        }

                        this.items.push(...lines.map((cells) => {
                            const visibleCells = offsetCoordsArray(cells).filter(isVisibleGridCell);

                            checkForOutsideCells(visibleCells);

                            return LineConstraint<T>(
                                visibleCells,
                                color,
                                width === undefined ? undefined : width / 2,
                                false,
                            );
                        }));
                    }
                }
            },
            rectangle: (rectangle) => {
                if (rectangle instanceof Array) {
                    this.items.push(...rectangle.map(({cells: cellLiterals, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles rect");

                        const cells = offsetCoordsArray(cellLiterals);
                        checkForOutsideCells(cells);

                        return RectConstraint<T>(
                            cells.map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell),
                            {width, height},
                            baseC,
                            outlineC,
                            value,
                            fontC,
                            angle,
                            cosmeticsLayer
                        );
                    }));
                }
            },
            circle: (circle) => {
                if (circle instanceof Array) {
                    this.items.push(...circle.map(({cells: cellLiterals, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles circle");

                        const cells = offsetCoordsArray(cellLiterals);
                        checkForOutsideCells(cells);

                        return EllipseConstraint<T>(
                            cells.map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell),
                            {width, height},
                            baseC,
                            outlineC,
                            value,
                            fontC,
                            angle,
                            cosmeticsLayer
                        );
                    }));
                }
            },
            text: (text) => {
                if (text instanceof Array) {
                    if (puzzleJson.fogofwar) {
                        text = text.filter((obj) => !isFowText(obj));
                    }

                    this.items.push(...text.flatMap(({cells: cellLiterals, value, fontC, size, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles text");

                        if (!value) {
                            return [];
                        }

                        const cells = offsetCoordsArray(cellLiterals);
                        checkForOutsideCells(cells);

                        return [TextConstraint<T>(
                            cells.map(cell => this.typeManager.fixCellPosition?.(cell, this.puzzle) ?? cell),
                            value,
                            fontC,
                            size,
                            angle,
                            cosmeticsLayer,
                        )];
                    }));
                }
            },
            cage: (cage) => {
                if (cage instanceof Array) {
                    const metadata: Record<string, string> = {};

                    for (const {cells, value, outlineC, fontC, ...other} of cage) {
                        ObjectParser.empty.parse(other, "f-puzzles cage");

                        const visibleCells = offsetCoordsArray(cells).filter(isVisibleGridCell);

                        const match = value?.match(/^(.+?):\s*([\s\S]+)/m);
                        if (match) {
                            metadata[match[1]] = match[2];
                        } else {
                            this.items.push(DecorativeCageConstraint<T>(visibleCells, value?.toString(), false, undefined, outlineC, fontC));
                        }
                    }

                    new ObjectParser<Record<string, string>>({
                        msgcorrect: (message) => {
                            this.puzzle.successMessage = message;
                        },
                    }).parse(metadata, "metadata from f-puzzles cages")
                }
            },
            "diagonal+": (diagonal, {size}) => {
                if (diagonal) {
                    // TODO: support grid offset
                    this.items.push(PositiveDiagonalConstraint<T>(size));
                }
            },
            "diagonal-": (diagonal, {size}) => {
                if (diagonal) {
                    // TODO: support grid offset
                    this.items.push(NegativeDiagonalConstraint<T>(size));
                }
            },
            // endregion
            // endregion
            // region Extensions
            solution: (solution, {size}) => {
                if (solution instanceof Array) {
                    const puzzleSolution = this.puzzle.solution = this.puzzle.solution ?? {};
                    const solutionArray = splitArrayIntoChunks(
                        solution.map((value) => {
                            if (value?.toString() === ".") {
                                return undefined;
                            }
                            const num = Number(value);
                            return Number.isFinite(num) ? num : value;
                        }),
                        size
                    );
                    for (const [top, row] of solutionArray.entries()) {
                        const offsetTop = top + offsetY;
                        puzzleSolution[offsetTop] = puzzleSolution[offsetTop] ?? {};
                        for (const [left, value] of row.entries()) {
                            if (value !== undefined) {
                                puzzleSolution[offsetTop][left + offsetX] = value;
                            }
                        }
                    }
                }
            },
            disabledlogic: undefined,
            truecandidatesoptions: undefined,
            fogofwar: undefined,
            foglight: undefined,
            // endregion
        }).parse(puzzleJson, "f-puzzles data");

        if (puzzleJson.fogofwar || puzzleJson.foglight) {
            this.items.push(FogConstraint<T>(
                offsetCoordsArray(puzzleJson.fogofwar ?? []),
                offsetCoordsArray(puzzleJson.foglight ?? []),
                puzzleJson.text?.filter(isFowText)?.flatMap(text => offsetCoordsArray(text.cells)),
            ));

            this.puzzle.prioritizeSelection = true;
        }
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

export const FPuzzles: PuzzleDefinitionLoader<AnyPTM> = {
    noIndex: true,
    slug: "f-puzzles",
    loadPuzzle: (params) => {
        if (typeof params.load !== "string") {
            throw new Error("Missing parameter");
        }

        params = sanitizeImportOptions(params);

        return {
            ...loadByImportOptions("f-puzzles", params),
            saveStateKey: `f-puzzles-${sha1().update(JSON.stringify(params)).digest("hex").substring(0, 20)}`,
        };
    }
};
