import {ReactNode} from "react";
import {allDrawingModes, PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {decompressFromBase64} from "lz-string";
import {sha1} from "hash.js";
import {indexes} from "../../utils/indexes";
import {
    parsePositionLiterals,
    Position,
    PositionLiteral,
    PositionSet,
    stringifyCellCoords
} from "../../types/layout/Position";
import {calculateDefaultRegionWidth, FieldSize} from "../../types/sudoku/FieldSize";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {GivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {CellColorValue} from "../../types/sudoku/CellColor";
import {ObjectParser} from "../../types/struct/ObjectParser";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {splitArrayIntoChunks} from "../../utils/array";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {LittleKillerConstraint} from "../../components/sudoku/constraints/little-killer/LittleKiller";
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
import {HashSet} from "../../types/struct/Set";

export const decodeFPuzzlesString = (load: string) => {
    load = decodeURIComponent(load);
    const jsonStr = decompressFromBase64(load);
    if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
        throw new Error("Failed to decode");
    }
    return JSON.parse(jsonStr) as FPuzzlesPuzzle;
};

export enum FPuzzlesImportPuzzleType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
    Cubedoku = "cubedoku",
    Rotatable = "rotatable",
    SafeCracker = "safe-cracker",
    InfiniteRings = "infinite-rings",
}

export interface FPuzzlesImportOptions {
    load: string;
    type?: FPuzzlesImportPuzzleType;
    htmlRules?: boolean;
    tesseract?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    "product-arrow"?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
}

export const getSolutionGridByFPuzzlesObject = ({solution, size}: FPuzzlesPuzzle) => {
    return solution && splitArrayIntoChunks(solution, size);
};

export const loadByFPuzzlesObject = (
    puzzleJson: FPuzzlesPuzzle,
    slug: string,
    importOptions: Omit<FPuzzlesImportOptions, "load">
): PuzzleDefinition<any, any, any> => {
    const {
        type = FPuzzlesImportPuzzleType.Regular,
        tesseract,
        yajilinFog,
        fillableDigitalDisplay,
        safeCrackerCodeLength = 6,
        visibleRingsCount = 2,
        startOffset = 0,
    } = importOptions;

    const regularTypeManager = DigitSudokuTypeManager(
        fillableDigitalDisplay
            ? RegularCalculatorDigitComponentType
            : RegularDigitComponentType
    );
    const typesMap: Record<FPuzzlesImportPuzzleType, SudokuTypeManager<any, any, any>> = {
        [FPuzzlesImportPuzzleType.Regular]: regularTypeManager,
        [FPuzzlesImportPuzzleType.Latin]: LatinDigitSudokuTypeManager,
        [FPuzzlesImportPuzzleType.Calculator]: DigitSudokuTypeManager(CenteredCalculatorDigitComponentType),
        [FPuzzlesImportPuzzleType.Cubedoku]: CubedokuTypeManager,
        [FPuzzlesImportPuzzleType.Rotatable]: RotatableDigitSudokuTypeManager,
        [FPuzzlesImportPuzzleType.SafeCracker]: SafeCrackerSudokuTypeManager({
            size: puzzleJson.size,
            circleRegionsCount: Math.floor((puzzleJson.size - 1) / 2),
            codeCellsCount: Math.min(puzzleJson.size, Number(safeCrackerCodeLength)),
        }),
        [FPuzzlesImportPuzzleType.InfiniteRings]: InfiniteSudokuTypeManager(
            regularTypeManager,
            Number(visibleRingsCount),
            Number(startOffset),
        ),
    };

    let typeManager = typesMap[type] ?? regularTypeManager;
    if (tesseract) {
        typeManager = TesseractSudokuTypeManager(typeManager);
    }
    if (yajilinFog) {
        typeManager = YajilinFogSudokuTypeManager(typeManager);
    }

    return loadByFPuzzlesObjectAndTypeManager(puzzleJson, slug, importOptions, {...typeManager});
};

export const loadByFPuzzlesObjectAndTypeManager = <CellType, ExType, ProcessedExType>(
    puzzleJson: FPuzzlesPuzzle,
    slug: string,
    {
        htmlRules,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        "product-arrow": productArrow,
        cosmeticsBehindFog,
        allowOverrideColors = false,
    }: Omit<FPuzzlesImportOptions, "load">,
    typeManager: SudokuTypeManager<CellType, ExType, ProcessedExType>,
): PuzzleDefinition<CellType, ExType, ProcessedExType> => {
    const initialDigits: GivenDigitsMap<CellType> = {};
    const initialColors: GivenDigitsMap<CellColorValue[]> = {};
    const items: Constraint<CellType, any, ExType, ProcessedExType>[] = [];

    const puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType> = {
        noIndex: true,
        slug,
        title: {[LanguageCode.en]: "Untitled"},
        typeManager,
        fieldSize: {
            fieldSize: 9,
            rowsCount: 9,
            columnsCount: 9,
            regions: [],
        },
        loopHorizontally: loopX,
        loopVertically: loopY,
        fieldMargin: loopX || loopY ? 0.99 : 0,
        allowDrawing: allDrawingModes,
        initialDigits,
        initialColors,
        items,
        allowOverridingInitialColors: allowOverrideColors,
    };

    if (noSpecialRules && !puzzleJson.solution) {
        puzzle.resultChecker = isValidFinishedPuzzleByConstraints;
    }

    const parseOptionalNumber = (value?: string | number) => value === undefined ? undefined : Number(value);

    const checkForOutsideCells = (cellLiterals: PositionLiteral[], fieldSize: number) => {
        const margin = Math.max(0, ...parsePositionLiterals(cellLiterals).flatMap(({top, left}) => [
            -top,
            -left,
            top + 1 - fieldSize,
            left + 1 - fieldSize,
        ]));

        if (margin > 0) {
            puzzle.fieldMargin = Math.max(puzzle.fieldMargin || 0, margin);
        }
    };

    const isFowText = ({cells, value}: FPuzzlesText) => value === "💡"
        && cells.length === 1
        && puzzleJson.fogofwar?.includes(cells[0]);

    const cosmeticsLayer = cosmeticsBehindFog ? FieldLayer.regular : FieldLayer.lines;

    const isVisibleGridCell = (cell: Position) => typeManager.getCellTypeProps?.(cell, puzzle)?.isVisible !== false;

    // TODO: go over rangsk solver and populate constraints from there
    new ObjectParser<FPuzzlesPuzzle>({
        // region Core fields
        size: (size) => {
            puzzle.fieldSize = {...puzzle.fieldSize, fieldSize: size, rowsCount: size, columnsCount: size};
        },
        grid: (grid, {size}) => {
            const defaultRegionWidth = calculateDefaultRegionWidth(size);
            const defaultRegionHeight = size / defaultRegionWidth;
            const defaultRegionColumnsCount = size / defaultRegionWidth;

            const allGridCells: (FPuzzlesGridCell & Position)[] = grid
                .flatMap(
                    (row, top) => row.map(
                        (cell, left) => ({top, left, ...cell})
                    )
                );
            const validGridCells = allGridCells.filter(isVisibleGridCell);

            const faces = typeManager.getRegionsWithSameCoordsTransformation?.(puzzle, 1) ?? [{
                top: 0,
                left: 0,
                width: size,
                height: size,
            }];
            const regions = faces.flatMap(face => {
                const validFaceCells = validGridCells.filter(
                    ({top, left}) => top >= face.top && left >= face.left && top < face.top + face.height && left < face.left + face.width
                );

                return indexes(size)
                    .map(regionIndex => validFaceCells.filter(
                        ({top, left, region}) => {
                            if (region === undefined) {
                                const topIndex = Math.floor(top / defaultRegionHeight);
                                const leftIndex = Math.floor(left / defaultRegionWidth);
                                region = leftIndex + topIndex * defaultRegionColumnsCount;
                            }

                            return region === regionIndex;
                        }
                    ))
                    .filter(({length}) => length);
            });
            if (regions.length > 1) {
                puzzle.fieldSize.regions = regions;
            }

            for (const {top, left, ...cell} of allGridCells) {
                new ObjectParser<FPuzzlesGridCell>({
                    region: undefined,
                    value: (value, {given}) => {
                        if (typeof value === "number" && given) {
                            if (fillableDigitalDisplay) {
                                items.push(FillableCalculatorDigitConstraint<CellType, ExType, ProcessedExType>({top, left}, value));
                            } else {
                                initialDigits[top] = initialDigits[top] || {};
                                initialDigits[top][left] = typeManager.createCellDataByImportedDigit(value);
                            }
                        }
                    },
                    given: undefined,
                    c: (color) => {
                        if (typeof color === "string") {
                            initialColors[top] = initialColors[top] || {};
                            initialColors[top][left] = [color];
                        }
                    },
                    cArray: (colors) => {
                        if (Array.isArray(colors) && colors.length) {
                            initialColors[top] = initialColors[top] || {};
                            initialColors[top][left] = colors;
                        }
                    },
                    highlight: undefined,
                    givenPencilMarks: undefined,
                    centerPencilMarks: (value) => value === undefined || value === null,
                    cornerPencilMarks: (value) => value === undefined || value === null,
                }).parse(cell, `f-puzzles cell ${stringifyCellCoords({top, left})}`);
            }
        },
        title: (title) => {
            if (title) {
                puzzle.title = {[LanguageCode.en]: title};
            }
        },
        author: (author) => {
            if (author) {
                puzzle.author = {[LanguageCode.en]: author};
            }
        },
        ruleset: (ruleset) => {
            if (ruleset) {
                let parsedRules: ReactNode;
                if (htmlRules) {
                    parsedRules = <ParsedRulesHtml>{ruleset}</ParsedRulesHtml>;
                } else {
                    parsedRules = <>{ruleset.split("\n").map(
                        (line, index) => <RulesParagraph key={index}>{line || <span>&nbsp;</span>}</RulesParagraph>
                    )}</>;
                }
                puzzle.rules = () => parsedRules;
            }
        },
        // region Constraints
        littlekillersum: (littleKillerSum, {size}) => {
            if (littleKillerSum instanceof Array) {
                puzzle.fieldMargin = puzzle.fieldMargin || 1;

                const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size, regions: []};

                items.push(...littleKillerSum.map(({cell, cells: [startCell], direction, value, ...other}: FPuzzlesLittleKillerSum) => {
                    ObjectParser.empty.parse(other, "f-puzzles little killer sum");

                    return LittleKillerConstraint<CellType, ExType, ProcessedExType>(startCell, direction, fieldSize, parseOptionalNumber(value));
                }));
            }
        },
        arrow: (arrow) => {
            if (arrow instanceof Array) {
                items.push(...arrow.flatMap(({cells, lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles arrow");

                    const visibleCells = parsePositionLiterals(cells).filter(isVisibleGridCell);

                    return lines.length
                        ? lines.map(([lineStart, ...line]) => ArrowConstraint<CellType, ExType, ProcessedExType>(
                            visibleCells,
                            parsePositionLiterals(line).filter(isVisibleGridCell),
                            false,
                            lineStart,
                            !!productArrow,
                            false,
                        ))
                        : ArrowConstraint<CellType, ExType, ProcessedExType>(
                            visibleCells,
                            [],
                            false,
                            undefined,
                            !!productArrow,
                            false,
                        );
                }));
            }
        },
        killercage: (cage) => {
            if (cage instanceof Array) {
                items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles killer cage");

                    const visibleCells = parsePositionLiterals(cells).filter(isVisibleGridCell);

                    return KillerCageConstraint<CellType, ExType, ProcessedExType>(
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
                items.push(AntiKnightConstraint());
            }
        },
        antiking: (antiKing) => {
            if (antiKing) {
                items.push(AntiKingConstraint());
            }
        },
        disjointgroups: (disjointGroups, {size}) => {
            if (disjointGroups) {
                // TODO: support custom regions
                const regionWidth = calculateDefaultRegionWidth(size);
                const regionHeight = size / regionWidth;
                items.push(DisjointGroupsConstraint(regionWidth, regionHeight));
            }
        },
        nonconsecutive: (nonConsecutive) => {
            if (nonConsecutive) {
                items.push(NonConsecutiveNeighborsConstraint());
            }
        },
        ratio: (ratio) => {
            if (ratio instanceof Array) {
                items.push(...ratio.map(({cells, value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles ratio");

                    const [cell1, cell2] = parsePositionLiterals(cells)
                        .map(cell => typeManager.fixCellPosition?.(cell, puzzle) ?? cell);

                    return KropkiDotConstraint<CellType, ExType, ProcessedExType>(cell1, cell2, true, parseOptionalNumber(value));
                }));
            }
        },
        difference: (difference) => {
            if (difference instanceof Array) {
                items.push(...difference.map(({cells, value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles difference");

                    const [cell1, cell2] = parsePositionLiterals(cells)
                        .map(cell => typeManager.fixCellPosition?.(cell, puzzle) ?? cell);

                    return KropkiDotConstraint<CellType, ExType, ProcessedExType>(cell1, cell2, false, parseOptionalNumber(value));
                }));
            }
        },
        xv: (xv) => {
            if (xv instanceof Array) {
                items.push(...xv.flatMap(({cells, value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles XV");

                    const [cell1, cell2] = parsePositionLiterals(cells)
                        .map(cell => typeManager.fixCellPosition?.(cell, puzzle) ?? cell);

                    switch (value) {
                        case "X": return [XMarkConstraint<CellType, ExType, ProcessedExType>(cell1, cell2)];
                        case "V": return [VMarkConstraint<CellType, ExType, ProcessedExType>(cell1, cell2)];
                        default: return [];
                    }
                }));
            }
        },
        thermometer: (thermometer) => {
            if (thermometer instanceof Array) {
                items.push(...thermometer.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles thermometer");

                    return lines.map((cells) => ThermometerConstraint<CellType, ExType, ProcessedExType>(
                        parsePositionLiterals(cells).filter(isVisibleGridCell),
                        undefined,
                        false,
                    ));
                }));
            }
        },
        sandwichsum: (sandwichsum, {size}) => {
            if (sandwichsum instanceof Array) {
                puzzle.fieldMargin = puzzle.fieldMargin || 1;

                const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size, regions: []};

                items.push(...sandwichsum.flatMap(({cell, value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles sandwich sum");

                    return value ? [SandwichSumConstraint<CellType, ExType, ProcessedExType>(cell, fieldSize, Number(value))] : [];
                }));
            }
        },
        even: (even) => {
            if (even instanceof Array) {
                items.push(...even.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles even cell");

                    return EvenConstraint<CellType, ExType, ProcessedExType>(cell);
                }));
            }
        },
        odd: (odd) => {
            if (odd instanceof Array) {
                items.push(...odd.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles odd cell");

                    return OddConstraint<CellType, ExType, ProcessedExType>(cell);
                }));
            }
        },
        extraregion: (extraregion) => {
            if (extraregion instanceof Array) {
                items.push(...extraregion.map(({cells, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles extra region");

                    const visibleCells = parsePositionLiterals(cells).filter(isVisibleGridCell);

                    return KillerCageConstraint<CellType, ExType, ProcessedExType>(visibleCells);
                }));
            }
        },
        clone: (clone) => {
            if (clone instanceof Array) {
                items.push(...clone.flatMap(({cells, cloneCells, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles clone");

                    const uniqueCells = new PositionSet([
                        ...parsePositionLiterals(cells),
                        ...parsePositionLiterals(cloneCells),
                    ].filter(isVisibleGridCell)).items;

                    return uniqueCells.length > 1 ? [CloneConstraint<CellType, ExType, ProcessedExType>(uniqueCells)] : [];
                }));
            }
        },
        quadruple: (quadruple) => {
            if (quadruple instanceof Array) {
                items.push(...quadruple.map(({cells, values, ...other}) => {

                    ObjectParser.empty.parse(other, "f-puzzles quadruple");

                    return QuadConstraint<CellType, ExType, ProcessedExType>(cells[3], values.map(typeManager.createCellDataByImportedDigit));
                }));
            }
        },
        betweenline: (betweenLine) => {
            if (betweenLine instanceof Array) {
                items.push(...betweenLine.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles between line");

                    return lines.map((cells) => InBetweenLineConstraint<CellType, ExType, ProcessedExType>(
                        parsePositionLiterals(cells).filter(isVisibleGridCell),
                        false
                    ));
                }));
            }
        },
        minimum: (minimum) => {
            if (minimum instanceof Array) {
                items.push(...minimum.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles minimum");

                    return MinConstraint<CellType, ExType, ProcessedExType>(cell);
                }));
            }
        },
        maximum: (maximum) => {
            if (maximum instanceof Array) {
                items.push(...maximum.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles maximum");

                    return MaxConstraint<CellType, ExType, ProcessedExType>(cell);
                }));
            }
        },
        palindrome: (palindrome) => {
            if (palindrome instanceof Array) {
                items.push(...palindrome.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles palindrome");

                    return lines.map((cells) => PalindromeConstraint<CellType, ExType, ProcessedExType>(
                        parsePositionLiterals(cells).filter(isVisibleGridCell),
                        false,
                    ));
                }));
            }
        },
        renban: (renban) => {
            if (renban instanceof Array) {
                items.push(...renban.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles renban line");

                    // Don't display the line - it's represented by a line constraint with isNewConstraint
                    return lines.map((cells) => RenbanConstraint<CellType, ExType, ProcessedExType>(
                        parsePositionLiterals(cells).filter(isVisibleGridCell),
                        false,
                        false,
                    ));
                }));
            }
        },
        whispers: (whispers) => {
            if (whispers instanceof Array) {
                items.push(...whispers.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles German whispers line");

                    // Don't display the line - it's represented by a line constraint with isNewConstraint
                    return lines.map((cells) => GermanWhispersConstraint<CellType, ExType, ProcessedExType>(
                        parsePositionLiterals(cells).filter(isVisibleGridCell),
                        false,
                        false
                    ));
                }));
            }
        },
        line: (lineData, {size}) => {
            if (lineData instanceof Array) {
                for (const {lines, outlineC, width, isNewConstraint, fromConstraint, ...other} of lineData) {
                    ObjectParser.empty.parse(other, "f-puzzles line");

                    items.push(...lines.map((cells) => {
                        const visibleCells = parsePositionLiterals(cells).filter(isVisibleGridCell);

                        checkForOutsideCells(visibleCells, size);

                        return LineConstraint<CellType, ExType, ProcessedExType>(
                            visibleCells,
                            outlineC,
                            width === undefined ? undefined : width / 2,
                            false,
                        );
                    }));
                }
            }
        },
        rectangle: (rectangle, {size}) => {
            if (rectangle instanceof Array) {
                items.push(...rectangle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles rect");

                    checkForOutsideCells(cells, size);

                    return RectConstraint<CellType, ExType, ProcessedExType>(cells, {width, height}, baseC, outlineC, value, fontC, angle, cosmeticsLayer);
                }));
            }
        },
        circle: (circle, {size}) => {
            if (circle instanceof Array) {
                items.push(...circle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles circle");

                    checkForOutsideCells(cells, size);

                    return EllipseConstraint<CellType, ExType, ProcessedExType>(cells, {width, height}, baseC, outlineC, value, fontC, angle, cosmeticsLayer);
                }));
            }
        },
        text: (text, {size: fieldSize}) => {
            if (text instanceof Array) {
                if (puzzleJson.fogofwar) {
                    text = text.filter((obj) => !isFowText(obj));
                }

                items.push(...text.flatMap(({cells, value, fontC, size, angle, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles text");

                    if (!value) {
                        return [];
                    }

                    checkForOutsideCells(cells, fieldSize);

                    return [TextConstraint<CellType, ExType, ProcessedExType>(cells, value, fontC, size, angle, cosmeticsLayer)];
                }));
            }
        },
        cage: (cage) => {
            if (cage instanceof Array) {
                items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles cage");

                    const visibleCells = parsePositionLiterals(cells).filter(isVisibleGridCell);

                    return DecorativeCageConstraint<CellType, ExType, ProcessedExType>(visibleCells, value?.toString(), false, undefined, outlineC, fontC);
                }));
            }
        },
        "diagonal+": (diagonal, {size}) => {
            if (diagonal) {
                items.push(PositiveDiagonalConstraint(size));
            }
        },
        "diagonal-": (diagonal, {size}) => {
            if (diagonal) {
                items.push(NegativeDiagonalConstraint(size));
            }
        },
        // endregion
        // endregion
        // region Extensions
        solution: (solution, {size}) => {
            if (solution instanceof Array) {
                const solutionGrid = splitArrayIntoChunks(solution, size);

                puzzle.resultChecker = ({puzzle: {initialDigits}, state}) => {
                    const {cells} = gameStateGetCurrentFieldState(state, true);

                    let areCorrectDigits = true;
                    let areCorrectColors = true;
                    const digitToColorMap: Record<number, CellColorValue> = {};
                    for (const [top, row] of cells.entries()) {
                        for (const [left, {usersDigit, colors}] of row.entries()) {
                            const expectedDigit = solutionGrid[top][left] || undefined;
                            const actualDigit = initialDigits?.[top]?.[left] ?? usersDigit;
                            if (!expectedDigit || !actualDigit || Number(actualDigit) !== Number(expectedDigit)) {
                                areCorrectDigits = false;
                            }

                            if (!expectedDigit || colors.size > 1) {
                                areCorrectColors = false;
                            } else {
                                const expectedColor = digitToColorMap[expectedDigit];
                                const actualColor = colors.first() ?? "";
                                if (!expectedColor) {
                                    digitToColorMap[expectedDigit] = actualColor;
                                } else if (actualColor !== expectedColor) {
                                    areCorrectColors = false;
                                }
                            }

                            if (!areCorrectDigits && !areCorrectColors) {
                                return false;
                            }
                        }
                    }

                    if (areCorrectDigits) {
                        return true;
                    }

                    if (areCorrectColors) {
                        const allColors = Object.values(digitToColorMap);
                        if (new HashSet(allColors).size === allColors.length) {
                            return {
                                isCorrectResult: true,
                                resultPhrase: {
                                    [LanguageCode.en]: [
                                        "Congratulations, you solved the puzzle!",
                                        "No-one cares about the digits.",
                                        "Fully-colored grid is just enough.",
                                    ].join("\n"),
                                    [LanguageCode.ru]: [
                                        "Поздравляю, Вы решили судоку!",
                                        "Никого не интересуют цифры.",
                                        "Полностью разукрашенного поля вполне достаточно.",
                                    ].join("\n"),
                                },
                            };
                        }
                    }

                    return false;
                };
            }
        },
        disabledlogic: undefined,
        truecandidatesoptions: undefined,
        fogofwar: undefined,
        foglight: undefined,
        // endregion
    }, ["size"]).parse(puzzleJson, "f-puzzles data");

    if (puzzleJson.fogofwar || puzzleJson.foglight) {
        items.push(FogConstraint<CellType, ExType, ProcessedExType>(
            getSolutionGridByFPuzzlesObject(puzzleJson)?.map(row => row.map(typeManager.createCellDataByImportedDigit)),
            puzzleJson.fogofwar,
            puzzleJson.foglight,
            puzzleJson.text?.filter(isFowText)?.flatMap(text => text.cells),
        ));

        puzzle.prioritizeSelection = true;
    }

    return puzzle.typeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
};

export const FPuzzles: PuzzleDefinitionLoader<any, any, any> = {
    noIndex: true,
    slug: "f-puzzles",
    fulfillParams: (params) => params,
    loadPuzzle: ({load, ...params}) => {
        if (typeof load !== "string") {
            throw new Error("Missing parameter");
        }
        const puzzleJson = decodeFPuzzlesString(load);
        console.log("Importing from f-puzzles:", puzzleJson);

        const {
            type,
            htmlRules,
            tesseract,
            fillableDigitalDisplay,
            noSpecialRules,
            loopX,
            loopY,
            "product-arrow": productArrow,
            yajilinFog,
            cosmeticsBehindFog,
            safeCrackerCodeLength,
            visibleRingsCount,
            startOffset,
            allowOverrideColors,
        } = params as Omit<FPuzzlesImportOptions, "load">;
        const sanitizedParams = {
            type,
            htmlRules,
            tesseract,
            fillableDigitalDisplay,
            noSpecialRules,
            loopX,
            loopY,
            productArrow,
            yajilinFog,
            cosmeticsBehindFog,
            safeCrackerCodeLength,
            visibleRingsCount,
            startOffset,
            allowOverrideColors,
        };

        return {
            ...loadByFPuzzlesObject(puzzleJson, "f-puzzles", params),
            saveStateKey: `f-puzzles-${sha1().update(load + JSON.stringify(sanitizedParams)).digest("hex").substring(0, 20)}`,
        };
    }
};
