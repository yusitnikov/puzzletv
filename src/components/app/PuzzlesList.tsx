import {useWindowSize} from "../../hooks/useWindowSize";
import {headerPadding} from "./globals";
import {getAllPuzzlesWithDefaultParams} from "../../data/puzzles/AllPuzzles";
import React from "react";
import {splitArrayIntoChunks} from "../../utils/array";
import {indexes} from "../../utils/indexes";
import {PuzzlesListItem, PuzzlesListItemSpace} from "./PuzzlesListItem";

const gridGap = headerPadding;

export const PuzzlesList = () => {
    const {width: windowWidth} = useWindowSize();
    const innerWidth = windowWidth - headerPadding * 2;
    const columnsCount = Math.max(Math.round(innerWidth / 400), 1);
    const itemWidth = (innerWidth - (columnsCount - 1) * gridGap) / columnsCount;

    return <>
        {splitArrayIntoChunks(getAllPuzzlesWithDefaultParams(), columnsCount).map((row, rowIndex) => <div
            key={rowIndex}
            style={{
                display: "flex",
                columnGap: gridGap,
                marginTop: rowIndex ? gridGap : 0,
            }}
        >
            {row.map(puzzle => <PuzzlesListItem
                key={`item-${puzzle.slug}`}
                puzzle={puzzle}
                width={itemWidth}
            />)}

            {indexes(columnsCount - row.length).map(index => <PuzzlesListItemSpace key={`space-${index}`}/>)}
        </div>)}
    </>;
};
