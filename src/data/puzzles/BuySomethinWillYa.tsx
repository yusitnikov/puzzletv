import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
} from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    blackKropkiDotsExplained,
    cannotRepeatInCage,
    evenExplained,
    germanWhispersExplained,
    killerCagesExplained,
    oddExplained,
    renbanExplained,
    whiteKropkiDotsExplained,
} from "../ruleSnippets";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { KillerCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { Constraint, toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { parsePositionLiteral, PositionLiteral } from "../../types/layout/Position";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import { OddConstraint } from "../../components/puzzle/constraints/odd/Odd";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import { WhispersConstraint } from "../../components/puzzle/constraints/whispers/Whispers";
import { EvenConstraint } from "../../components/puzzle/constraints/even/Even";
import { GreaterConstraint } from "../../components/puzzle/constraints/greater/Greater";
import { RenbanConstraint } from "../../components/puzzle/constraints/renban/Renban";
import { PuzzleContext } from "../../types/puzzle/PuzzleContext";
import { createCellsMapFromArray, CellsMap, mergeCellsMaps } from "../../types/puzzle/CellsMap";
import { CellColorValue } from "../../types/puzzle/CellColor";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { buildLink } from "../../utils/link";
import { translate } from "../../utils/translate";

const blackColor = "#000";
const greyColor = "#aaa";
const redColor = "#f99";
const lightRedColor = "#fcc";
const goldColor = "#fd6";
const yellowColor = "#ffa";
const blueColor = "#88f";
const lightBlueColor = "#ccf";
const greenColor = "#afa";

interface ShopItems {
    constraints: Constraint<NumberPTM, any>[];
    colors: CellsMap<CellColorValue[]>;
}

const getShopItems = (item: number | undefined, offset: number): ShopItems => {
    const offsetCell = (cell: PositionLiteral) => {
        const { top, left } = parsePositionLiteral(cell);
        return { top, left: left + offset };
    };
    const offsetCells = (...cells: PositionLiteral[]) => cells.map(offsetCell);
    const colorsMap = (color: CellColorValue, ...cells: PositionLiteral[]) => {
        const result: CellsMap<CellColorValue[]> = {};
        for (const { top, left } of offsetCells(...cells)) {
            result[top] = result[top] ?? {};
            result[top][left] = [color];
        }
        return result;
    };

    switch (item) {
        case 0:
            return {
                constraints: [
                    KillerCageConstraint(
                        offsetCells("R4C1", "R4C2", "R4C3", "R5C1", "R5C2", "R5C3", "R6C1", "R6C2", "R6C3"),
                    ),
                    KillerCageConstraint(
                        offsetCells("R5C2"),
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        false,
                        true,
                    ),
                    KropkiDotConstraint(offsetCell("R3C2"), offsetCell("R4C2"), false),
                    ...(offset === 0 ? [] : [KropkiDotConstraint(offsetCell("R5C0"), offsetCell("R5C1"), false)]),
                    ...(offset === 6 ? [] : [KropkiDotConstraint(offsetCell("R5C3"), offsetCell("R5C4"), false)]),
                    KropkiDotConstraint(offsetCell("R6C2"), offsetCell("R7C2"), false),
                    OddConstraint(offsetCell("R4C2")),
                    OddConstraint(offsetCell("R5C2")),
                    EvenConstraint(offsetCell("R5C1")),
                    EvenConstraint(offsetCell("R5C3")),
                    EvenConstraint(offsetCell("R6C2")),
                    WhispersConstraint(offsetCells("R5C2", "R5C1", "R4C2", "R5C3")),
                    RenbanConstraint(offsetCells("R5C2", "R5C3", "R6C2", "R5C1")),
                ],
                colors: colorsMap(redColor, "R4C1", "R4C2", "R4C3", "R5C1", "R5C3", "R6C1", "R6C2", "R6C3"),
            };
        case 1:
            return {
                constraints: [
                    ArrowConstraint(offsetCell("R6C2"), offsetCells("R1C2")),
                    WhispersConstraint(offsetCells("R5C1", "R4C2", "R5C3")),
                    WhispersConstraint(offsetCells("R6C1", "R5C2", "R6C3")),
                    EvenConstraint(offsetCell("R4C2")),
                    EvenConstraint(offsetCell("R5C2")),
                ],
                colors: {},
            };
        case 2:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R1C2")),
                    KillerCageConstraint(offsetCells("R2C2", "R3C2", "R4C2", "R5C2")),
                    KillerCageConstraint(offsetCells("R6C1", "R6C2", "R6C3", "R5C3"), 32),
                    KropkiDotConstraint(offsetCell("R1C2"), offsetCell("R2C2"), true),
                    KropkiDotConstraint(offsetCell("R2C2"), offsetCell("R3C2"), false),
                    KropkiDotConstraint(offsetCell("R3C2"), offsetCell("R4C2"), false),
                    KropkiDotConstraint(offsetCell("R4C2"), offsetCell("R5C2"), false),
                    OddConstraint(offsetCell("R5C3")),
                ],
                colors: mergeCellsMaps(
                    colorsMap(redColor, "R1C2"),
                    colorsMap(goldColor, "R6C1", "R6C2", "R6C3", "R5C3"),
                ),
            };
        case 3:
            return {
                constraints: [
                    ArrowConstraint(offsetCell("R2C2"), offsetCells("R1C2", "R2C1")),
                    ArrowConstraint(offsetCell("R2C2"), offsetCells("R1C2", "R2C3")),
                    OddConstraint(offsetCell("R3C2")),
                    OddConstraint(offsetCell("R4C2")),
                    KillerCageConstraint(offsetCells("R5C2", "R6C2"), 24),
                ],
                colors: colorsMap(lightRedColor, "R5C2", "R6C2"),
            };
        case 4:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R1C2", "R2C2", "R3C2"), 10),
                    KillerCageConstraint(offsetCells("R5C1", "R4C1", "R4C2", "R4C3", "R5C3"), 27),
                    KillerCageConstraint(offsetCells("R5C2", "R6C2")),
                    GreaterConstraint(offsetCell("R1C2"), offsetCell("R2C2")),
                    GreaterConstraint(offsetCell("R3C2"), offsetCell("R4C2")),
                    EvenConstraint(offsetCell("R4C2")),
                    EvenConstraint(offsetCell("R5C1")),
                    EvenConstraint(offsetCell("R5C3")),
                    OddConstraint(offsetCell("R6C2")),
                    KropkiDotConstraint(offsetCell("R5C1"), offsetCell("R6C1"), false),
                    KropkiDotConstraint(offsetCell("R5C3"), offsetCell("R6C3"), false),
                ],
                colors: mergeCellsMaps(
                    colorsMap(goldColor, "R5C1", "R4C1", "R4C2", "R4C3", "R5C3"),
                    colorsMap(lightBlueColor, "R5C2", "R6C2"),
                ),
            };
        case 5:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R1C2", "R2C2", "R3C2", "R4C2")),
                    KillerCageConstraint(offsetCells("R5C2", "R6C2"), 10),
                    KropkiDotConstraint(offsetCell("R1C2"), offsetCell("R2C2"), false),
                    KropkiDotConstraint(offsetCell("R2C2"), offsetCell("R3C2"), false),
                    KropkiDotConstraint(offsetCell("R3C2"), offsetCell("R4C2"), false),
                    EvenConstraint(offsetCell("R5C2")),
                    OddConstraint(offsetCell("R6C2")),
                ],
                colors: mergeCellsMaps(
                    colorsMap(yellowColor, "R1C2", "R2C2", "R3C2", "R4C2", "R5C2"),
                    colorsMap(goldColor, "R6C2"),
                ),
            };
        case 6:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R3C1", "R4C1", "R5C1", "R6C1")),
                    KropkiDotConstraint(offsetCell("R2C1"), offsetCell("R3C1"), false),
                    ...(offset === 0 ? [] : [KropkiDotConstraint(offsetCell("R3C0"), offsetCell("R3C1"), false)]),
                    KropkiDotConstraint(offsetCell("R4C1"), offsetCell("R3C1"), false),
                    ArrowConstraint(offsetCell("R6C1"), offsetCells("R3C1")),
                    ArrowConstraint(offsetCell("R6C2"), offsetCells("R3C2")),
                    ArrowConstraint(offsetCell("R1C2"), offsetCells("R4C2")),
                    WhispersConstraint(offsetCells("R1C2", "R2C3", "R5C3", "R6C2")),
                ],
                colors: colorsMap(yellowColor, "R3C1", "R4C1", "R5C1", "R6C1"),
            };
        case 7:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R1C1")),
                    KillerCageConstraint(offsetCells("R1C2")),
                    KillerCageConstraint(offsetCells("R1C3")),
                    KropkiDotConstraint(offsetCell("R1C1"), offsetCell("R1C2"), false),
                    KropkiDotConstraint(offsetCell("R1C2"), offsetCell("R1C3"), false),
                    KillerCageConstraint(offsetCells("R2C1", "R2C2", "R2C3"), 20, undefined, undefined, "#fff", "#fff"),
                    KillerCageConstraint(offsetCells("R3C1", "R4C1"), 10),
                    KillerCageConstraint(offsetCells("R3C2", "R4C2"), 10),
                    KillerCageConstraint(offsetCells("R3C3", "R4C3"), 10),
                    KillerCageConstraint(offsetCells("R5C1", "R5C2", "R5C3"), 20, undefined, undefined, "#fff", "#fff"),
                    KillerCageConstraint(offsetCells("R6C1")),
                    KillerCageConstraint(offsetCells("R6C2")),
                    KillerCageConstraint(offsetCells("R6C3")),
                    KropkiDotConstraint(offsetCell("R6C1"), offsetCell("R6C2"), false),
                    KropkiDotConstraint(offsetCell("R6C2"), offsetCell("R6C3"), false),
                ],
                colors: mergeCellsMaps(
                    colorsMap(
                        lightRedColor,
                        "R1C1",
                        "R1C2",
                        "R1C3",
                        "R3C1",
                        "R3C2",
                        "R3C3",
                        "R4C1",
                        "R4C2",
                        "R4C3",
                        "R6C1",
                        "R6C2",
                        "R6C3",
                    ),
                    colorsMap(blackColor, "R2C1", "R2C2", "R2C3", "R5C1", "R5C2", "R5C3"),
                ),
            };
        case 8:
            return {
                constraints: [
                    KillerCageConstraint(offsetCells("R5C1", "R5C2", "R6C1", "R6C2"), 30),
                    RenbanConstraint(offsetCells("R5C2", "R4C3", "R3C2")),
                    OddConstraint(offsetCell("R3C2")),
                ],
                colors: colorsMap(blueColor, "R5C1", "R5C2", "R6C1", "R6C2"),
            };
        case 9:
            return {
                constraints: [
                    KillerCageConstraint(
                        offsetCells("R3C2", "R4C1", "R4C2", "R4C3", "R5C1", "R5C2", "R5C3", "R6C1", "R6C2", "R6C3"),
                        45,
                    ),
                    RenbanConstraint(offsetCells("R3C2", "R2C2", "R2C3")),
                    OddConstraint(offsetCell("R2C3")),
                ],
                colors: colorsMap(
                    redColor,
                    "R3C2",
                    "R4C1",
                    "R4C2",
                    "R4C3",
                    "R5C1",
                    "R5C2",
                    "R5C3",
                    "R6C1",
                    "R6C2",
                    "R6C3",
                ),
            };
    }

    return { constraints: [], colors: {} };
};

const getShopItemsByContext = (context: PuzzleContext<NumberPTM>): ShopItems => {
    const result = [0, 3, 6].flatMap((offset) => getShopItems(context.getCell(8, offset + 1)?.usersDigit, offset));

    return {
        constraints: result.flatMap(({ constraints }) => constraints),
        colors: mergeCellsMaps(...result.map(({ colors }) => colors)),
    };
};

const slug = "buy-somethin-will-ya";

export const base: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title: { [LanguageCode.en]: "Buy Somethin' Will Ya!" },
    author: { [LanguageCode.en]: "ViKingPrime" },
    slug,
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    supportZero: true,
    allowOverridingInitialColors: true,
    allowDrawing: allDrawingModes,
};

const S = undefined;

export const BuySomethinWillYa: PuzzleDefinition<NumberPTM> = {
    ...base,
    noIndex: true,
    rules: () => (
        <>
            <RulesParagraph>
                <details open={true}>
                    <summary>"Normal" Schrödinger rules apply.</summary>
                    <RulesUnorderedList>
                        <li>place the digits 0 through 9 once each in every row, column, and box;</li>
                        <li>two of the digits will have to share a Schrödinger cell;</li>
                        <li>each row, column and box contains exactly one Schrödinger cell.</li>
                    </RulesUnorderedList>
                </details>
            </RulesParagraph>
            <RulesParagraph>
                <details open={false}>
                    <summary>
                        Normal arrow, German whisper (green), killer, kropki, odd/even and renban (purple) rules apply.
                    </summary>
                    <RulesUnorderedList>
                        <li>{translate(germanWhispersExplained())};</li>
                        <li>
                            {translate(killerCagesExplained)}. {translate(cannotRepeatInCage)};
                        </li>
                        <li>{translate(whiteKropkiDotsExplained)};</li>
                        <li>{translate(blackKropkiDotsExplained)};</li>
                        <li>{translate(evenExplained)};</li>
                        <li>{translate(oddExplained)};</li>
                        <li>{translate(renbanExplained())}.</li>
                    </RulesUnorderedList>
                </details>
            </RulesParagraph>
            <RulesParagraph>
                If a Schrödinger cell falls within
                <RulesUnorderedList>
                    <li>an arrow, German whisper line or killer cage, both digits contribute their value;</li>
                    <li>
                        a Kropki dot, an Odd/Even cell or a Renban line, both digits must satisfy the condition (i.e.
                        both are consecutive with or both are in a ratio of 1:2 with the adjacent cell; both digits are
                        odd or even; or both digits are part of a consecutive, non-repeating set of digits in any
                        order).
                    </li>
                </RulesUnorderedList>
            </RulesParagraph>
            <RulesParagraph>The digit "0" is by definition an even digit.</RulesParagraph>
            <RulesParagraph>
                The letter "V" indicates a greater/lesser-than relationship between those two cells.
            </RulesParagraph>
            <RulesParagraph>
                Spin the Wheel: You have ten rupees to spend! (the three green boxes will add up to ten total) - modify
                the grid, depending on what digits are placed in row 9, columns 2 / 5 / 8 (only one combination will be
                valid, to be deduced by the solver).
            </RulesParagraph>
            <RulesParagraph>
                No counterfit currency! (only single digits are permitted within those cells).
            </RulesParagraph>
            <RulesUnorderedList>
                <li>
                    if a "0" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-0-compass")}>
                        Compass
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "1" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-1-arrow")}>
                        Arrow
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "2" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-2-candle")}>
                        Candle
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "3" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-3-hookshot")}>
                        Hookshot
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "4" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-4-sword")}>
                        Sword
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "5" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-5-flute")}>
                        Flute
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "6" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-6-bow-quiver")}>
                        Bow &amp; Quiver
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "7" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-7-raft")}>
                        Raft
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "8" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-8-bomb")}>
                        Bomb
                    </a>{" "}
                    to the shop;
                </li>
                <li>
                    if a "9" is placed, add a{" "}
                    <a target={"_blank"} href={buildLink(slug + "-9-super-bomb")}>
                        Super Bomb
                    </a>{" "}
                    to the shop;
                </li>
            </RulesUnorderedList>
        </>
    ),
    items: (context) => {
        return [
            KillerCageConstraint(["R7C1", "R7C2", "R7C3", "R8C2"], 14),
            KillerCageConstraint(["R7C4", "R7C5", "R7C6", "R8C5"]),
            KillerCageConstraint(["R7C7", "R7C8", "R7C9", "R8C8"]),
            KillerCageConstraint(["R8C1", "R9C1"], 13),
            KillerCageConstraint(["R8C3", "R8C4"], 9),
            KillerCageConstraint(["R8C6", "R8C7"]),
            KillerCageConstraint(["R8C9", "R9C9"], 4),
            KillerCageConstraint(["R9C2"]),
            KillerCageConstraint(["R9C5"]),
            KillerCageConstraint(["R9C8"]),
            KropkiDotConstraint("R7C2", "R8C2", true),
            KropkiDotConstraint("R8C8", "R9C8", true),
            KropkiDotConstraint("R7C4", "R7C5", false),
            KropkiDotConstraint("R7C5", "R7C6", false),
            KropkiDotConstraint("R7C7", "R8C7", false),
            ...getShopItemsByContext(context).constraints,
        ].map(toDecorativeConstraint);
    },
    initialColors: (context) => ({
        ...getShopItemsByContext(context).colors,
        6: {
            0: [greyColor],
            1: [greyColor],
            2: [greyColor],
            3: [greyColor],
            4: [greyColor],
            5: [greyColor],
            6: [greyColor],
            7: [greyColor],
            8: [greyColor],
        },
        7: {
            0: [lightRedColor],
            1: [greyColor],
            2: [lightRedColor],
            3: [lightRedColor],
            4: [greyColor],
            5: [lightRedColor],
            6: [lightRedColor],
            7: [greyColor],
            8: [lightRedColor],
        },
        8: {
            0: [lightRedColor],
            1: [greenColor],
            4: [greenColor],
            7: [greenColor],
            8: [lightRedColor],
        },
    }),
    solution: createCellsMapFromArray([
        [0, 8, 5, 1, 9, 7, 4, 3, S],
        [S, 9, 6, 4, 5, 2, 1, 0, 8],
        [1, 2, 4, 3, 0, S, 5, 7, 9],
        [9, 1, 3, 2, 4, 5, S, 6, 7],
        [6, S, 8, 9, 3, 0, 2, 1, 4],
        [2, 4, 0, S, 7, 1, 3, 9, 5],
        [4, 3, 1, 7, 8, 9, 6, S, 0],
        [5, 6, 9, 0, S, 4, 7, 8, 3],
        [8, 0, S, 5, 6, 3, 9, 4, 1],
    ]),
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
};

export const BuySomethinWillYaShopItems: PuzzleDefinition<NumberPTM>[] = [
    "Compass",
    "Arrow",
    "Candle",
    "Hookshot",
    "Sword",
    "Flute",
    "Bow & Quiver",
    "Raft",
    "Bomb",
    "Super Bomb",
].map((title, index) => {
    const { constraints, colors } = getShopItems(index, 3);

    return {
        ...base,
        slug: `${slug}-${index}-${title.toLowerCase().replace(/\W+/g, "-")}`,
        title: { [LanguageCode.en]: title },
        items: constraints.map(toDecorativeConstraint),
        initialDigits: { 8: { 4: index } },
        initialColors: {
            ...colors,
            8: { 4: [greenColor] },
        },
    };
});
