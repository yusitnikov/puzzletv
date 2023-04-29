import {useEffect, useMemo, useState} from "react";
import {useWindowSize} from "../../hooks/useWindowSize";
import {headerPadding} from "./globals";
import {getAllPuzzlesForPreview} from "../../data/puzzles/AllPuzzles";
import {PuzzlesListItem} from "./PuzzlesListItem";
import {useRaf} from "../../hooks/useRaf";
import {useLastValueRef} from "../../hooks/useLastValueRef";

const gridGap = headerPadding;

interface PuzzlesListProps {
    onLoaded?: () => void;
}

export const PuzzlesList = ({onLoaded}: PuzzlesListProps) => {
    const {width: windowWidth} = useWindowSize();
    const innerWidth = windowWidth - headerPadding * 2;
    const columnsCount = Math.max(Math.round(innerWidth / 400), 1);
    const itemWidth = (innerWidth - (columnsCount - 1) * gridGap) / columnsCount;

    const puzzles = useMemo(getAllPuzzlesForPreview, []);

    const [visiblePuzzlesCount, setVisiblePuzzlesCount] = useState(0);
    useRaf(() => setVisiblePuzzlesCount(Math.min(visiblePuzzlesCount + 1, puzzles.length)));
    const loaded = visiblePuzzlesCount >= puzzles.length;
    const onLoadedRef = useLastValueRef(onLoaded);
    useEffect(() => {
        if (loaded) {
            onLoadedRef.current?.();
        }
    }, [loaded, onLoadedRef]);

    return <div style={{
        display: "grid",
        gap: gridGap,
        gridTemplateColumns: "minmax(0, 1fr) ".repeat(columnsCount),
    }}>
        {puzzles.map((puzzle, puzzleIndex) => <PuzzlesListItem
            key={`item-${puzzle.slug}`}
            puzzle={puzzle}
            width={itemWidth}
            hide={puzzleIndex >= visiblePuzzlesCount}
        />)}
    </div>;
};
