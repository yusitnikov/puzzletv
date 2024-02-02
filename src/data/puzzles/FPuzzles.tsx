import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {GridParser} from "./GridParser";
import {FPuzzlesGridCell, FPuzzlesPuzzle, FPuzzlesText} from "fpuzzles-data";
import {PuzzleImporter} from "./PuzzleImporter";
import {
    parsePositionLiteral,
    Position,
    stringifyCellCoords
} from "../../types/layout/Position";
import {CellColor} from "../../types/sudoku/CellColor";
import {ObjectParser} from "../../types/struct/ObjectParser";
import {regionSumLineColor} from "../../components/sudoku/constraints/region-sum-line/RegionSumLine";
import {
    lockoutLineDiamondBackgroundColor,
    lockoutLineDiamondLineColor,
    lockoutLineLineColor
} from "../../components/sudoku/constraints/lockout-line/LockoutLine";
import {greenColor, purpleColor} from "../../components/app/globals";
import {splitArrayIntoChunks} from "../../utils/array";
import {decompressFromBase64} from "lz-string";
import {getPuzzleImportLoader} from "./Import";

export class FPuzzlesGridParser<T extends AnyPTM> extends GridParser<T, FPuzzlesPuzzle> {
    constructor(puzzleJson: FPuzzlesPuzzle, offsetX: number, offsetY: number) {
        super(
            puzzleJson,
            offsetX,
            offsetY,
            puzzleJson.size,
            puzzleJson.size,
            puzzleJson.size,
            undefined,
            undefined,
            fPuzzleColorsMap,
        );
    }

    addToImporter(importer: PuzzleImporter<T>) {
        const parseOptionalNumber = (value?: string | number) => value === undefined ? undefined : Number(value);

        const isFowText = ({cells, value}: FPuzzlesText) => value === "💡"
            && cells.length === 1
            && this.puzzleJson.fogofwar?.includes(cells[0]);

        // TODO: go over rangsk solver and populate constraints from there
        new ObjectParser<FPuzzlesPuzzle>({
            // region Core fields
            size: undefined,
            grid: (grid) => {
                importer.addRegions(this, grid.map((row) => row.map(({region}) => region)));

                const allGridCells: (FPuzzlesGridCell & Position)[] = grid
                    .flatMap(
                        (row, top) => row.map(
                            (cell, left) => ({top, left, ...cell})
                        )
                    );

                for (const {top, left, ...cell} of allGridCells) {
                    new ObjectParser<FPuzzlesGridCell>({
                        region: undefined,
                        value: (value, {given}) => {
                            if (given && value !== undefined) {
                                importer.addGiven(this, top, left, value);
                            }
                        },
                        given: undefined,
                        c: (color) => {
                            if (typeof color === "string") {
                                importer.addInitialColors(this, top, left, color);
                            }
                        },
                        cArray: (colors) => {
                            if (Array.isArray(colors)) {
                                importer.addInitialColors(this, top, left, ...colors);
                            }
                        },
                        highlight: (color) => {
                            if (typeof color === "string") {
                                importer.addSolutionColors(this, top, left, color);
                            }
                        },
                        highlightArray: (colors) => {
                            if (Array.isArray(colors)) {
                                importer.addSolutionColors(this, top, left, ...colors);
                            }
                        },
                        givenPencilMarks: undefined,
                        centerPencilMarks: (value) => value === undefined || value === null,
                        cornerPencilMarks: (value) => value === undefined || value === null,
                    }).parse(cell, `f-puzzles cell ${stringifyCellCoords({top, left})}`);
                }
            },
            title: (title) => importer.setTitle(title),
            author: (author) => importer.setAuthor(author),
            ruleset: (ruleset) => importer.setRuleset(ruleset),
            // region Constraints
            littlekillersum: (items) => {
                if (items instanceof Array) {
                    for (const {cell, cells: [startCell], direction, value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles little killer sum");

                        importer.addLittleKiller(this, startCell, direction, parseOptionalNumber(value));
                    }
                }
            },
            arrow: (items) => {
                if (items instanceof Array) {
                    for (const {cells, lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles arrow");

                        importer.addArrows(this, cells, lines);
                    }
                }
            },
            killercage: (items) => {
                if (items instanceof Array) {
                    for (const {cells, value, outlineC, fontC, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles killer cage");

                        importer.addKillerCage(this, cells, parseOptionalNumber(value), outlineC, fontC);
                    }
                }
            },
            antiknight: (antiKnight) => {
                if (antiKnight) {
                    importer.addAntiKnight();
                }
            },
            antiking: (antiKing) => {
                if (antiKing) {
                    importer.addAntiKing();
                }
            },
            disjointgroups: (disjointGroups) => {
                if (disjointGroups) {
                    importer.addDisjointGroups(this);
                }
            },
            nonconsecutive: (nonConsecutive) => {
                if (nonConsecutive) {
                    importer.addNonConsecutive();
                }
            },
            ratio: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell1, cell2], value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles ratio");

                        importer.addBlackKropki(this, cell1, cell2, parseOptionalNumber(value));
                    }
                }
            },
            difference: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell1, cell2], value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles difference");

                        importer.addWhiteKropki(this, cell1, cell2, parseOptionalNumber(value));
                    }
                }
            },
            xv: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell1, cell2], value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles XV");

                        switch (value) {
                            case "X":
                                importer.addX(this, cell1, cell2);
                                break;
                            case "V":
                                importer.addV(this, cell1, cell2);
                                break;
                        }
                    }
                }
            },
            thermometer: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles thermometer");

                        for (const cells of lines) {
                            importer.addThermometer(this, cells);
                        }
                    }
                }
            },
            sandwichsum: (items) => {
                if (items instanceof Array) {
                    for (const {cell, value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles sandwich sum");

                        if (value !== undefined) {
                            importer.addSandwichSum(this, cell, Number(value));
                        }
                    }
                }
            },
            skyscraper: (items) => {
                if (items instanceof Array) {
                    for (const {cell, value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles skyscraper");

                        if (value !== undefined) {
                            importer.addSkyscraper(this, cell, Number(value));
                        }
                    }
                }
            },
            xsum: (items) => {
                if (items instanceof Array) {
                    for (const {cell, value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles x-sum");

                        if (value !== undefined) {
                            importer.addXSum(this, cell, Number(value));
                        }
                    }
                }
            },
            even: (items) => {
                if (items instanceof Array) {
                    for (const {cell, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles even cell");

                        importer.addEven(this, cell);
                    }
                }
            },
            odd: (items) => {
                if (items instanceof Array) {
                    for (const {cell, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles odd cell");

                        importer.addOdd(this, cell);
                    }
                }
            },
            rowindexer: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell], ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles row indexer");

                        importer.addRowIndexer(this, cell);
                    }
                }
            },
            columnindexer: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell], ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles column indexer");

                        importer.addColumnIndexer(this, cell);
                    }
                }
            },
            boxindexer: (items) => {
                if (items instanceof Array) {
                    for (const {cells: [cell], ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles box indexer");

                        importer.addBoxIndexer(this, cell);
                    }
                }
            },
            extraregion: (items) => {
                if (items instanceof Array) {
                    for (const {cells, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles extra region");

                        importer.addExtraRegion(this, cells);
                    }
                }
            },
            clone: (items) => {
                if (items instanceof Array) {
                    for (const {cells, cloneCells, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles clone");

                        importer.addClones(this, [...cells, ...cloneCells]);
                    }
                }
            },
            quadruple: (items) => {
                if (items instanceof Array) {
                    for (const {cells, values, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles quadruple");

                        importer.addQuadruple(this, cells[3], values);
                    }
                }
            },
            betweenline: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles between line");

                        for (const cells of lines) {
                            importer.addBetweenLine(this, cells);
                        }
                    }
                }
            },
            doublearrow: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles double arrow line");

                        for (const cells of lines) {
                            importer.addDoubleArrowLine(this, cells, false);
                        }
                    }
                }
            },
            regionsumline: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles region sum line");

                        for (const cells of lines) {
                            importer.addRegionSumLine(this, cells, false);
                        }
                    }
                }
            },
            lockout: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles lockout line");

                        for (const cells of lines) {
                            importer.addLockoutLine(this, cells, false);
                        }
                    }
                }
            },
            minimum: (items) => {
                if (items instanceof Array) {
                    for (const {cell, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles minimum");

                        importer.addMinimum(this, cell);
                    }
                }
            },
            maximum: (items) => {
                if (items instanceof Array) {
                    for (const {cell, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles maximum");

                        importer.addMaximum(this, cell);
                    }
                }
            },
            palindrome: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles palindrome");

                        for (const cells of lines) {
                            importer.addPalindrome(this, cells, true);
                        }
                    }
                }
            },
            renban: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles renban line");

                        for (const cells of lines) {
                            importer.addRenban(this, cells, false);
                        }
                    }
                }
            },
            whispers: (items) => {
                if (items instanceof Array) {
                    for (const {lines, value, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles whispers line");

                        for (const cells of lines) {
                            importer.addWhispers(this, cells, false, parseOptionalNumber(value));
                        }
                    }
                }
            },
            entropicline: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles entropic line");

                        for (const cells of lines) {
                            importer.addEntropicLine(this, cells, false);
                        }
                    }
                }
            },
            modularline: (items) => {
                if (items instanceof Array) {
                    for (const {lines, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles modular line");

                        for (const cells of lines) {
                            importer.addModularLine(this, cells, false);
                        }
                    }
                }
            },
            line: (items) => {
                if (items instanceof Array) {
                    for (const {lines, outlineC, width, isNewConstraint, fromConstraint, isLLConstraint, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles line");

                        let color = outlineC;
                        switch (fromConstraint) {
                            case "Whispers":
                                color = greenColor;
                                break;
                            case "Renban":
                                color = purpleColor;
                                break;
                            case "Region Sum Line":
                                color = regionSumLineColor;
                                break;
                        }
                        if (isLLConstraint) {
                            color = lockoutLineLineColor;
                        }

                        for (const cells of lines) {
                            importer.addCosmeticLine(
                                this,
                                cells,
                                color,
                                width === undefined ? undefined : width / 2,
                            );
                        }
                    }
                }
            },
            rectangle: (items) => {
                if (items instanceof Array) {
                    for (const {cells, width, height, baseC, outlineC, value, fontC, angle, isLLConstraint, fromConstraint, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles rect");

                        let outlineColor = outlineC;
                        let baseColor = baseC;
                        if (isLLConstraint) {
                            outlineColor = lockoutLineDiamondLineColor;
                            baseColor = lockoutLineDiamondBackgroundColor;
                        }

                        importer.addCosmeticRect(this, cells, width, height, baseColor, outlineColor, undefined, value, fontC, angle);
                    }
                }
            },
            circle: (items) => {
                if (items instanceof Array) {
                    for (const {cells, width, height, baseC, outlineC, value, fontC, angle, fromConstraint, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles circle");

                        importer.addCosmeticCircle(this, cells, width, height, baseC, outlineC, undefined, value, fontC, angle);
                    }
                }
            },
            text: (items) => {
                if (items instanceof Array) {
                    if (this.puzzleJson.fogofwar) {
                        items = items.filter((obj) => !isFowText(obj));
                    }

                    for (const {cells, value, fontC, size, angle, fromConstraint, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles text");

                        if (!value || fromConstraint) {
                            continue;
                        }

                        importer.addCosmeticText(this, cells, value, fontC, size, angle);
                    }
                }
            },
            cage: (items) => {
                if (items instanceof Array) {
                    const metadata: Record<string, string> = {};

                    for (const {cells, value, outlineC, fontC, fromConstraint, ...other} of items) {
                        ObjectParser.empty.parse(other, "f-puzzles cage");

                        if (fromConstraint) {
                            continue;
                        }

                        const match = value?.match(/^(.+?):\s*([\s\S]+)/m);
                        if (match) {
                            metadata[match[1]] = match[2];
                        } else {
                            importer.addCosmeticCage(this, cells, value?.toString(), outlineC, fontC);
                        }
                    }

                    new ObjectParser<Record<string, string>>({
                        msgcorrect: (message) => importer.setSuccessMessage(message),
                    }).parse(metadata, "metadata from f-puzzles cages")
                }
            },
            "diagonal+": (diagonal) => {
                if (diagonal) {
                    importer.addPositiveDiagonal(this);
                }
            },
            "diagonal-": (diagonal) => {
                if (diagonal) {
                    importer.addNegativeDiagonal(this);
                }
            },
            // endregion
            // endregion
            // region Extensions
            solution: (solution) => {
                if (solution instanceof Array) {
                    const solutionArray = splitArrayIntoChunks(
                        solution.map((value) => {
                            if (value?.toString() === ".") {
                                return undefined;
                            }
                            const num = Number(value);
                            return Number.isFinite(num) ? num : value;
                        }),
                        this.columnsCount
                    );
                    for (const [top, row] of solutionArray.entries()) {
                        for (const [left, value] of row.entries()) {
                            if (value !== undefined) {
                                importer.addSolutionDigit(this, top, left, value);
                            }
                        }
                    }
                }
            },
            successMessage: (successMessage) => {
                if (successMessage) {
                    importer.setSuccessMessage(successMessage);
                }
            },
            disabledlogic: undefined,
            truecandidatesoptions: undefined,
            fogofwar: undefined,
            foglight: undefined,
            // endregion
        }).parse(this.puzzleJson, "f-puzzles data");

        if (this.hasFog) {
            importer.addFog(
                this,
                this.puzzleJson.fogofwar,
                this.puzzleJson.foglight,
                this.puzzleJson.text?.filter(isFowText)?.flatMap(text => text.cells),
            );
        }
    }

    get hasSolution() {
        return !!this.puzzleJson.solution;
    }
    get hasFog() {
        return !!this.puzzleJson.fogofwar || !!this.puzzleJson.foglight;
    }
    get hasCosmeticElements() {
        return !!this.puzzleJson.text?.length
            || !!this.puzzleJson.line?.length
            || !!this.puzzleJson.rectangle?.length
            || !!this.puzzleJson.circle?.length
            || !!this.puzzleJson.cage?.length;
    }
    get hasInitialColors() {
        return this.puzzleJson.grid.some(row => row.some(cell => cell.c || cell.cArray?.length));
    }
    get hasArrows() {
        return !!this.puzzleJson.arrow;
    }

    get quadruplePositions() {
        return this.puzzleJson.quadruple?.map(({cells}) => parsePositionLiteral(cells[3])) ?? [];
    }
}

export const FPuzzlesGridParserFactory = <T extends AnyPTM>(load: string, offsetX: number, offsetY: number) => {
    load = decodeURIComponent(load);
    const jsonStr = decompressFromBase64(load);
    if (typeof jsonStr !== "string" || jsonStr[0] !== "{" || jsonStr[jsonStr.length - 1] !== "}") {
        throw new Error("Failed to decode");
    }
    const json: FPuzzlesPuzzle = JSON.parse(jsonStr);
    return new FPuzzlesGridParser<T>(json, offsetX, offsetY);
};

export const FPuzzles = getPuzzleImportLoader("f-puzzles", FPuzzlesGridParserFactory);

enum FPuzzleColor {
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
