import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import React from "react";
import {Thermometer} from "../../components/sudoku/figures/thermometer/Thermometer";
import {Arrow} from "../../components/sudoku/figures/arrow/Arrow";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {normalSudokuRulesApply} from "../ruleSnippets";
import {
    RotatablePuzzleBoxGameState,
    RotatablePuzzleBoxProcessedGameState
} from "../../sudokuTypes/rotatable-puzzle-box/types/RotatablePuzzleBoxGameState";
import {
    RotatablePuzzleBoxSudokuTypeManager
} from "../../sudokuTypes/rotatable-puzzle-box/types/RotatablePuzzleBoxSudokuTypeManager";
import {Odd} from "../../components/sudoku/figures/odd/Odd";
import {Even} from "../../components/sudoku/figures/even/Even";
import {Max} from "../../components/sudoku/figures/min-max/MinMax";
import {KropkiDot} from "../../components/sudoku/figures/kropki-dot/KropkiDot";
import {useFieldLayer} from "../../contexts/FieldLayerContext";
import {FieldLayer} from "../../types/sudoku/FieldLayer";

export const OneBoxJoker: PuzzleDefinition<number, RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState> = {
    title: {
        [LanguageCode.en]: "One Box Joker",
    },
    slug: "maff-one-box-joker",
    author: {
        [LanguageCode.en]: "Maff",
    },
    rules: translate => <>
        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
    </>,
    typeManager: RotatablePuzzleBoxSudokuTypeManager,
    fieldSize: FieldSize9,
    initialDigits: {
        7: {
            8: 6,
        },
    },
    items: function Items({animatedAngle}) {
        const layer = useFieldLayer();

        const a = animatedAngle * Math.PI / 2;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rotate = ([x, y]: number[]): [number, number] => {
            x -= 5;
            y -= 5;
            return [
                x * cos - y * sin + 5,
                y * cos + x * sin + 5,
            ];
        };

        return <>
            <Thermometer points={[
                [1, 2],
                [1, 1],
            ]}/>

            <Odd left={2} top={1}/>

            <Arrow points={[
                [3, 1],
                [6, 1],
            ]}/>

            <Arrow points={[
                [7, 1],
                [9, 3],
                [9, 4],
            ]}/>

            <Max left={7} top={1}/>

            <Thermometer points={[
                [8, 1],
                [9, 2],
            ]}/>

            <Odd left={8} top={2}/>

            <Arrow points={[
                [1, 4],
                [1, 3],
                [2, 2],
            ]}/>

            <Max left={1} top={4}/>

            <Thermometer points={[
                [2, 4],
                [2, 3],
            ]}/>

            <Arrow points={[
                [3, 4],
                [3, 3],
                [4, 3],
            ]}/>

            <Odd left={6} top={3}/>

            <Arrow
                points={[
                    [6, 3],
                    [7, 3],
                    [7, 4],
                ]}
                transparentCircle={true}
            />

            <Arrow points={[
                [7, 6],
                [7, 7],
                [6, 7],
            ]}/>

            <Thermometer points={[
                [8, 6],
                [8, 7],
            ]}/>

            <Thermometer points={[
                [9, 6],
                [9, 8],
            ]}/>

            <Arrow points={[
                [9, 5],
                [9, 7],
                [8, 8],
                [7, 8],
            ]}/>

            <Arrow points={[
                [1, 7],
                [1, 5],
            ]}/>
            <Arrow points={[
                [1, 7],
                [2, 6],
            ]}/>

            <Even left={2} top={7}/>

            <Arrow points={[
                [4, 7],
                [3, 7],
                [3, 6],
            ]}/>

            <Max left={8} top={7}/>

            <Thermometer points={[
                [4, 8],
                [3, 8],
            ]}/>

            <Thermometer points={[
                [3, 9],
                [2, 9],
            ]}/>

            <Arrow points={[
                [4, 9],
                [3, 9],
                [2, 8],
            ]}/>

            <Arrow points={[
                [7, 9],
                [5, 9],
            ]}/>

            <Max left={7} top={9}/>

            <KropkiDot left={9} top={8.5}/>

            {/*TODO: make it rotatable, solve*/}
            <Arrow points={[
                [4, 6],
                [6, 6],
            ].map(rotate)}/>

            <Arrow points={[
                [6, 4],
                [6, 6],
            ].map(rotate)}/>

            <Arrow points={[
                [6, 4],
                [5, 5],
                [5, 4],
            ].map(rotate)}/>

            <Arrow points={[
                [4, 4],
                [4, 6],
            ].map(rotate)}/>

            <Arrow points={[
                [4, 4],
                [6, 4],
            ].map(rotate)}/>

            {layer === FieldLayer.beforeBackground && <polygon
                points={
                    [
                        [3.5, 3.5],
                        [6.5, 3.5],
                        [6.5, 6.5],
                        [3.5, 6.5],
                    ]
                        .map(rotate)
                        .map(([x, y]) => `${x - 0.5},${y - 0.5}`)
                        .join(" ")
                }
                fill={"#8f8"}
            />}
        </>;
    },
};

