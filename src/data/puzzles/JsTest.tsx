import { mergePuzzleItems, PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { SudokuMaker } from "./Import";
import { FogConstraint, FogRendererProps } from "../../components/sudoku/constraints/fog/Fog";
import { observer } from "mobx-react-lite";
import { AutoSvg } from "../../components/svg/auto-svg/AutoSvg";
import { indexes } from "../../utils/indexes";

const CustomFogRenderer = observer(function CustomFogRenderer({ context }: FogRendererProps<NumberPTM>) {
    // Get the current state of the puzzle
    const {
        puzzle,
        currentFieldStateWithFogDemo: { cells },
    } = context;

    const {
        solution,
        fieldSize: { rowsCount, columnsCount },
        typeManager: {
            getDigitByCellData,
            cellDataComponentType: { component: CellData },
        },
    } = puzzle;

    // Calculate which cells have correct digits according to the embedded solution
    const areCorrectDigits = cells.map((row, top) =>
        row.map(
            (cell, left) =>
                cell.usersDigit !== undefined &&
                (typeof solution?.[top]?.[left] !== "number" ||
                    getDigitByCellData(cell.usersDigit, context, { top, left }) === solution[top][left]),
        ),
    );

    /*
     * Render the custom fog.
     * The area covered by fog should be white (#fff), the visible are should be black (#000).
     * The canvas is an SVG tag that starts in the top left corner of the grid.
     * Cell size is 1.
     */
    return (
        <>
            <rect width={columnsCount} height={rowsCount} fill={"#fff"} strokeWidth={0} />

            {/* Go over all cells of the puzzle */}
            {indexes(rowsCount).flatMap((top) =>
                indexes(columnsCount).map(
                    (left) =>
                        areCorrectDigits[top][left] && (
                            // Offset the drawing context to the cell's position
                            <AutoSvg key={`${top}-${left}`} top={top} left={left}>
                                {/* Just an example - clear the fog in a cell with correct digit */}
                                <rect width={1} height={1} fill={"#000"} strokeWidth={0} />
                                {/* Just an example - clear the fog in the shape of the correct digit to the left from the cell */}
                                <CellData
                                    puzzle={puzzle}
                                    data={cells[top][left].usersDigit!}
                                    size={2}
                                    top={0.5}
                                    left={-0.5}
                                    customColor={"#000"}
                                />
                            </AutoSvg>
                        ),
                ),
            )}
        </>
    );
});

export const JsTest: PuzzleDefinitionLoader<NumberPTM> = {
    noIndex: true,
    slug: "jstest",
    loadPuzzle: () => {
        // Import a puzzle from Sudoku Maker
        const puzzle = SudokuMaker.loadPuzzle({
            load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQDMJADCADQgAOArgF7MA2KBoOcMnhAOV4oO6dAAJ0jACYQA1o1og4jBAAtoBEAFUccnBADuOcQEFVGqEoDGItugIBtUADc4bRvwDsAXxqv3TwIyPwCPfgBOUJA3cIIAVmjYoPwADiTA-gAmDLj8IlyUgBZC-gA2UoIS-xjMghya5P4Cxrr8ENa8is6UqJ7%2BdP6CXyH8RNHxsJTuqYHK-PmR2ar5vuX8BvWO9c3avOr1pb3p1fnt4-5Ji4IW9cH1meu0%2BaumldHbp6O3jbPT0bWT0%2BP3OP12P1ebXuTwOT0eP2%2BUJe81hCPm4La8LaoLagJ%2BwOx-we82hP1RbQJeUReUheQxeUpKWpKXpvT%2BE3mWLypLaJQAunRrLh0AgoHBMDgEA58M4QAgAJ70fiUaIKpU3OhQFAAc2wOGljkoNCNRqINDNZqyNCtVpNxvNDst1uddtNjudNpoZC9PqKND9fviNCDQe9Yf9EcDwej4e9AYjIejZRoyeTXho6fTqRo2ezqZTGcLWZzJfzaaLJdzfJ81Z8QA",
        }) as PuzzleDefinition<NumberPTM>;

        // Add the custom fog
        return {
            ...puzzle,
            prioritizeSelection: true,
            items: mergePuzzleItems(puzzle.items, [FogConstraint({ fogRenderer: CustomFogRenderer })]),
        };
    },
};
