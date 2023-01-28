import {useMemo, useState} from "react";
import {useWindowSize} from "../../hooks/useWindowSize";
import {headerPadding} from "./globals";
import {getAllPuzzlesWithDefaultParams} from "../../data/puzzles/AllPuzzles";
import {splitArrayIntoChunks} from "../../utils/array";
import {indexes} from "../../utils/indexes";
import {PuzzlesListItem, PuzzlesListItemSpace} from "./PuzzlesListItem";
import {useRaf} from "../../hooks/useRaf";

const gridGap = headerPadding;

export const PuzzlesList = () => {
    const {width: windowWidth} = useWindowSize();
    const innerWidth = windowWidth - headerPadding * 2;
    const columnsCount = Math.max(Math.round(innerWidth / 400), 1);
    const itemWidth = (innerWidth - (columnsCount - 1) * gridGap) / columnsCount;

    const puzzles = useMemo(() => [...getAllPuzzlesWithDefaultParams().entries()], []);

    const [visiblePuzzlesCount, setVisiblePuzzlesCount] = useState(0);
    useRaf(() => setVisiblePuzzlesCount(Math.min(visiblePuzzlesCount + 1, puzzles.length)));

    return <>
        {splitArrayIntoChunks(puzzles, columnsCount).map((row, rowIndex) => <div
            key={rowIndex}
            style={{
                display: "flex",
                columnGap: gridGap,
                marginTop: rowIndex ? gridGap : 0,
            }}
        >
            {row.map(([puzzleIndex, puzzle]) => <PuzzlesListItem
                key={`item-${puzzle.slug}`}
                puzzle={puzzle}
                width={itemWidth}
                hide={puzzleIndex >= visiblePuzzlesCount}
            />)}

            {indexes(columnsCount - row.length).map(index => <PuzzlesListItemSpace key={`space-${index}`}/>)}
        </div>)}
    </>;
};
