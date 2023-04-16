import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {JigsawPTM} from "../../sudokuTypes/jigsaw/types/JigsawPTM";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {JigsawSudokuTypeManager} from "../../sudokuTypes/jigsaw/types/JigsawSudokuTypeManager";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {TextConstraint} from "../../components/sudoku/constraints/text/Text";
import {RectConstraint} from "../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {arrayContainsPosition, parsePositionLiterals2} from "../../types/layout/Position";

const ctc = {
    "id": "penpabe03a5e39ee5fca861c7872e05ca86d4",
    "cellSize": 64,
    "cells": [
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 3
            },
            {
                "given": true,
                "value": 8
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 7
            },
            {
                "given": true,
                "value": 2
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 9
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 5
            },
            {
                "given": true,
                "value": 4
            },
            {
                "given": true,
                "value": 9
            },
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 4
            },
            {
                "given": true,
                "value": 6
            },
            {
                "given": true,
                "value": 8
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {
                "given": true,
                "value": 5
            },
            {
                "given": true,
                "value": 6
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 4
            },
            {
                "given": true,
                "value": 1
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {
                "given": true,
                "value": 4
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 8
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 3
            },
            {
                "given": true,
                "value": 1
            },
            {},
            {},
            {},
            {
                "given": true,
                "value": 5
            },
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {},
            {
                "given": true,
                "value": 3
            },
            {},
            {},
            {},
            {
                "given": true,
                "value": 7
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 8
            },
            {
                "given": true,
                "value": 4
            },
            {
                "given": true,
                "value": 9
            },
            {},
            {}
        ],
        [
            {},
            {
                "given": true,
                "value": 6
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 7
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {
                "given": true,
                "value": 5
            },
            {},
            {
                "given": true,
                "value": 8
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 5
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ],
        [
            {},
            {},
            {
                "given": true,
                "value": 9
            },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 3
            },
            {},
            {},
            {},
            {},
            {},
            {
                "given": true,
                "value": 8
            },
            {
                "given": true,
                "value": 3
            },
            {},
            {},
            {},
            {},
            {}
        ]
    ],
    "underlays": [
        {
            "class": "board-position",
            "backgroundColor": "#FFFFFF00",
            "center": [
                8,
                11.5
            ],
            "width": 23,
            "height": 18
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                5.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                5.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                0.5,
                7
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                0.5,
                7
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                0.5,
                15
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                0.5,
                15
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                19
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                0.5,
                19
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                17.5
            ],
            "width": 1,
            "height": 3
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                17.5
            ],
            "width": 1,
            "height": 3
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                2.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                2.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                2.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                2.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                2.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                3.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                3.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                3.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                3.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                5.5,
                4.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                5.5,
                4.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                5.5,
                5.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                5.5,
                5.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                5.5,
                12.5
            ],
            "width": 3,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                5.5,
                12.5
            ],
            "width": 3,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                6.5,
                3.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                6.5,
                3.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                6.5,
                5
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                6.5,
                5
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                6.5,
                6.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                6.5,
                6.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                6.5,
                11.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                6.5,
                11.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                6.5,
                13
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                6.5,
                13
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                6.5,
                14.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                6.5,
                14.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8,
                10.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8,
                10.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                20.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                20.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                22.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                7.5,
                22.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                0.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                0.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                8.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                8.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                9,
                2.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                9,
                2.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                8.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                8.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                8.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                8.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                18
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                8.5,
                18
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                10,
                1.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                10,
                1.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                9.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                9.5,
                9.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                9.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                9.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                10,
                18.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                10,
                18.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                10.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                10.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                11.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                11.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                12.5,
                4.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                12.5,
                4.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                6.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                6.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                12
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                12
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                12.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                12.5,
                13.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                12.5,
                14.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                12.5,
                14.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                12.5,
                18.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                12.5,
                18.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                20
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                12.5,
                20
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                3.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                3.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                5
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                5
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                7
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                7
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                18.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                13.5,
                18.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                13.5,
                20
            ],
            "width": 2,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                13.5,
                20
            ],
            "width": 2,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                21.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                13.5,
                21.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                14.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                14.5,
                1.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                14.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                14.5,
                2.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                15.5,
                9.5
            ],
            "width": 1,
            "height": 3
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                15.5,
                9.5
            ],
            "width": 1,
            "height": 3
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                15,
                10.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                15,
                10.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                15,
                17.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                15,
                17.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                15.5,
                0.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                15.5,
                0.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                16,
                1.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "borderSize": 0.8,
            "borderColor": "#444444",
            "backgroundColor": "#010101",
            "center": [
                16,
                1.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                16,
                2.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                16,
                2.5
            ],
            "width": 1,
            "height": 2
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                15.5,
                16.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                15.5,
                16.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                16.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                16.5,
                10.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                16.5,
                16.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFB3FF",
            "center": [
                16.5,
                16.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                16.5,
                17.5
            ],
            "width": 1,
            "height": 1
        },
        {
            "backgroundColor": "#FFFFA3",
            "center": [
                16.5,
                17.5
            ],
            "width": 1,
            "height": 1
        }
    ],
    "lines": [
        {
            "target": "overlay",
            "wayPoints": [
                [
                    -0.03125,
                    0
                ],
                [
                    -1,
                    0
                ],
                [
                    -1,
                    23
                ],
                [
                    -0.03125,
                    23
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    1
                ],
                [
                    2,
                    1
                ],
                [
                    2,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    2
                ],
                [
                    1.96875,
                    2
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    3
                ],
                [
                    1,
                    3
                ],
                [
                    1,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    4
                ],
                [
                    1,
                    4
                ],
                [
                    1,
                    4.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    5
                ],
                [
                    0,
                    5
                ],
                [
                    0,
                    0
                ],
                [
                    7.96875,
                    0
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    6
                ],
                [
                    -0.03125,
                    6
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    7
                ],
                [
                    -0.03125,
                    7
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    9
                ],
                [
                    2,
                    9
                ],
                [
                    2,
                    8.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    10
                ],
                [
                    1.96875,
                    10
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    11
                ],
                [
                    0.96875,
                    11
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    12
                ],
                [
                    0.96875,
                    12
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    13
                ],
                [
                    0,
                    13
                ],
                [
                    0,
                    8
                ],
                [
                    -0.96875,
                    8
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    14
                ],
                [
                    -0.03125,
                    14
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    15
                ],
                [
                    -0.03125,
                    15
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    17
                ],
                [
                    1,
                    17
                ],
                [
                    1,
                    16
                ],
                [
                    15,
                    16
                ],
                [
                    15,
                    15
                ],
                [
                    13,
                    15
                ],
                [
                    13,
                    17.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    18
                ],
                [
                    0,
                    18
                ],
                [
                    0,
                    16
                ],
                [
                    -0.96875,
                    16
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    19
                ],
                [
                    -0.03125,
                    19
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    20
                ],
                [
                    0,
                    20
                ],
                [
                    0,
                    23
                ],
                [
                    6.96875,
                    23
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    -0.96875,
                    22
                ],
                [
                    7,
                    22
                ],
                [
                    7,
                    21
                ],
                [
                    -0.96875,
                    21
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    0.03125,
                    7
                ],
                [
                    0.96875,
                    7
                ]
            ],
            "color": "#FFFFBA",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    0.03125,
                    15
                ],
                [
                    0.96875,
                    15
                ]
            ],
            "color": "#FFFFBA",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    0.03125,
                    19
                ],
                [
                    0.96875,
                    19
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    1.03125,
                    7
                ],
                [
                    1.96875,
                    7
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8,
                    5.03125
                ],
                [
                    8,
                    8
                ],
                [
                    1,
                    8
                ],
                [
                    1,
                    13
                ],
                [
                    1.96875,
                    13
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    1.03125,
                    14
                ],
                [
                    1.96875,
                    14
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    1.03125,
                    15
                ],
                [
                    6,
                    15
                ],
                [
                    6,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    1,
                    20.03125
                ],
                [
                    1,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    2,
                    15.03125
                ],
                [
                    2,
                    16.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    2,
                    17.03125
                ],
                [
                    2,
                    17.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    2,
                    18.03125
                ],
                [
                    2,
                    18.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    2,
                    21.03125
                ],
                [
                    2,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3,
                    0.03125
                ],
                [
                    3,
                    1
                ],
                [
                    7.96875,
                    1
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    5,
                    0.03125
                ],
                [
                    5,
                    4
                ],
                [
                    3,
                    4
                ],
                [
                    3,
                    5
                ],
                [
                    4.96875,
                    5
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    7.96875,
                    9
                ],
                [
                    3,
                    9
                ],
                [
                    3,
                    7
                ],
                [
                    6,
                    7
                ],
                [
                    6,
                    10.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3,
                    12.03125
                ],
                [
                    3,
                    13
                ],
                [
                    4.96875,
                    13
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3.03125,
                    14
                ],
                [
                    5,
                    14
                ],
                [
                    5,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3,
                    15.03125
                ],
                [
                    3,
                    16.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3,
                    17.03125
                ],
                [
                    3,
                    17.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    3,
                    21.03125
                ],
                [
                    3,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4,
                    0.03125
                ],
                [
                    4,
                    2
                ],
                [
                    7,
                    2
                ],
                [
                    7,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    3
                ],
                [
                    6,
                    3
                ],
                [
                    6,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4,
                    4.03125
                ],
                [
                    4,
                    10
                ],
                [
                    7,
                    10
                ],
                [
                    7,
                    7
                ],
                [
                    12,
                    7
                ],
                [
                    12,
                    11
                ],
                [
                    10,
                    11
                ],
                [
                    10,
                    17.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    6
                ],
                [
                    5,
                    6
                ],
                [
                    5,
                    11
                ],
                [
                    4,
                    11
                ],
                [
                    4,
                    17
                ],
                [
                    8,
                    17
                ],
                [
                    8,
                    14
                ],
                [
                    7.03125,
                    14
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    12
                ],
                [
                    4.96875,
                    12
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    18
                ],
                [
                    7.96875,
                    18
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    19
                ],
                [
                    8,
                    19
                ],
                [
                    8,
                    19.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4.03125,
                    20
                ],
                [
                    7,
                    20
                ],
                [
                    7,
                    15
                ],
                [
                    7.96875,
                    15
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    4,
                    21.03125
                ],
                [
                    4,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    5.03125,
                    12
                ],
                [
                    5.96875,
                    12
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    5.03125,
                    13
                ],
                [
                    5.96875,
                    13
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    6.03125,
                    5
                ],
                [
                    6.96875,
                    5
                ]
            ],
            "color": "#FFFFBA",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    6.03125,
                    13
                ],
                [
                    6.96875,
                    13
                ]
            ],
            "color": "#FFFFBA",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    7.03125,
                    6
                ],
                [
                    7.96875,
                    6
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8,
                    3.03125
                ],
                [
                    8,
                    3.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8,
                    10.03125
                ],
                [
                    8,
                    10.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8.03125,
                    18
                ],
                [
                    9,
                    18
                ],
                [
                    9,
                    18.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8,
                    21.03125
                ],
                [
                    8,
                    22
                ],
                [
                    8.96875,
                    22
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    8.03125,
                    23
                ],
                [
                    8.96875,
                    23
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    9.03125,
                    0
                ],
                [
                    14.96875,
                    0
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    9,
                    2.03125
                ],
                [
                    9,
                    2.96875
                ]
            ],
            "color": "#FFC6FF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    9.03125,
                    15
                ],
                [
                    12,
                    15
                ],
                [
                    12,
                    18
                ],
                [
                    11,
                    18
                ],
                [
                    11,
                    14
                ],
                [
                    9,
                    14
                ],
                [
                    9,
                    17
                ],
                [
                    14,
                    17
                ],
                [
                    14,
                    13
                ],
                [
                    13.03125,
                    13
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    9,
                    19.03125
                ],
                [
                    9,
                    19.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10,
                    0.03125
                ],
                [
                    10,
                    0.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10,
                    1.03125
                ],
                [
                    10,
                    1.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    12,
                    0.03125
                ],
                [
                    12,
                    4
                ],
                [
                    10,
                    4
                ],
                [
                    10,
                    5
                ],
                [
                    12,
                    5
                ],
                [
                    12,
                    6
                ],
                [
                    11,
                    6
                ],
                [
                    11,
                    13
                ],
                [
                    10.03125,
                    13
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10,
                    7.03125
                ],
                [
                    10,
                    9
                ],
                [
                    14,
                    9
                ],
                [
                    14,
                    8
                ],
                [
                    16.96875,
                    8
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10.03125,
                    10
                ],
                [
                    13,
                    10
                ],
                [
                    13,
                    8
                ],
                [
                    9,
                    8
                ],
                [
                    9,
                    7.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10.03125,
                    12
                ],
                [
                    11.96875,
                    12
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10,
                    18.03125
                ],
                [
                    10,
                    18.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    10.03125,
                    23
                ],
                [
                    17,
                    23
                ],
                [
                    17,
                    18.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11,
                    0.03125
                ],
                [
                    11,
                    1
                ],
                [
                    14,
                    1
                ],
                [
                    14,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11.03125,
                    2
                ],
                [
                    13.96875,
                    2
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11.03125,
                    3
                ],
                [
                    13,
                    3
                ],
                [
                    13,
                    0.03125
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11,
                    4.03125
                ],
                [
                    11,
                    4.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11.03125,
                    19
                ],
                [
                    11.96875,
                    19
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11.03125,
                    20
                ],
                [
                    11.96875,
                    20
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11.03125,
                    21
                ],
                [
                    12,
                    21
                ],
                [
                    12,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    11,
                    22.96875
                ],
                [
                    11,
                    22
                ],
                [
                    13,
                    22
                ],
                [
                    13,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    12.03125,
                    12
                ],
                [
                    12.96875,
                    12
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    12.03125,
                    20
                ],
                [
                    12.96875,
                    20
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    13.03125,
                    5
                ],
                [
                    13.96875,
                    5
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    13.03125,
                    7
                ],
                [
                    13.96875,
                    7
                ]
            ],
            "color": "#FFC6FF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    13.03125,
                    12
                ],
                [
                    13.96875,
                    12
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    13.03125,
                    14
                ],
                [
                    14.96875,
                    14
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    13.03125,
                    20
                ],
                [
                    13.96875,
                    20
                ]
            ],
            "color": "#FFFFBA",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    14.03125,
                    5
                ],
                [
                    15,
                    5
                ],
                [
                    15,
                    5.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    14.03125,
                    21
                ],
                [
                    14.96875,
                    21
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    14,
                    22.96875
                ],
                [
                    14,
                    22
                ],
                [
                    15,
                    22
                ],
                [
                    15,
                    22.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    15,
                    8.03125
                ],
                [
                    15,
                    8.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    15,
                    9.03125
                ],
                [
                    15,
                    9.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    15,
                    10.03125
                ],
                [
                    15,
                    10.96875
                ]
            ],
            "color": "#FFC6FF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    15,
                    17.03125
                ],
                [
                    15,
                    17.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16.03125,
                    0
                ],
                [
                    17,
                    0
                ],
                [
                    17,
                    0.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    1.03125
                ],
                [
                    16,
                    1.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    2.03125
                ],
                [
                    16,
                    2.96875
                ]
            ],
            "color": "#FFC6FF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    8.03125
                ],
                [
                    16,
                    8.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    9.03125
                ],
                [
                    16,
                    9.96875
                ]
            ],
            "color": "#727272",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    12.03125
                ],
                [
                    16,
                    12.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16.03125,
                    14
                ],
                [
                    16.96875,
                    14
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    15.96875
                ],
                [
                    16,
                    15
                ],
                [
                    16.96875,
                    15
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16.03125,
                    21
                ],
                [
                    16.96875,
                    21
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    16,
                    22.96875
                ],
                [
                    16,
                    22
                ],
                [
                    16.96875,
                    22
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    17,
                    3.03125
                ],
                [
                    17,
                    8.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "cell-grids",
            "wayPoints": [
                [
                    17,
                    11.03125
                ],
                [
                    17,
                    15.96875
                ]
            ],
            "color": "#FFFFFF",
            "thickness": 4
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    8,
                    23
                ],
                [
                    11,
                    23
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    15,
                    23
                ],
                [
                    16,
                    23
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    4
                ],
                [
                    17,
                    5
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    6
                ],
                [
                    17,
                    7
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    11
                ],
                [
                    17,
                    12
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    13
                ],
                [
                    17,
                    14
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    18
                ],
                [
                    17,
                    19
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    20
                ],
                [
                    17,
                    21
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    4,
                    5
                ],
                [
                    4,
                    6
                ],
                [
                    3,
                    6
                ],
                [
                    3,
                    8
                ],
                [
                    2,
                    8
                ],
                [
                    2,
                    6
                ],
                [
                    1,
                    6
                ],
                [
                    1,
                    3
                ],
                [
                    4,
                    3
                ],
                [
                    4,
                    4
                ],
                [
                    2,
                    4
                ],
                [
                    2,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    4,
                    13
                ],
                [
                    4,
                    14
                ],
                [
                    3,
                    14
                ],
                [
                    3,
                    16
                ],
                [
                    2,
                    16
                ],
                [
                    2,
                    14
                ],
                [
                    1,
                    14
                ],
                [
                    1,
                    11
                ],
                [
                    4,
                    11
                ],
                [
                    4,
                    12
                ],
                [
                    2,
                    12
                ],
                [
                    2,
                    13
                ],
                [
                    4,
                    13
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 1.7,
            "color": "#000000",
            "wayPoints": [
                [
                    1,
                    13
                ],
                [
                    2,
                    13
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    2,
                    21
                ],
                [
                    2,
                    20
                ],
                [
                    1,
                    20
                ],
                [
                    1,
                    19
                ],
                [
                    3,
                    19
                ],
                [
                    3,
                    18
                ],
                [
                    4,
                    18
                ],
                [
                    4,
                    22
                ],
                [
                    1,
                    22
                ],
                [
                    1,
                    21
                ],
                [
                    2,
                    21
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 1.7,
            "color": "#000000",
            "wayPoints": [
                [
                    2,
                    15
                ],
                [
                    3,
                    15
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 1.7,
            "color": "#000000",
            "wayPoints": [
                [
                    2,
                    22
                ],
                [
                    2,
                    21
                ],
                [
                    4,
                    21
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 1.7,
            "color": "#000000",
            "wayPoints": [
                [
                    3,
                    21
                ],
                [
                    3,
                    22
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    11,
                    5
                ],
                [
                    11,
                    6
                ],
                [
                    10,
                    6
                ],
                [
                    10,
                    7
                ],
                [
                    9,
                    7
                ],
                [
                    9,
                    6
                ],
                [
                    8,
                    6
                ],
                [
                    8,
                    5
                ],
                [
                    7,
                    5
                ],
                [
                    7,
                    4
                ],
                [
                    8,
                    4
                ],
                [
                    8,
                    3
                ],
                [
                    11,
                    3
                ],
                [
                    11,
                    4
                ],
                [
                    9,
                    4
                ],
                [
                    9,
                    5
                ],
                [
                    11,
                    5
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    10,
                    13
                ],
                [
                    10,
                    14
                ],
                [
                    9,
                    14
                ],
                [
                    9,
                    16
                ],
                [
                    8,
                    16
                ],
                [
                    8,
                    14
                ],
                [
                    7,
                    14
                ],
                [
                    7,
                    12
                ],
                [
                    8,
                    12
                ],
                [
                    8,
                    11
                ],
                [
                    10,
                    11
                ],
                [
                    10,
                    12
                ],
                [
                    9,
                    12
                ],
                [
                    9,
                    13
                ],
                [
                    10,
                    13
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    8,
                    23
                ],
                [
                    8,
                    22
                ],
                [
                    9,
                    22
                ],
                [
                    9,
                    21
                ],
                [
                    8,
                    21
                ],
                [
                    8,
                    20
                ],
                [
                    10,
                    20
                ],
                [
                    10,
                    19
                ],
                [
                    11,
                    19
                ],
                [
                    11,
                    23
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    11
                ],
                [
                    14,
                    11
                ],
                [
                    14,
                    12
                ],
                [
                    13,
                    12
                ],
                [
                    13,
                    13
                ],
                [
                    14,
                    13
                ],
                [
                    14,
                    14
                ],
                [
                    15,
                    14
                ],
                [
                    15,
                    15
                ],
                [
                    16,
                    15
                ],
                [
                    16,
                    14
                ],
                [
                    17,
                    14
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    4
                ],
                [
                    16,
                    4
                ],
                [
                    16,
                    3
                ],
                [
                    15,
                    3
                ],
                [
                    15,
                    4
                ],
                [
                    14,
                    4
                ],
                [
                    14,
                    5
                ],
                [
                    15,
                    5
                ],
                [
                    15,
                    6
                ],
                [
                    14,
                    6
                ],
                [
                    14,
                    7
                ],
                [
                    15,
                    7
                ],
                [
                    15,
                    8
                ],
                [
                    16,
                    8
                ],
                [
                    16,
                    7
                ],
                [
                    17,
                    7
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    18
                ],
                [
                    15,
                    18
                ],
                [
                    15,
                    19
                ],
                [
                    14,
                    19
                ],
                [
                    14,
                    21
                ],
                [
                    15,
                    21
                ],
                [
                    15,
                    23
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    12
                ],
                [
                    15,
                    12
                ],
                [
                    15,
                    13
                ],
                [
                    17,
                    13
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    5
                ],
                [
                    16,
                    5
                ],
                [
                    16,
                    6
                ],
                [
                    17,
                    6
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    17,
                    19
                ],
                [
                    16,
                    19
                ],
                [
                    16,
                    20
                ],
                [
                    17,
                    20
                ]
            ]
        },
        {
            "target": "overlay",
            "thickness": 4.3,
            "color": "#000000",
            "wayPoints": [
                [
                    16,
                    23
                ],
                [
                    16,
                    21
                ],
                [
                    17,
                    21
                ]
            ]
        }
    ],
    "overlays": [
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 15,
            "center": [
                0.76,
                5.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 15,
            "center": [
                0.76,
                13.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                0.76,
                18.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 9,
            "center": [
                0.76,
                19.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 1,
            "center": [
                1.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 6,
            "center": [
                2.76,
                1.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 11,
            "center": [
                2.76,
                2.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 6,
            "center": [
                2.76,
                9.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                2.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 9,
            "center": [
                3.76,
                2.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 9,
            "center": [
                3.76,
                10.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                3.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                5.76,
                4.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 13,
            "center": [
                5.76,
                5.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 5,
            "center": [
                5.76,
                11.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                5.76,
                12.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 3,
            "center": [
                5.76,
                13.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 12,
            "center": [
                6.76,
                3.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                6.76,
                14.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                7.76,
                2.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 11,
            "center": [
                7.76,
                10.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 12,
            "center": [
                7.76,
                20.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 7,
            "center": [
                7.76,
                22.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                8.76,
                0.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 5,
            "center": [
                8.76,
                8.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 13,
            "center": [
                8.76,
                9.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                8.76,
                10.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 5,
            "center": [
                8.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 7,
            "center": [
                8.76,
                18.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 3,
            "center": [
                9.76,
                1.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 16,
            "center": [
                9.76,
                2.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 1,
            "center": [
                9.76,
                18.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 1,
            "center": [
                10.76,
                1.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 6,
            "center": [
                10.76,
                18.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 11,
            "center": [
                11.76,
                13.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 4,
            "center": [
                12.76,
                6.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                12.76,
                11.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 17,
            "center": [
                12.76,
                12.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 9,
            "center": [
                12.76,
                19.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 7,
            "center": [
                12.76,
                20.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                13.76,
                4.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 5,
            "center": [
                13.76,
                5.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 10,
            "center": [
                13.76,
                6.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                13.76,
                10.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                13.76,
                21.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 4,
            "center": [
                14.76,
                2.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 9,
            "center": [
                14.76,
                9.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 16,
            "center": [
                14.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 5,
            "center": [
                15.76,
                1.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 6,
            "center": [
                15.76,
                9.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "text": 15,
            "center": [
                15.76,
                16.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                15.76,
                17.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 8,
            "center": [
                16.76,
                1.5
            ],
            "height": 0,
            "width": 0
        },
        {
            "stroke-width": 0,
            "dominant-baseline": "alphabetic",
            "fontSize": 40.8,
            "color": "#FFFFFF",
            "text": 2,
            "center": [
                16.76,
                9.5
            ],
            "height": 0,
            "width": 0
        }
    ],
    "cages": [
        {
            "unique": false,
            "hidden": true,
            "cells": [
                [
                    0,
                    0
                ],
                [
                    16,
                    22
                ]
            ]
        },
        {
            "value": "solution: ??????????????????????????742?????134?????1?5????1?638???5?672???879????5?9?????8?9????2346??????????????????????????????????????????????????????????????????????????2???????83????????????856?????56729????5?7???3?79????4?1??????138???1?4?????????????2649??????????????????????????????????????????????????????????8??????????????6?4????597?????97?????32517???6?41???54621????8?9????2?3????8?3??"
        },
        {
            "value": "title: Make a Picture Jigsaw"
        },
        {
            "value": "author: Panthera"
        },
        {
            "value": "rules: Normal IRREGULAR sudoku rules apply -- only the grid has been torn apart and scrambled. \n\nJSS rules apply in each region  -- clues are given for each region.  The clues outside the grid indicate the sums of the contiguous runs found in that row or column that must be shaded. There must be an unshaded cell between runs of the same color. If a row or column is unclued, there is no shading in that row or column.\n\nEach mini-JSS is a region in the final puzzle. To help put this together correctly, note that what would be the middle digit in a normal sudoku grid will be the box number in the end. So, R2C2 will be a 1, R2C5 will be a 2, R2C8 will be a 3, R5C2 will be a 4, etc.. \n\nWhen you are done, the shaded cells will create a picture if you put them together correctly.\n\nWhen all digits are correctly placed in this penpa grid, answer check will work!\nif placed correctly into a normal 9x9 square (irregular) grid, then you will see the picture!"
        }
    ]
};

const rowsCount = ctc.cells.length;
const columnsCount = ctc.cells[0].length;

const cagesMap = Object.fromEntries(
    ctc.cages
        .map(({value}) => value)
        .filter(Boolean)
        .map((value) => value!.split(": "))
);

const rulesReact = <>{(cagesMap.rules as string).split("\n").map(
    (line, index) => <RulesParagraph key={index}>{line || <span>&nbsp;</span>}</RulesParagraph>
)}</>;

const regions = parsePositionLiterals2([
    ["R2C4","R2C5","R2C6","R3C4","R3C6","R3C7","R3C8","R4C4","R4C6"],
    ["R2C12","R2C13","R2C14","R3C12","R3C14","R3C15","R3C16","R4C12","R4C14"],
    ["R2C20","R2C22","R3C20","R3C21","R3C22","R4C19","R4C20","R4C21","R4C22"],
    ["R8C5","R9C4","R9C5","R9C6","R10C4","R10C6","R10C7","R11C4","R11C6"],
    ["R8C13","R8C14","R9C12","R9C13","R9C14","R9C15","R9C16","R10C12","R10C14"],
    ["R9C21","R9C23","R10C21","R10C22","R10C23","R11C20","R11C21","R11C22","R11C23"],
    ["R15C6","R15C7","R16C4","R16C5","R16C6","R16C7","R16C8","R17C5","R17C7"],
    ["R14C13","R15C12","R15C13","R15C14","R16C12","R16C14","R16C15","R17C12","R17C14"],
    ["R15C20","R15C21","R16C19","R16C20","R16C21","R16C22","R16C23","R17C19","R17C21"],
]);

export const MakeAPictureJigsaw: PuzzleDefinition<JigsawPTM> = {
    noIndex: true,
    slug: "make-a-picture-jigsaw",
    title: {[LanguageCode.en]: cagesMap.title},
    author: {[LanguageCode.en]: cagesMap.author},
    rules: () => rulesReact,
    typeManager: {
        ...JigsawSudokuTypeManager,
        getCellTypeProps(cell) {
            return {
                isVisible: arrayContainsPosition(regions.flat(), cell),
            };
        },
    },
    fieldSize: {
        fieldSize: columnsCount,
        rowsCount,
        columnsCount,
    },
    regions,
    digitsCount: 9,
    importOptions: {
        angleStep: 90,
    },
    items: [
        ...ctc.cells
            .flatMap((
                row,
                top
            ) => row.map(({value, given}, left) => ({top, left, value})))
            .filter(({value}) => value !== undefined)
            .map(({top, left, value}) => TextConstraint(
                [{top, left}],
                value!.toString(),
                undefined,
                0.7,
            )),
        ...ctc.overlays.map(({text, center: [top, left], color}) => TextConstraint(
            [{
                top: top - 0.76,
                left: left - 0.5,
            }],
            text.toString(),
            color,
            0.7,
        )),
        ...ctc.underlays.map(
            ({center: [top, left], width, height, backgroundColor, borderColor}) => RectConstraint(
                [{
                    top: top - 0.5,
                    left: left - 0.5,
                }],
                {width, height},
                backgroundColor,
                borderColor,
                undefined,
                undefined,
                undefined,
                FieldLayer.beforeBackground,
            )
        ),
    ],
};
