import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
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
import {CellColorValue} from "../../types/sudoku/CellColor";
import {ObjectParser} from "../../types/struct/ObjectParser";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {splitArrayIntoChunks} from "../../utils/array";
import {ConstraintOrComponent} from "../../types/sudoku/Constraint";
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

export const FPuzzles: PuzzleDefinitionLoader<number> = {
    noIndex: true,
    slug: "f-puzzles",
    fulfillParams: (params) => params,
    loadPuzzle: ({load}) => {
        if (typeof load !== "string") {
            throw new Error("Missing parameter");
        }
        load = decodeURIComponent(load);
        const jsonStr = decompressFromBase64(load);
        if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
            throw new Error("Failed to decode");
        }
        const puzzleJson = JSON.parse(jsonStr) as FPuzzlesPuzzle;
        console.log("Importing from f-puzzles:", puzzleJson);

        const initialDigits: GivenDigitsMap<number> = {};
        const initialColors: GivenDigitsMap<CellColorValue[]> = {};
        const items: ConstraintOrComponent<number, any>[] = [];
        const puzzle: PuzzleDefinition<number> = {
            noIndex: true,
            slug: "f-puzzles",
            saveStateKey: `f-puzzles-${sha1().update(load).digest("hex").substring(0, 20)}`,
            title: {[LanguageCode.en]: "Untitled"},
            typeManager: DigitSudokuTypeManager(),
            fieldSize: {
                fieldSize: 9,
                rowsCount: 9,
                columnsCount: 9,
                regions: [],
            },
            allowDrawing: ["center-line", "border-line", "center-mark", "border-mark", "corner-mark"],
            initialDigits,
            initialColors,
            items,
        };

        const parseOptionalNumber = (value?: string | number) => value === undefined ? undefined : Number(value);

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

                const gridCells: (FPuzzlesGridCell & Position)[] = grid.flatMap(
                    (row, top) => row.map(
                        (cell, left) => ({top, left, ...cell})
                    )
                );

                const regions = indexes(size)
                    .map(regionIndex => gridCells.filter(
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
                if (regions.length > 1) {
                    puzzle.fieldSize.regions = regions;
                }

                for (const {top, left, ...cell} of gridCells) {
                    new ObjectParser<FPuzzlesGridCell>({
                        region: undefined,
                        value: (value, {given}) => {
                            if (typeof value === "number" && given) {
                                initialDigits[top] = initialDigits[top] || {};
                                initialDigits[top][left] = value;
                            }
                        },
                        given: undefined,
                        c: (color) => {
                            if (typeof color === "string") {
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

                        return LittleKillerConstraint(startCell, direction, fieldSize, parseOptionalNumber(value));
                    }));
                }
            },
            arrow: (arrow) => {
                if (arrow instanceof Array) {
                    items.push(...arrow.flatMap(({cells, lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles arrow");

                        return lines.map(([circle, ...line]) => ArrowConstraint(circle, line));
                    }));
                }
            },
            killercage: (cage) => {
                if (cage instanceof Array) {
                    items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles killer cage");

                        return KillerCageConstraint(cells, parseOptionalNumber(value), false, outlineC, fontC);
                    }));
                }
            },
            antiknight: (antiKnight) => {
                if (antiKnight) {
                    items.push(AntiKnightConstraint);
                }
            },
            antiking: (antiKing) => {
                if (antiKing) {
                    items.push(AntiKingConstraint);
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

                        return KropkiDotConstraint(cell1, cell2, true, parseOptionalNumber(value));
                    }));
                }
            },
            difference: (difference) => {
                if (difference instanceof Array) {
                    items.push(...difference.map(({cells: [cell1, cell2], value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles difference");

                        return KropkiDotConstraint(cell1, cell2, false, parseOptionalNumber(value));
                    }));
                }
            },
            xv: (xv) => {
                if (xv instanceof Array) {
                    items.push(...xv.flatMap(({cells: [cell1, cell2], value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles XV");

                        switch (value) {
                            case "X": return [XMarkConstraint(cell1, cell2)];
                            case "V": return [VMarkConstraint(cell1, cell2)];
                            default: return [];
                        }
                    }));
                }
            },
            thermometer: (thermometer) => {
                if (thermometer instanceof Array) {
                    items.push(...thermometer.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles thermometer");

                        return lines.map((line) => ThermometerConstraint(line));
                    }));
                }
            },
            sandwichsum: (sandwichsum, {size}) => {
                if (sandwichsum instanceof Array) {
                    puzzle.fieldMargin = puzzle.fieldMargin || 1;

                    const fieldSize: FieldSize = {fieldSize: size, rowsCount: size, columnsCount: size, regions: []};

                    items.push(...sandwichsum.flatMap(({cell, value, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles sandwich sum");

                        return value ? [SandwichSumConstraint(cell, fieldSize, Number(value))] : [];
                    }));
                }
            },
            even: (even) => {
                if (even instanceof Array) {
                    items.push(...even.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles even cell");

                        return EvenConstraint(cell);
                    }));
                }
            },
            odd: (odd) => {
                if (odd instanceof Array) {
                    items.push(...odd.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles odd cell");

                        return OddConstraint(cell);
                    }));
                }
            },
            extraregion: (extraregion) => {
                if (extraregion instanceof Array) {
                    items.push(...extraregion.map(({cells, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles extra region");

                        return KillerCageConstraint(cells);
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

                        return uniqueCells.length > 1 ? [CloneConstraint(uniqueCells)] : [];
                    }));
                }
            },
            quadruple: (quadruple) => {
                if (quadruple instanceof Array) {
                    items.push(...quadruple.map(({cells, values, ...other}) => {

                        ObjectParser.empty.parse(other, "f-puzzles quadruple");

                        return QuadConstraint(cells[3], values);
                    }));
                }
            },
            betweenline: (betweenLine) => {
                if (betweenLine instanceof Array) {
                    items.push(...betweenLine.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles between line");

                        return lines.map((line) => InBetweenLineConstraint(line));
                    }));
                }
            },
            minimum: (minimum) => {
                if (minimum instanceof Array) {
                    items.push(...minimum.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles minimum");

                        return MinConstraint(cell);
                    }));
                }
            },
            maximum: (maximum) => {
                if (maximum instanceof Array) {
                    items.push(...maximum.map(({cell, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles maximum");

                        return MaxConstraint(cell);
                    }));
                }
            },
            palindrome: (palindrome) => {
                if (palindrome instanceof Array) {
                    items.push(...palindrome.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles palindrome");

                        return lines.map((line) => PalindromeConstraint(line));
                    }));
                }
            },
            renban: (renban) => {
                if (renban instanceof Array) {
                    items.push(...renban.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles renban line");

                        // Don't display the line - it's represented by a line constraint with isNewConstraint
                        return lines.map((line) => RenbanConstraint(line, false));
                    }));
                }
            },
            whispers: (whispers) => {
                if (whispers instanceof Array) {
                    items.push(...whispers.flatMap(({lines, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles German whispers line");

                        // Don't display the line - it's represented by a line constraint with isNewConstraint
                        return lines.map((line) => GermanWhispersConstraint(line, false));
                    }));
                }
            },
            line: (lineData) => {
                if (lineData instanceof Array) {
                    items.push(...lineData.flatMap(({lines, outlineC, width, isNewConstraint, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles line");

                        return lines.map((line) => LineConstraint(line, outlineC, width === undefined ? undefined : width / 2));
                    }));
                }
            },
            rectangle: (rectangle) => {
                if (rectangle instanceof Array) {
                    items.push(...rectangle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles rect");

                        return RectConstraint(cells, {width, height}, baseC, outlineC, value, fontC, angle);
                    }));
                }
            },
            circle: (circle) => {
                if (circle instanceof Array) {
                    items.push(...circle.map(({cells, width, height, baseC, outlineC, value, fontC, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles circle");

                        return EllipseConstraint(cells, {width, height}, baseC, outlineC, value, fontC, angle);
                    }));
                }
            },
            text: (text) => {
                if (text instanceof Array) {
                    items.push(...text.flatMap(({cells, value, fontC, size, angle, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles text");

                        return value ? [TextConstraint(cells, value, fontC, size, angle)] : [];
                    }));
                }
            },
            cage: (cage) => {
                if (cage instanceof Array) {
                    items.push(...cage.map(({cells, value, outlineC, fontC, ...other}) => {
                        ObjectParser.empty.parse(other, "f-puzzles cage");

                        return DecorativeCageConstraint(cells, value?.toString(), false, outlineC, fontC);
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

                    puzzle.resultChecker = ({puzzle: {initialDigits}, state}) =>
                        gameStateGetCurrentFieldState(state).cells.every(
                            (row, top) => row.every(
                                ({usersDigit}, left) => {
                                    const expected = solutionGrid[top][left] || undefined;
                                    const actual = initialDigits?.[top]?.[left] ?? usersDigit;
                                    return actual === expected;
                                }
                            )
                        );
                }
            },
            disabledlogic: undefined,
            truecandidatesoptions: undefined,
            // endregion
        }).parse(puzzleJson, "f-puzzles data");

        return puzzle;
    }
};
