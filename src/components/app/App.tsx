import React from "react";
import {Puzzle} from "../sudoku/puzzle/Puzzle";
import {useHash} from "../../hooks/useHash";
import AllPuzzles from "../../data/puzzles/AllPuzzles";

export const App = () => {
    const hash = useHash();

    if (!hash) {
        return <>
            <h1>Sudoku Puzzles</h1>

            <ul>
                {AllPuzzles.map(({slug, title}) => <li key={slug}>
                    <a href={`#${slug}`}>{title}</a>
                </li>)}
            </ul>
        </>;
    }

    for (const puzzle of AllPuzzles) {
        if (hash === puzzle.slug) {
            return <Puzzle key={puzzle.slug} puzzle={puzzle}/>;
        }
    }

    return <>
        <h1>Oops, the puzzle not found!</h1>

        <a href={"#"}>Check out the puzzles list</a>
    </>;
};
