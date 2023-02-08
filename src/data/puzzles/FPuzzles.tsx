import {allDrawingModes, PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {decompressFromBase64} from "lz-string";
import {sha1} from "hash.js";
import {FPuzzlesPuzzle} from "../../types/sudoku/f-puzzles/FPuzzlesPuzzle";
import {indexes} from "../../utils/indexes";
import {FPuzzlesGridCell} from "../../types/sudoku/f-puzzles/FPuzzlesGridCell";
import {parsePositionLiterals, Position, PositionSet, stringifyCellCoords} from "../../types/layout/Position";
import {calculateDefaultRegionWidth, FieldSize} from "../../types/sudoku/FieldSize";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {GivenDigitsMap} from "../../types/sudoku/GivenDigitsMap";
import {CellColor, CellColorValue} from "../../types/sudoku/CellColor";
import {ObjectParser} from "../../types/struct/ObjectParser";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {splitArrayIntoChunks} from "../../utils/array";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {LittleKillerConstraint} from "../../components/sudoku/constraints/little-killer/LittleKiller";
import {FPuzzlesLittleKillerSum} from "../../types/sudoku/f-puzzles/constraints/FPuzzlesLittleKillerSum";
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
import {TesseractSettings} from "../../sudokuTypes/tesseract/components/TesseractSettings";
import {getTesseractCellSelectionType} from "../../sudokuTypes/tesseract/types/TesseractSelection";
import {FogConstraint} from "../../components/sudoku/constraints/fog/Fog";
import {FPuzzlesText} from "../../types/sudoku/f-puzzles/constraints/FPuzzlesText";
import {CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {CubedokuIndexingConstraint} from "../../sudokuTypes/cubedoku/constraints/CubedokuIndexing";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {PuzzleLineSet} from "../../types/sudoku/PuzzleLineSet";
import {SafeCrackerSudokuTypeManager} from "../../sudokuTypes/safe-cracker/types/SafeCrackerSudokuTypeManager";
import {BaseSafeCrackerPuzzle} from "../../sudokuTypes/safe-cracker/types/BaseSafeCrackerPuzzle";
import {SafeCrackerPuzzleParams} from "../../sudokuTypes/safe-cracker/types/SafeCrackerPuzzleParams";

export const decodeFPuzzlesString = (load: string) => {
    load = decodeURIComponent(load);
    const jsonStr = decompressFromBase64(load);
    if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
        throw new Error("Failed to decode");
    }
    return JSON.parse(jsonStr) as FPuzzlesPuzzle;
};

export interface FPuzzlesImportOptions {
    load: string;
    type?: "regular" | "latin" | "calculator" | "cubedoku" | "safe-cracker";
    tesseract?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    "product-arrow"?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
}

export const getSolutionGridByFPuzzlesObject = ({solution, size}: FPuzzlesPuzzle) => {
    return solution && splitArrayIntoChunks(solution, size);
};

export const loadByFPuzzlesObject = (
    puzzleJson: FPuzzlesPuzzle,
    slug: string,
    {
        type = "regular",
        tesseract,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
    }: Omit<FPuzzlesImportOptions, "load">
): PuzzleDefinition<number> => {
    const regularTypeManager = DigitSudokuTypeManager(
        fillableDigitalDisplay
            ? RegularCalculatorDigitComponentType
            : RegularDigitComponentType
    );
    const safeCrackerParams: Partial<SafeCrackerPuzzleParams> = {size: puzzleJson.size};
    const typesMap: Record<string, SudokuTypeManager<number>> = {
        regular: regularTypeManager,
        latin: LatinDigitSudokuTypeManager,
        calculator: DigitSudokuTypeManager(CenteredCalculatorDigitComponentType),
        cubedoku: CubedokuTypeManager,
        "safe-cracker": SafeCrackerSudokuTypeManager(safeCrackerParams),
    };

    const initialDigits: GivenDigitsMap<number> = {};
    const initialColors: GivenDigitsMap<CellColorValue[]> = {};
    const items: Constraint<number, any>[] = [];

    if (type === "cubedoku") {
        items.push(CubedokuIndexingConstraint());
    }

    const baseTypeManager = typesMap[type] ?? regularTypeManager;
    const typeManager = {...baseTypeManager};
    if (tesseract) {
        typeManager.getCellSelectionType = (...args) =>
            getTesseractCellSelectionType?.(...args) ?? baseTypeManager.getCellSelectionType?.(...args);
        typeManager.settingsComponents = [
            ...(typeManager.settingsComponents ?? []),
            TesseractSettings,
        ];
    }

    const puzzle: PuzzleDefinition<number> = {
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
    };

    let yajilinFogLineSolution = new PuzzleLineSet(puzzle);
    const yajilinFogShadeSolution: GivenDigitsMap<CellColor> = {};

    if (noSpecialRules && !puzzleJson.solution) {
        puzzle.resultChecker = isValidFinishedPuzzleByConstraints;
    }

    const parseOptionalNumber = (value?: string | number) => value === undefined ? undefined : Number(value);

    const checkForOutsideCells = (cellLiterals: string[], fieldSize: number) => {
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
            const validGridCells = allGridCells.filter((cell) => typeManager.isValidCell?.(cell, puzzle) ?? true);

            const faces = typeManager.getRegionsWithSameCoordsTransformation?.(puzzle, 1) ?? [{
                top: 0,
                left: 0,
                width: size,
                height: size,
            }];
            const regions = faces.flatMap(face => indexes(size)
                .map(regionIndex => validGridCells.filter(
                    ({top, left, region}) => {
                        if (top < face.top || left < face.left || top >= face.top + face.height || left >= face.left + face.width) {
                            return false;
                        }

                        if (region === undefined) {
                            const topIndex = Math.floor(top / defaultRegionHeight);
                            const leftIndex = Math.floor(left / defaultRegionWidth);
                            region = leftIndex + topIndex * defaultRegionColumnsCount;
                        }

                        return region === regionIndex;
                    }
                ))
                .filter(({length}) => length));
            if (regions.length > 1) {
                puzzle.fieldSize.regions = regions;
            }

            for (const {top, left, ...cell} of allGridCells) {
                new ObjectParser<FPuzzlesGridCell>({
                    region: undefined,
                    value: (value, {given}) => {
                        if (typeof value === "number" && given) {
                            if (fillableDigitalDisplay) {
                                items.push(FillableCalculatorDigitConstraint<number, {}, {}>({top, left}, value));
                            } else {
                                initialDigits[top] = initialDigits[top] || {};
                                initialDigits[top][left] = value;
                            }
                        }
                    },
                    given: undefined,
                    c: (color) => {
                        if (yajilinFog && color === "#A8A8A8") {
                            yajilinFogShadeSolution[top] = yajilinFogShadeSolution[top] || {};
                            yajilinFogShadeSolution[top][left] = CellColor.black;
                        } else if (typeof color === "string") {
                            initialColors[top] = initialColors[top] || {};
                            initialColors[top][left] = [color];
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
                puzzle.rules = () => <>{ruleset.split("\n").map(
                    (line, index) => <RulesParagraph key={index}>{line || <span>&nbsp;</span>}</RulesParagraph>
                )}</>;
            }
        },
        // region Constraints
        littlekillersum: (littleKillerSum, {size}) => {
            if (littleKillerSum instanceof Array) {
                puzzle.fieldMargin = puzzle.fieldMargin || 1;

                const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size, regions: []};

                items.push(...littleKillerSum.map(({cell, cells: [startCell], direction, value, ...other}: FPuzzlesLittleKillerSum) => {
                    ObjectParser.empty.parse(other, "f-puzzles little killer sum");

                    return LittleKillerConstraint<number, {}, {}>(startCell, direction, fieldSize, parseOptionalNumber(value));
                }));
            }
        },
        arrow: (arrow) => {
            if (arrow instanceof Array) {
                items.push(...arrow.flatMap(({cells, lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles arrow");

                    return lines.length
                        ? lines.map(([lineStart, ...line]) => ArrowConstraint<number, {}, {}>(cells, line, false, lineStart, !!productArrow))
                        : ArrowConstraint<number, {}, {}>(cells, [], false, undefined, !!productArrow);
                }));
            }
        },
        killercage: (cage) => {
            if (cage instanceof Array) {
                items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles killer cage");

                    return KillerCageConstraint<number, {}, {}>(cells, parseOptionalNumber(value), false, undefined, outlineC, fontC);
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
                items.push(...ratio.map(({cells: [cell1, cell2], value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles ratio");

                    return KropkiDotConstraint<number, {}, {}>(cell1, cell2, true, parseOptionalNumber(value));
                }));
            }
        },
        difference: (difference) => {
            if (difference instanceof Array) {
                items.push(...difference.map(({cells: [cell1, cell2], value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles difference");

                    return KropkiDotConstraint<number, {}, {}>(cell1, cell2, false, parseOptionalNumber(value));
                }));
            }
        },
        xv: (xv) => {
            if (xv instanceof Array) {
                items.push(...xv.flatMap(({cells: [cell1, cell2], value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles XV");

                    switch (value) {
                        case "X": return [XMarkConstraint<number, {}, {}>(cell1, cell2)];
                        case "V": return [VMarkConstraint<number, {}, {}>(cell1, cell2)];
                        default: return [];
                    }
                }));
            }
        },
        thermometer: (thermometer) => {
            if (thermometer instanceof Array) {
                items.push(...thermometer.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles thermometer");

                    return lines.map((line) => ThermometerConstraint<number, {}, {}>(line));
                }));
            }
        },
        sandwichsum: (sandwichsum, {size}) => {
            if (sandwichsum instanceof Array) {
                puzzle.fieldMargin = puzzle.fieldMargin || 1;

                const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size, regions: []};

                items.push(...sandwichsum.flatMap(({cell, value, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles sandwich sum");

                    return value ? [SandwichSumConstraint<number, {}, {}>(cell, fieldSize, Number(value))] : [];
                }));
            }
        },
        even: (even) => {
            if (even instanceof Array) {
                items.push(...even.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles even cell");

                    return EvenConstraint<number, {}, {}>(cell);
                }));
            }
        },
        odd: (odd) => {
            if (odd instanceof Array) {
                items.push(...odd.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles odd cell");

                    return OddConstraint<number, {}, {}>(cell);
                }));
            }
        },
        extraregion: (extraregion) => {
            if (extraregion instanceof Array) {
                items.push(...extraregion.map(({cells, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles extra region");

                    return KillerCageConstraint<number, {}, {}>(cells);
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
                    ]).items;

                    return uniqueCells.length > 1 ? [CloneConstraint<number, {}, {}>(uniqueCells)] : [];
                }));
            }
        },
        quadruple: (quadruple) => {
            if (quadruple instanceof Array) {
                items.push(...quadruple.map(({cells, values, ...other}) => {

                    ObjectParser.empty.parse(other, "f-puzzles quadruple");

                    return QuadConstraint<number, {}, {}>(cells[3], values);
                }));
            }
        },
        betweenline: (betweenLine) => {
            if (betweenLine instanceof Array) {
                items.push(...betweenLine.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles between line");

                    return lines.map((line) => InBetweenLineConstraint<number, {}, {}>(line));
                }));
            }
        },
        minimum: (minimum) => {
            if (minimum instanceof Array) {
                items.push(...minimum.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles minimum");

                    return MinConstraint<number, {}, {}>(cell);
                }));
            }
        },
        maximum: (maximum) => {
            if (maximum instanceof Array) {
                items.push(...maximum.map(({cell, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles maximum");

                    return MaxConstraint<number, {}, {}>(cell);
                }));
            }
        },
        palindrome: (palindrome) => {
            if (palindrome instanceof Array) {
                items.push(...palindrome.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles palindrome");

                    return lines.map((line) => PalindromeConstraint<number, {}, {}>(line));
                }));
            }
        },
        renban: (renban) => {
            if (renban instanceof Array) {
                items.push(...renban.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles renban line");

                    // Don't display the line - it's represented by a line constraint with isNewConstraint
                    return lines.map((line) => RenbanConstraint<number, {}, {}>(line, false));
                }));
            }
        },
        whispers: (whispers) => {
            if (whispers instanceof Array) {
                items.push(...whispers.flatMap(({lines, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles German whispers line");

                    // Don't display the line - it's represented by a line constraint with isNewConstraint
                    return lines.map((line) => GermanWhispersConstraint<number, {}, {}>(line, false));
                }));
            }
        },
        line: (lineData, {size}) => {
            if (lineData instanceof Array) {
                for (const {lines, outlineC, width, isNewConstraint, ...other} of lineData) {
                    if (yajilinFog && outlineC === "#000000") {
                        yajilinFogLineSolution = yajilinFogLineSolution.bulkAdd(lines.flatMap(lineStr => {
                            const line = parsePositionLiterals(lineStr);
                            return indexes(line.length - 1).map(i => ({
                                start: line[i],
                                end: line[i + 1],
                            }));
                        }));
                    } else {
                        ObjectParser.empty.parse(other, "f-puzzles line");

                        items.push(...lines.map((line) => {
                            checkForOutsideCells(line, size);

                            return LineConstraint<number, {}, {}>(line, outlineC, width === undefined ? undefined : width / 2);
                        }));
                    }
                }
            }
        },
        rectangle: (rectangle, {size}) => {
            if (rectangle instanceof Array) {
                items.push(...rectangle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles rect");

                    checkForOutsideCells(cells, size);

                    return RectConstraint<number, {}, {}>(cells, {width, height}, baseC, outlineC, value, fontC, angle, cosmeticsLayer);
                }));
            }
        },
        circle: (circle, {size}) => {
            if (circle instanceof Array) {
                items.push(...circle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles circle");

                    checkForOutsideCells(cells, size);

                    return EllipseConstraint<number, {}, {}>(cells, {width, height}, baseC, outlineC, value, fontC, angle, cosmeticsLayer);
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

                    if (type === "safe-cracker") {
                        if ([">", "->", "=>"].includes(value)) {
                            value = "→";
                        }
                        if (["<", "<-", "<="].includes(value)) {
                            value = "←";
                        }
                    }

                    return [TextConstraint<number, {}, {}>(cells, value, fontC, size, angle, cosmeticsLayer)];
                }));
            }
        },
        cage: (cage) => {
            if (cage instanceof Array) {
                items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                    ObjectParser.empty.parse(other, "f-puzzles cage");

                    return DecorativeCageConstraint<number, {}, {}>(cells, value?.toString(), false, undefined, outlineC, fontC);
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

                puzzle.resultChecker = ({puzzle: {initialDigits}, state, cellsIndex}) => {
                    const {cells, lines} = gameStateGetCurrentFieldState(state, true);

                    if (yajilinFog) {
                        if (
                            Object.keys(yajilinFogShadeSolution).length &&
                            !cells.every((row, top) => row.every(({colors}, left) => {
                                if (initialColors[top]?.[left]?.length) {
                                    return true;
                                }

                                const isActualBlack = colors.size === 1 && colors.first() === CellColor.black;
                                const isExpectedBlack = !!yajilinFogShadeSolution[top]?.[left];
                                return isActualBlack === isExpectedBlack;
                            }))
                        ) {
                            return false;
                        }

                        if (
                            yajilinFogLineSolution.size &&
                            !new PuzzleLineSet(
                                puzzle,
                                cellsIndex.getCenterLines(lines.items, true)
                            ).equals(yajilinFogLineSolution)
                        ) {
                            return false;
                        }
                    }

                    return cells.every(
                        (row, top) => row.every(
                            ({usersDigit}, left) => {
                                const expected = solutionGrid[top][left] || undefined;
                                const actual = initialDigits?.[top]?.[left] ?? usersDigit;
                                return actual === expected;
                            }
                        )
                    );
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
        items.push(FogConstraint<number, {}, {}>(
            getSolutionGridByFPuzzlesObject(puzzleJson),
            puzzleJson.fogofwar,
            puzzleJson.foglight,
            puzzleJson.text?.filter(isFowText)?.flatMap(text => text.cells),
            yajilinFog && (yajilinFogLineSolution.size ? yajilinFogLineSolution : true),
            yajilinFog
                ? (Object.keys(yajilinFogShadeSolution).length ? yajilinFogShadeSolution : [CellColor.black])
                : {}
        ));

        puzzle.prioritizeSelection = true;
    }

    if (yajilinFog && puzzleJson.size > 9) {
        puzzle.digitsCount = 9;
        puzzle.disableDiagonalBorderLines = true;
        puzzle.disableDiagonalCenterLines = true;
    }

    if (type === "safe-cracker") {
        Object.assign(puzzle, BaseSafeCrackerPuzzle(safeCrackerParams));
    }

    return puzzle;
};

export const FPuzzles: PuzzleDefinitionLoader<number> = {
    noIndex: true,
    slug: "f-puzzles",
    fulfillParams: (params) => params,
    loadPuzzle: ({load, ...params}) => {
        if (typeof load !== "string") {
            throw new Error("Missing parameter");
        }
        const puzzleJson = decodeFPuzzlesString(load);
        console.log("Importing from f-puzzles:", puzzleJson);

        return {
            ...loadByFPuzzlesObject(puzzleJson, "f-puzzles", params),
            saveStateKey: `f-puzzles-${sha1().update(load).digest("hex").substring(0, 20)}`,
        };
    }
};
