// noinspection SuspiciousTypeOfGuard

import {ObjectByParser, ObjectParser} from "../types/struct/ObjectParser";

declare const PuzzleLoader: any;
declare const PuzzleZipper: any;
declare const loadFPuzzle: any;

const optional = <T,>(callback: (value: T) => void) => (value: T | undefined) => {
    if (value !== undefined) {
        callback(value);
    }
};

const parseString = (name: string) => (value: string) => {
    if (typeof value !== "string") {
        console.error(name, "is not string", value);
    }
};
const parseNumber = (name: string) => (value: number) => {
    if (typeof value !== "number") {
        console.error(name, "is not number", value);
    }
};
const parseStringOrNumber = (name: string) => (value: string | number) => {
    if (typeof value !== "string" && typeof value !== "number") {
        console.error(name, "is not string/number", value);
    }
};
const parseBool = (name: string) => (value: boolean | 1) => {
    if (typeof value !== "boolean" && value !== 1) {
        console.error(name, "is not boolean", value);
    }
};

const parseArray = <T,>(name: string, itemCallback: (item: T) => void, expectedLength?: number) => (value: T[]) => {
    if (!Array.isArray(value)) {
        console.error(name, "is not array", value);
        return;
    }

    if (expectedLength !== undefined && value.length !== expectedLength) {
        console.error(name, "length is not", expectedLength, value);
        return;
    }

    for (const item of value) {
        itemCallback(item);
    }
};

const parsePoint = (name: string) => parseArray(name, parseNumber(name + " item"), 2);

const parseWayPoints = (name: string) => parseArray(name + " wayPoints", parsePoint(name + " wayPoint"));

const parseOverlay = (name: string) => parseArray(name + "s", parseObject(name, new ObjectParser({
    center: parsePoint(name + " center"),
    width: parseNumber(name + " width"),
    height: parseNumber(name + " height"),
    class: optional(parseString(name + " class")),
    role: optional(parseString(name + " role")),
    target: optional(parseString(name + " target")),
    angle: optional(parseNumber(name + " angle")),
    thickness: optional(parseNumber(name + " thickness")),
    color: optional(parseString(name + " color")),
    borderColor: optional(parseString(name + " borderColor")),
    backgroundColor: optional(parseString(name + " backgroundColor")),
    textColor: optional(parseString(name + " textColor")),
    textStroke: optional(parseString(name + " textStroke")),
    stroke: optional(parseString(name + " stroke")),
    rounded: optional(parseBool(name + " rounded")),
    fontSize: optional(parseNumber(name + " fontSize")),
    borderSize: optional(parseNumber(name + " borderSize")),
    text: optional(parseStringOrNumber(name + " text")),
    "dominant-baseline": optional(parseString(name + " dominant-baseline")),
    "stroke-width": optional(parseNumber(name + " stroke-width")),
    "stroke-dasharray": optional(parseString(name + " stroke-dasharray")),
})));

const parseObject = <T,>(name: string, parser: ObjectParser<T>) => (value: T) => {
    if (typeof value !== "object") {
        console.error(name, "is not object", value);
        return;
    }

    parser.parse(value, name);
};

const parser = new ObjectParser({
    id: parseString("id"),
    cellSize: parseNumber("cellSize"),
    metadata: optional(parseObject("metadata", new ObjectParser({
        source: optional(parseString("source")),
        title: optional(parseString("title")),
        author: optional(parseString("author")),
        rules: optional(parseString("rules")),
        solution: optional(parseString("solution")),
        msgcorrect: optional(parseString("msgcorrect")),
    }))),
    settings: optional(parseObject("settings", new ObjectParser({
    }))),
    cages: optional(parseArray("cages", parseObject("cage", new ObjectParser({
        value: optional(parseStringOrNumber("cage value")),
        sum: optional(parseNumber("cage sum")),
        cells: optional(parseArray("cage cells", parsePoint("cage cell"))),
        fontC: optional(parseString("cage fontC")),
        outlineC: optional(parseString("cage outlineC")),
        unique: optional(parseBool("cage unique")),
        hidden: optional(parseBool("cage hidden")),
    })))),
    overlays: optional(parseOverlay("overlay")),
    underlays: optional(parseOverlay("underlay")),
    arrows: optional(parseArray("arrows", parseObject("arrow", new ObjectParser({
        color: parseString("arrow color"),
        thickness: parseNumber("arrow thickness"),
        headLength: parseNumber("arrow headLength"),
        wayPoints: parseWayPoints("arrow"),
    })))),
    cells: parseArray("cells", parseArray("cells row", parseObject("cell", new ObjectParser({
        given: optional(parseBool("cell given")),
        value: optional(parseNumber("cell value")),
        pencilMarks: optional(parseArray("cell pencil-marks", parseStringOrNumber("cell pencil-mark"))),
        centremarks: optional(parseArray("cell center-marks", parseStringOrNumber("cell center-mark"))),
    })))),
    regions: optional(parseArray("regions", parseArray("region cells", parsePoint("region cell")))),
    lines: optional(parseArray("lines", parseObject("line", new ObjectParser({
        color: parseString("line color"),
        thickness: parseNumber("line thickness"),
        wayPoints: parseWayPoints("line"),
        fill: optional(parseString("line fill")),
        target: optional(parseString("line target")),
        "stroke-linecap": optional(parseString("line stroke-linecap")),
        "stroke-linejoin": optional(parseString("line stroke-linejoin")),
        "stroke-dasharray": optional(parseString("line stroke-dasharray")),
        "stroke-dashoffset": optional(parseNumber("line stroke-dashoffset")),
    })))),
});

export type Scl = ObjectByParser<typeof parser>;

export const puzzleIdToScl = (puzzleId: string) => {
    const format = PuzzleLoader.getPuzzleFormat(puzzleId);
    let data: Scl = PuzzleLoader.saveJsonUnzip(PuzzleLoader.decompressPuzzleId(puzzleId));
    if (format === "fpuz") {
        data = PuzzleLoader.saveJsonUnzip(loadFPuzzle.parseFPuzzle(data));
    }

    parser.parse(data, "data");

    return data;
};

export const sclToPuzzleId = (data: Scl) => `scl${loadFPuzzle.compressPuzzle(PuzzleZipper.zip(JSON.stringify(data)))}`;

export const normalizeSclMetadata = (
    {
        cages = [],
        metadata = {} as NonNullable<Scl["metadata"]>,
        ...data
    }: Scl
): Scl => {
    const parseCageMetadata = (value?: unknown) => {
        if (typeof value !== "string") {
            return undefined;
        }

        const result = /^(source|title|author|rules|solution|msgcorrect): ([^\x00]*)$/.exec(value);
        if (!result) {
            return undefined;
        }

        return {
            key: result[1],
            value: result[2],
        };
    };

    // Clone the metadata object to keep the source object unmodified
    metadata = {...metadata};
    for (const cage of cages) {
        const cageMetadata = parseCageMetadata(cage.value);
        if (cageMetadata) {
            // @ts-ignore
            metadata[cageMetadata.key] = cageMetadata.value;
        }
    }

    return {
        ...data,
        cages: cages.filter((cage) => !parseCageMetadata(cage.value)),
        metadata,
    };
};
