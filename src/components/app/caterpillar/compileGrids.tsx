import {CaterpillarGrid} from "./types";
import {normalizeSclMetadata, puzzleIdToScl, Scl, sclToPuzzleId} from "../../../utils/sudokuPad";
import {safetyMargin} from "./globals";
import {indexes} from "../../../utils/indexes";
import {parseSolutionStringIntoArray} from "./utils";
import {Position} from "../../../types/layout/Position";
import {getRegionBorders} from "../../../utils/regions";

export const compileGrids = (grids: CaterpillarGrid[]) => {
    const result: Scl = {
        id: "caterdokupillarpoc",
        cellSize: 50,
        metadata: {} as any,
        settings: {},
        arrows: [],
        cages: [],
        lines: [],
        cells: [],
        regions: [],
        overlays: [],
        underlays: [],
    };

    let width = 0, height = 0;
    const minLeft = Math.min(...grids.map((grid) => grid.offset.left)) - safetyMargin;
    const minTop = Math.min(...grids.map((grid) => grid.offset.top)) - safetyMargin;

    const solutionArray: string[][] = [];

    for (const grid of grids) {
        const offsetTop = grid.offset.top - minTop;
        const offsetLeft = grid.offset.left - minLeft;
        const translatePoint = ([y, x]: number[]) => [offsetTop + y, offsetLeft + x];

        const data = normalizeSclMetadata(puzzleIdToScl(grid.data));

        const {
            metadata: {solution} = {},
            arrows = [],
            cages = [],
            lines = [],
            cells,
            regions = [],
            overlays = [],
            underlays = [],
        } = data;

        const gridHeight = cells.length;
        const gridWidth = cells[0].length;
        width = Math.max(width, offsetLeft + gridWidth + safetyMargin);
        height = Math.max(height, offsetTop + gridHeight + safetyMargin);

        for (const [top, row] of cells.entries()) {
            for (const [left, cell] of row.entries()) {
                result.cells[offsetTop + top] ??= [];
                result.cells[offsetTop + top][offsetLeft + left] = cell;
            }
        }

        if (solution) {
            parseSolutionStringIntoArray(solutionArray, solution, gridWidth, translatePoint);
        }

        if (regions.length) {
            if (grid.size === 6) {
                for (let i = 1; i < 6; i++) {
                    result.lines!.push(
                        {
                            target: "cell-grids",
                            wayPoints: [[0, i], [6, i]].map(translatePoint),
                            color: "#000000",
                            thickness: 0.5,
                        } as any,
                        {
                            target: "cell-grids",
                            wayPoints: [[i, 0], [i, 6]].map(translatePoint),
                            color: "#000000",
                            thickness: 0.5,
                        } as any,
                    );
                }
            } else {
                console.warn("Grid size is not 6 for", data);
            }

            for (const gridCells of regions) {
                const cells = gridCells.map(translatePoint).map(([y, x]): Position => ({top: y, left: x}));
                const points = getRegionBorders(cells, 1, true).map(({top, left}) => [top, left]);
                result.lines!.push({
                    target: "cell-grids",
                    wayPoints: points,
                    color: "#000000",
                    thickness: 3,
                } as any);
            }
        }

        result.overlays!.push(...overlays.map((overlay) => ({
            ...overlay,
            center: translatePoint(overlay.center),
        })));
        result.underlays!.push(...underlays.map((underlay) => ({
            ...underlay,
            center: translatePoint(underlay.center),
        })));
        result.arrows!.push(...arrows.map((arrow) => ({
            ...arrow,
            wayPoints: arrow.wayPoints.map(translatePoint),
        })));
        result.lines!.push(...lines.map((line) => ({
            ...line,
            wayPoints: line.wayPoints.map(translatePoint),
        })));
        result.cages!.push(...cages.map((cage) => ({
            ...cage,
            cells: cage.cells?.map(translatePoint),
        })));
    }

    for (const top of indexes(height)) {
        result.cells[top] ??= [];
        for (const left of indexes(width)) {
            result.cells[top][left] ??= {} as any;
        }
    }

    result.metadata!.source = "PuzzleTV";
    result.metadata!.title = "Caterdokupillar POC";
    result.metadata!.author = "A lot of people";
    result.metadata!.rules = "Totally normal caterdokupillar rules apply.";

    let solution = "";
    for (const top of indexes(height)) {
        for (const left of indexes(width)) {
            solution += solutionArray[top]?.[left] ?? result.cells[top][left].value ?? ".";
        }
    }
    result.metadata!.solution = solution;

    console.log(result);

    return "https://sudokupad.app/" + sclToPuzzleId(result);
};
