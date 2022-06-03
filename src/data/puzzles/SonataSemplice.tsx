import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {littleKillerExplained, normalSudokuRulesApply} from "../ruleSnippets";
import {LittleKillerConstraint} from "../../components/sudoku/constraints/little-killer/LittleKiller";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {parsePositionLiteral, PositionLiteral} from "../../types/layout/Position";
import {withFieldLayer} from "../../contexts/FieldLayerContext";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {CellColor} from "../../types/sudoku/CellColor";
import {CenteredText} from "../../components/svg/centered-text/CenteredText";
import {
    QuadInputSudokuTypeManager
} from "../../components/sudoku/constraints/quad/QuadInput/QuadInputSudokuTypeManager";
import {QuadInputGameState} from "../../components/sudoku/constraints/quad/QuadInput/QuadInputGameState";

const noteRadius = 0.2;
const noteLineWidth = 0.05;
const noteLineLength = 1.2;
const sheetColor = "#808080";

interface CellProps {
    cell: PositionLiteral;
}

interface NoteProps extends CellProps {
    filled: boolean;
    centered?: boolean;
    noLine?: boolean;
    dot?: boolean;
}

const Note = ({cell, filled, centered = true, noLine = false, dot = false}: NoteProps) => {
    let {top, left} = parsePositionLiteral(cell);
    if (centered) {
        top += 0.5;
        left += 0.5;
    }

    return <>
        <circle
            cx={left}
            cy={top}
            r={noteRadius}
            fill={filled ? sheetColor : "#fff"}
            stroke={sheetColor}
            strokeWidth={noteLineWidth}
        />

        {dot && <circle
            cx={left + noteRadius * 1.7}
            cy={top - noteRadius}
            r={noteRadius * 0.3}
            fill={sheetColor}
            stroke={"none"}
            strokeWidth={0}
        />}

        {!noLine && <line
            x1={left - noteRadius}
            y1={top}
            x2={left - noteRadius}
            y2={top + noteLineLength}
            stroke={sheetColor}
            strokeWidth={noteLineWidth}
        />}
    </>;
};

const NumberClue = ({cell}: CellProps) => {
    const {top, left} = parsePositionLiteral(cell);

    return <CenteredText
        left={left + 0.25}
        top={top + 0.55}
        fill={sheetColor}
        size={0.25}
    >
        №
    </CenteredText>;
};

const KClue = ({cell}: CellProps) => {
    const {top, left} = parsePositionLiteral(cell);

    return <CenteredText
        left={left + 0.75}
        top={top + 0.55}
        fill={sheetColor}
        size={0.25}
    >
        K
    </CenteredText>;
};

const Extras = withFieldLayer(FieldLayer.top, () => <>
    <CenteredText
        top={1.5}
        left={1}
        size={0.4}
        fill={sheetColor}
    >
        Allegro
    </CenteredText>
    <CenteredText
        top={6.4}
        left={0.5}
        size={0.4}
        fill={sheetColor}
        style={{fontStyle: "italic"}}
    >
        p
    </CenteredText>

    <g transform={"translate(-1.5, 3.1) scale(0.02, 0.02)"}>
        <path
            fill="#000"
            d="m51.688 5.25c-5.427-0.1409-11.774 12.818-11.563 24.375 0.049 3.52 1.16 10.659 2.781 19.625-10.223 10.581-22.094 21.44-22.094 35.688-0.163 13.057 7.817 29.692 26.75 29.532 2.906-0.02 5.521-0.38 7.844-1 1.731 9.49 2.882 16.98 2.875 20.44 0.061 13.64-17.86 14.99-18.719 7.15 3.777-0.13 6.782-3.13 6.782-6.84 0-3.79-3.138-6.88-7.032-6.88-2.141 0-4.049 0.94-5.343 2.41-0.03 0.03-0.065 0.06-0.094 0.09-0.292 0.31-0.538 0.68-0.781 1.1-0.798 1.35-1.316 3.29-1.344 6.06 0 11.42 28.875 18.77 28.875-3.75 0.045-3.03-1.258-10.72-3.156-20.41 20.603-7.45 15.427-38.04-3.531-38.184-1.47 0.015-2.887 0.186-4.25 0.532-1.08-5.197-2.122-10.241-3.032-14.876 7.199-7.071 13.485-16.224 13.344-33.093 0.022-12.114-4.014-21.828-8.312-21.969zm1.281 11.719c2.456-0.237 4.406 2.043 4.406 7.062 0.199 8.62-5.84 16.148-13.031 23.719-0.688-4.147-1.139-7.507-1.188-9.5 0.204-13.466 5.719-20.886 9.813-21.281zm-7.719 44.687c0.877 4.515 1.824 9.272 2.781 14.063-12.548 4.464-18.57 21.954-0.781 29.781-10.843-9.231-5.506-20.158 2.312-22.062 1.966 9.816 3.886 19.502 5.438 27.872-2.107 0.74-4.566 1.17-7.438 1.19-7.181 0-21.531-4.57-21.531-21.875 0-14.494 10.047-20.384 19.219-28.969zm6.094 21.469c0.313-0.019 0.652-0.011 0.968 0 13.063 0 17.99 20.745 4.688 27.375-1.655-8.32-3.662-17.86-5.656-27.375z"
        />
    </g>

    <NumberClue cell={"R1C1"}/>
    <NumberClue cell={"R2C5"}/>
    <NumberClue cell={"R7C6"}/>
    <KClue cell={"R1C7"}/>
    <KClue cell={"R6C1"}/>
    <KClue cell={"R7C3"}/>

    <Note cell={"R4C1"} filled={false}/>

    <Note cell={"R3C3"} filled={true}/>

    <Note cell={"R2C4"} filled={true}/>

    <Note cell={"R5C5"} filled={true} dot={true} centered={false}/>

    <Note cell={"R4C6"} filled={true} noLine={true}/>
    <Note cell={"R4C7"} filled={true} noLine={true} centered={false}/>
    <g transform={`translate(${5.5 - noteRadius}, ${3.5 + noteLineLength}) skewY(-45)`}>
        <line
            x1={0}
            y1={0}
            x2={0}
            y2={-noteLineLength - noteLineWidth}
            stroke={sheetColor}
            strokeWidth={noteLineWidth}
        />

        <line
            x1={0.5}
            y1={0}
            x2={0.5}
            y2={-noteLineLength - noteLineWidth}
            stroke={sheetColor}
            strokeWidth={noteLineWidth}
        />

        <line
            x1={-noteLineWidth / 2}
            y1={0}
            x2={0.5 + noteLineWidth / 2}
            y2={0}
            stroke={sheetColor}
            strokeWidth={noteLineWidth * 3}
        />

        <line
            x1={-noteLineWidth / 2}
            y1={-noteLineWidth * 4}
            x2={0.5 + noteLineWidth / 2}
            y2={-noteLineWidth * 4}
            stroke={sheetColor}
            strokeWidth={noteLineWidth * 3}
        />
    </g>

    <Note cell={"R4C7"} filled={true}/>
</>);

const shadedRow = {
    0: [CellColor.lightGrey],
    1: [CellColor.lightGrey],
    2: [CellColor.lightGrey],
    3: [CellColor.lightGrey],
    4: [CellColor.lightGrey],
    5: [CellColor.lightGrey],
    6: [CellColor.lightGrey],
};

export const SonataSemplice: PuzzleDefinition<number, QuadInputGameState<number>, QuadInputGameState<number>> = {
    noIndex: true,
    slug: "rockratzero-sonata-semplice",
    title: {
        [LanguageCode.en]: "Sonata Semplice",
    },
    author: {
        [LanguageCode.en]: "rockratzero"
    },
    typeManager: QuadInputSudokuTypeManager({
        parent: DigitSudokuTypeManager(),
        allowRepeat: true,
        allowOverflow: false,
        radius: noteRadius + noteLineWidth / 2,
    }),
    fieldSize: createRegularFieldSize(7, 7),
    fieldMargin: 1,
    initialDigits: {
        0: {
            0: 1,
            1: 6,
            6: 7,
        },
        1: {
            4: 1,
            5: 6,
        },
        5: {
            0: 7,
        },
        6: {
            2: 7,
            5: 1,
            6: 6,
        },
    },
    initialColors: {
        0: shadedRow,
        1: shadedRow,
        6: shadedRow,
    },
    items: [
        <Extras/>,
        LittleKillerConstraint("R1C3", "R3C1", 7),
        LittleKillerConstraint("R1C6", "R2C7", 7),
        LittleKillerConstraint("R1C6", "R6C1", 16),
        LittleKillerConstraint("R4C7", "R7C4", 16),
        LittleKillerConstraint("R5C7", "R7C5", 7),
        LittleKillerConstraint("R7C3", "R5C1", 16),
        LittleKillerConstraint("R7C5", "R3C1", 16),
    ],
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
        <RulesParagraph>{translate(littleKillerExplained)}.</RulesParagraph>
    </>,
    resultChecker: isValidFinishedPuzzleByConstraints,
};