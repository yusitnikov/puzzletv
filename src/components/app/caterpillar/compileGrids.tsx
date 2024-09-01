import {CaterpillarGrid} from "./types";
import {normalizeSclMetadata, puzzleIdToScl, Scl} from "../../../utils/sudokuPad";
import {safetyMargin} from "./globals";
import {indexes} from "../../../utils/indexes";
import {parseSolutionStringIntoArray} from "./utils";
import {areRectsIntersecting, Rect} from "../../../types/layout/Rect";
import {GridLinesProcessor} from "./GridLinesProcessor";

interface LinkedListItem {
    grid: CaterpillarGrid;
    rect: Rect;
    links: LinkedListItem[];
}

export const sortGrids = (grids: CaterpillarGrid[]) => {
    const linkedListItems = grids.map((grid): LinkedListItem => ({
        grid,
        rect: {
            ...grid.offset,
            width: grid.size ?? 6,
            height: grid.size ?? 6,
        },
        links: [],
    }));

    for (const item1 of linkedListItems) {
        for (const item2 of linkedListItems) {
            if (item1 !== item2 && areRectsIntersecting(item1.rect, item2.rect)) {
                item1.links.push(item2);
            }
        }
    }

    const ends: LinkedListItem[] = [];
    for (const item of linkedListItems) {
        if (item.links.length === 1) {
            ends.push(item);
        } else if (item.links.length !== 2) {
            console.log("Item:", item);
            throw new Error("Wrong number of grid neighbors");
        }
    }
    if (ends.length !== 2) {
        console.log("Ends:", ends);
        throw new Error("Wrong number of caterpillar ends");
    }

    const head = ends.sort((a, b) => a.rect.left - b.rect.left)[0];

    const sortedItems: LinkedListItem[] = [];
    for (let item = head; item; item = item.links.filter(link => !sortedItems.includes(link))[0]) {
        sortedItems.push(item);
    }

    if (sortedItems.length !== grids.length) {
        console.log("Sorted items:", sortedItems);
        throw new Error("Wrong number of sorted grids");
    }

    return sortedItems.map(item => item.grid);
};

export const compileGrids = (grids: CaterpillarGrid[]) => {
    const result: Scl = {
        id: "caterdokupillarpoc",
        cellSize: 50,
        metadata: {grids: []} as any,
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

    const gridLinesProcessor = new GridLinesProcessor();

    for (const [index, grid] of grids.entries()) {
        const offsetTop = grid.offset.top - minTop;
        const offsetLeft = grid.offset.left - minLeft;
        const {size = 6, dashed = false} = grid;
        const translatePoint = ([y, x]: number[]) => [offsetTop + y, offsetLeft + x];

        const data = normalizeSclMetadata(puzzleIdToScl(grid.data));

        const {
            metadata: {solution, title, ...otherMetadata} = {},
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

        gridLinesProcessor.addGrid(
            {
                top: offsetTop,
                left: offsetLeft,
                width: size,
                height: size,
            },
            regions.map(region => region.map(([top, left]) => ({top, left}))),
            dashed,
        );

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

        (result.metadata as any).grids.push({
            ...otherMetadata,
            title: `${index + 1}. ${title || "Untitled"}`,
            cells: `r${offsetTop + 1}c${offsetLeft + 1}-r${offsetTop + size}c${offsetLeft + size}`,
            top: offsetTop,
            left: offsetLeft,
            width: size,
            height: size,
        });
    }

    result.lines = [
        ...gridLinesProcessor.getLines(),
        ...result.lines!
    ];

    for (const top of indexes(height)) {
        result.cells[top] ??= [];
        for (const left of indexes(width)) {
            result.cells[top][left] ??= {} as any;
        }
    }

    result.metadata!.source = "PuzzleTV";
    result.metadata!.title = "Caterdokupillar";
    result.metadata!.author = "Much of the setting community";
    result.metadata!.rules = "Start in the top left, and as each 6x6 puzzle is completed, 4 digits will automatically carry over as givens for the next puzzle. Read the rules carefully for each puzzle, as many contain variants.";

    let solution = "";
    for (const top of indexes(height)) {
        for (const left of indexes(width)) {
            solution += solutionArray[top]?.[left] ?? result.cells[top][left].value ?? ".";
        }
    }
    result.metadata!.solution = solution;

    console.log(result);

    return result;
};
