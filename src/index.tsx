import React from "react";
import ReactDOM from "react-dom";
import {App} from "./components/app/App";
import NorthOrSouth from "./data/puzzles/NorthOrSouth";
import {RotatableDigitSudokuTypeManager} from "./sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";

ReactDOM.render(
    <App
        typeManager={RotatableDigitSudokuTypeManager}
        puzzle={NorthOrSouth}
    />,
    document.getElementById("root")
);
