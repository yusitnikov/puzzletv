import { allDrawingModes, PuzzleDefinition } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/sudoku/rules/RulesParagraph";
import { FieldSize9, Regions9 } from "../../types/sudoku/FieldSize";
import { DigitSudokuTypeManager } from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import { observer } from "mobx-react-lite";
import { darkGreyColor, textColor } from "../../components/app/globals";
import { profiler } from "../../utils/profiler";
import { AutoSvg } from "../../components/svg/auto-svg/AutoSvg";
import { DigitProps } from "../../components/sudoku/digit/DigitProps";
import { DigitComponentType } from "../../components/sudoku/digit/DigitComponentType";
import { ReactNode } from "react";
import { Constraint, ConstraintProps, isValidFinishedPuzzleByConstraints } from "../../types/sudoku/Constraint";
import { parsePositionLiteral, PositionLiteral } from "../../types/layout/Position";
import { FieldLayer } from "../../types/sudoku/FieldLayer";
import { CellColor, cellColors } from "../../types/sudoku/CellColor";
import { localStorageManager } from "../../utils/localStorage";
import { SettingsContentProps } from "../../components/sudoku/controls/settings/SettingsContent";
import { SettingsItem } from "../../components/sudoku/controls/settings/SettingsItem";
import { SettingsCheckbox } from "../../components/sudoku/controls/settings/SettingsCheckbox";

// region Settings
const withColorsSetting = localStorageManager.getBoolManager("bodoniWithColors");

export const BodoniSettings = observer(function BodoniSettings({ cellSize }: SettingsContentProps<NumberPTM>) {
    profiler.trace();

    return (
        <SettingsItem>
            Add unique background colors to the glyphs:
            <SettingsCheckbox
                type={"checkbox"}
                cellSize={cellSize}
                checked={withColorsSetting.get()}
                onChange={(ev) => withColorsSetting.set(ev.target.checked)}
            />
        </SettingsItem>
    );
});
// endregion

// region Glyphs
const smallWidth = 0.1;
const largeWidth = 0.3;
const smallCurve = 0.13;
const largeCurve = 0.17;

const GlyphO = (kx: number, ky: number) => (
    <path
        key={`o:${kx}:${ky}`}
        fill={"currentColor"}
        stroke={"none"}
        strokeWidth={0}
        d={[
            "M",
            kx * 0.5,
            (ky * smallWidth) / 2,
            "Q",
            (kx * largeWidth) / 2,
            (ky * smallWidth) / 2,
            (kx * largeWidth) / 2,
            ky * 0.5,
            "H",
            (-kx * largeWidth) / 2,
            "Q",
            (-kx * largeWidth) / 2,
            (-ky * smallWidth) / 2,
            kx * 0.5,
            (-ky * smallWidth) / 2,
            "z",
        ].join(" ")}
    />
);
const GlyphTopLeftO = GlyphO(-1, -1);
const GlyphTopRightO = GlyphO(1, -1);
const GlyphBottomLeftO = GlyphO(-1, 1);
const GlyphBottomRightO = GlyphO(1, 1);

const GlyphSmallEnding = (k: number) => (
    <path
        key={`small-ending:${k}`}
        fill={"currentColor"}
        stroke={"none"}
        strokeWidth={0}
        d={[
            "M",
            k * 0.5,
            smallWidth / 2,
            "q",
            -k * smallCurve,
            0,
            -k * smallCurve,
            smallCurve,
            "h",
            -k * smallWidth,
            "v",
            -smallWidth - 2 * smallCurve,
            "h",
            k * smallWidth,
            "q",
            0,
            smallCurve,
            k * smallCurve,
            smallCurve,
            "z",
        ].join(" ")}
    />
);
const GlyphLeftEnding = GlyphSmallEnding(-1);
const GlyphRightEnding = GlyphSmallEnding(1);

const GlyphLargeEnding = (k: number) => (
    <path
        key={`large-ending:${k}`}
        fill={"currentColor"}
        stroke={"none"}
        strokeWidth={0}
        d={[
            "M",
            largeWidth / 2,
            k * 0.5,
            "q",
            0,
            -k * largeCurve,
            largeCurve,
            -k * largeCurve,
            "v",
            -k * smallWidth,
            "h",
            -largeWidth - 2 * largeCurve,
            "v",
            k * smallWidth,
            "q",
            largeCurve,
            0,
            largeCurve,
            k * largeCurve,
            "z",
        ].join(" ")}
    />
);
const GlyphTopEnding = GlyphLargeEnding(-1);
const GlyphBottomEnding = GlyphLargeEnding(1);

const GlyphVerticalLine = (
    <rect
        key={"vertical-line"}
        fill={"currentColor"}
        stroke={"none"}
        strokeWidth={0}
        x={-largeWidth / 2}
        y={-0.5}
        width={largeWidth}
        height={1}
    />
);
const GlyphHorizontalLine = (
    <rect
        key={"horizontal-line"}
        fill={"currentColor"}
        stroke={"none"}
        strokeWidth={0}
        x={-0.5}
        y={-smallWidth / 2}
        width={1}
        height={smallWidth}
    />
);

const glyphsMap: Record<number, ReactNode[]> = {
    1: [GlyphBottomLeftO, GlyphRightEnding, GlyphTopEnding],
    2: [GlyphBottomLeftO, GlyphTopRightO],
    3: [GlyphTopRightO, GlyphLeftEnding, GlyphBottomEnding],
    4: [GlyphVerticalLine, GlyphLeftEnding, GlyphRightEnding],
    5: [GlyphVerticalLine, GlyphHorizontalLine],
    6: [GlyphHorizontalLine, GlyphTopEnding, GlyphBottomEnding],
    7: [GlyphTopLeftO, GlyphRightEnding, GlyphBottomEnding],
    8: [GlyphTopLeftO, GlyphBottomRightO],
    9: [GlyphBottomRightO, GlyphLeftEnding, GlyphTopEnding],
};
// endregion

// region Custom digit
const colorsMap = cellColors;

const BodoniDigit = observer(function BodoniDigit({
    puzzle,
    digit,
    size,
    color = textColor,
    ...containerProps
}: DigitProps<NumberPTM>) {
    profiler.trace();

    return (
        <AutoSvg width={size} height={size} {...containerProps}>
            <BodoniDigitSvgContent puzzle={puzzle} digit={digit} size={size} color={color} />
        </AutoSvg>
    );
});

const BodoniDigitSvgContent = observer(function BodoniDigitSvgContent({
    digit,
    size,
    color,
    left = 0,
    top = 0,
}: DigitProps<NumberPTM>) {
    profiler.trace();

    return (
        <AutoSvg left={left} top={top} width={size} height={size} style={{ color }} scale={size}>
            {withColorsSetting.get() && (
                <rect
                    fill={colorsMap[(digit - 1) as CellColor]}
                    fillOpacity={0.5}
                    stroke={"none"}
                    strokeWidth={0}
                    x={-0.5}
                    y={-0.5}
                    width={1}
                    height={1}
                />
            )}

            {glyphsMap[digit]}
        </AutoSvg>
    );
});

const BodoniDigitComponentType: DigitComponentType<NumberPTM> = {
    component: BodoniDigit,
    svgContentComponent: BodoniDigitSvgContent,
    widthCoeff: 1.1,
};
// endregion

// region Constraints
interface GlyphsProps {
    glyphs: ReactNode[];
}

const GlyphsComponent = {
    [FieldLayer.regular]: ({
        cells: [{ top, left }],
        color = darkGreyColor,
        props: { glyphs },
    }: ConstraintProps<NumberPTM, GlyphsProps>) => (
        <AutoSvg top={top + 0.5} left={left + 0.5} style={{ color }}>
            {glyphs}
        </AutoSvg>
    ),
};

const GlyphsConstraint = (cellLiteral: PositionLiteral, glyphs: ReactNode[]): Constraint<NumberPTM, GlyphsProps> => ({
    name: "glyphs",
    cells: [parsePositionLiteral(cellLiteral)],
    props: { glyphs },
    component: GlyphsComponent,
    renderSingleCellInUserArea: true,
    isObvious: true,
    isValidCell({ top, left }, digits): boolean {
        const digit = digits[top][left];
        const actualGlyphs = glyphsMap[digit];
        return glyphs.every((glyph) => actualGlyphs.includes(glyph));
    },
});
// endregion

export const BodoniSudoku: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    slug: "bodoni-sudoku",
    author: {
        [LanguageCode.en]: "Wei-Hwa Huang",
    },
    title: {
        [LanguageCode.en]: "Bodoni Sudoku",
    },
    typeManager: {
        ...DigitSudokuTypeManager(BodoniDigitComponentType, 1),
        settingsComponents: [BodoniSettings],
    },
    fieldSize: FieldSize9,
    regions: Regions9,
    rules: () => (
        <>
            <RulesParagraph>
                Just like regular Sudoku, except that the numbers have been replaced with typographic lines, curves, and
                serifs.
            </RulesParagraph>
            <RulesParagraph>
                The nine "digits" are at the keypad. The puzzle is on the left, you can add ink however you wish to
                solve it but you can't erase anything.
            </RulesParagraph>
        </>
    ),
    items: [
        // S
        GlyphsConstraint("R1C1", [GlyphBottomRightO]),
        GlyphsConstraint("R1C2", [GlyphLeftEnding]),
        GlyphsConstraint("R2C1", [GlyphTopRightO]),
        GlyphsConstraint("R2C2", [GlyphBottomLeftO]),
        GlyphsConstraint("R3C1", [GlyphRightEnding]),
        GlyphsConstraint("R3C2", [GlyphTopLeftO]),
        // O
        GlyphsConstraint("R1C7", [GlyphBottomRightO]),
        GlyphsConstraint("R1C8", [GlyphBottomLeftO]),
        GlyphsConstraint("R2C7", [GlyphVerticalLine]),
        GlyphsConstraint("R2C8", [GlyphVerticalLine, GlyphHorizontalLine]),
        GlyphsConstraint("R2C9", [GlyphLeftEnding]),
        GlyphsConstraint("R3C7", [GlyphTopRightO]),
        GlyphsConstraint("R3C8", [GlyphTopLeftO]),
        // O
        GlyphsConstraint("R5C7", [GlyphBottomRightO]),
        GlyphsConstraint("R5C8", [GlyphBottomLeftO]),
        GlyphsConstraint("R6C7", [GlyphVerticalLine]),
        GlyphsConstraint("R6C8", [GlyphVerticalLine]),
        GlyphsConstraint("R7C7", [GlyphTopRightO]),
        GlyphsConstraint("R7C8", [GlyphTopLeftO]),
        // U
        GlyphsConstraint("R3C4", [GlyphBottomEnding]),
        GlyphsConstraint("R3C5", [GlyphBottomEnding]),
        GlyphsConstraint("R4C4", [GlyphVerticalLine]),
        GlyphsConstraint("R4C5", [GlyphVerticalLine]),
        GlyphsConstraint("R5C4", [GlyphTopRightO]),
        GlyphsConstraint("R5C5", [GlyphTopLeftO]),
        // I
        GlyphsConstraint("R7C5", [GlyphBottomEnding]),
        GlyphsConstraint("R8C5", [GlyphVerticalLine]),
        GlyphsConstraint("R9C5", [GlyphTopEnding]),
        // F
        GlyphsConstraint("R6C2", [GlyphBottomRightO]),
        GlyphsConstraint("R6C3", [GlyphLeftEnding]),
        GlyphsConstraint("R7C1", [GlyphRightEnding]),
        GlyphsConstraint("R7C2", [GlyphVerticalLine, GlyphHorizontalLine]),
        GlyphsConstraint("R7C3", [GlyphLeftEnding]),
        GlyphsConstraint("R8C2", [GlyphVerticalLine]),
        GlyphsConstraint("R9C2", [GlyphTopEnding]),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
    allowDrawing: allDrawingModes,
};
