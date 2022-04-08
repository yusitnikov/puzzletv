import React from "react";
import ReactDOM from "react-dom";
import {Puzzle} from "./components/sudoku/puzzle/Puzzle";
import NorthOrSouth from "./data/puzzles/NorthOrSouth";

ReactDOM.render(
    <Puzzle puzzle={NorthOrSouth}/>,
    document.getElementById("root")
);
