import {useEffect, useMemo, useState} from "react";
import {getAllPuzzlesForPreview} from "../../data/puzzles/AllPuzzles";
import {PuzzlesListItem} from "./PuzzlesListItem";
import {useRaf} from "../../hooks/useRaf";
import {useLastValueRef} from "../../hooks/useLastValueRef";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {Grid} from "../layout/grid/Grid";

interface PuzzlesListProps {
    onLoaded?: () => void;
}

export const PuzzlesList = observer(({onLoaded}: PuzzlesListProps) => {
    profiler.trace();

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

    return <Grid defaultWidth={400}>
        {(itemWidth) => puzzles.map((puzzle, puzzleIndex) => <PuzzlesListItem
            key={`item-${puzzle.slug}`}
            puzzle={puzzle}
            width={itemWidth}
            hide={puzzleIndex >= visiblePuzzlesCount}
        />)}
    </Grid>;
});
