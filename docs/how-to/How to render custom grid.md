# How to render custom grid

Recommended pre-requisite reading: [Puzzle rendering](../Puzzle%20rendering.md).

By default, the puzzle grid is a rectangle that consists of square cells.

There are several techniques for customizing the grid shape.

## Rendering non-square cells

1. Define the cells array of the size that matches the number of custom cells.
   It's usually easier to just make the cells array 1-dimensional (i.e. one "row" of cells)
   if the terms of "rows" and "columns" don't make sense for the custom grid's shape.
2. Add `customCellBounds` property to the [puzzle definition](../../src/types/puzzle/PuzzleDefinition.ts) object
   to define non-square cell shapes for the puzzle.
   It's a map of [`CustomCellBounds`](../../src/types/puzzle/CustomCellBounds.ts) objects
   that describe the list of cell border polygon points
   and the area of the cell where the user could write digits, pencilmarks and pen tool's X/O marks.
3. Modify the value of [`PuzzleDefinition.gridSize.gridSize`](../../src/types/puzzle/GridSize.ts)
   to fully cover all custom cells.
4. It usually makes sense to also set the value of
   [`PuzzleTypeManager.ignoreRowsColumnCountInTheWrapper`](../../src/types/puzzle/PuzzleTypeManager.ts)
   to `true` to indicate that `gridSize.rowsCount` and `gridSize.columnsCount`
   are not related to the rendered grid's size.
5. Carefully review which pen tool modes should be allowed for the puzzle.
6. By default, the platform will handle arrow navigation between the cells naively
   based on the cell positions and neighborhood relationships.
   But you can apply a custom arrow navigation handler by defining
   [`PuzzleTypeManager.processArrowDirection`](../../src/types/puzzle/PuzzleTypeManager.ts)
   if you know how to do it better for the particular puzzle or puzzle genre.
   You can always fall back to the default handler by using the `defaultProcessArrowDirection()` function.
7. Support custom cell bounds in the [constraint](../../src/types/puzzle/Constraint.ts) renderers used in the puzzle:
   use the `renderSingleCellInUserArea` flag for constraints that should be rendered in a cell center or on a border between 2 cells,
   access the custom cell bounds from the puzzle definition and support them manually in other constraints
   (see [arrow](../../src/components/puzzle/constraints/arrow/Arrow.tsx) for example).

## Transforming (moving/scaling/rotating/skewing) parts of the grid

There are cases when the grid could be composed of multiple cell regions with move/scale/rotate/skew transformations.
For instance, a [cube grid](../../src/puzzleTypes/cube/types/CubeTypeManager.ts) could be split into 3 skewed faces,
[infinite loop grid](../../src/puzzleTypes/infinite-rings/types/InfiniteRingsTypeManager.ts)
is a combination of ring-like cell regions with different scale transformations,
and a [jigsaw puzzle](../../src/puzzleTypes/jigsaw/types/JigsawTypeManager.ts)
defines an individual move transformation for each jigsaw piece.
And here's how to implement it:

1. Define [`PuzzleTypeManager.getRegionsWithSameCoordsTransformation`](../../src/types/puzzle/PuzzleTypeManager.ts) function
   to describe how to split all cells of the puzzle into regions with different coordinate transformations.
   The function must return an array of [`GridRegion`](../../src/types/puzzle/GridRegion.ts) objects.
   The object might contain many optional flags, but the most important aspect of it
   is to define the rectangle that covers the region of the source cells,
   and the list of the source cells if some cells in the beforementioned rectangle must be skipped.
2. Define [`PuzzleTypeManager.transformCoords`] function to describe how the coordinates of the source cells map to the transformed coordinates.
   There are two ways to implement it:
    1. (deprecated) Manually identify which region the source coordinate belongs to in the `transformCoords()` implementation,
       and return the transformed coordinate based on that.
    2. (recommended) Define the `transformCoords` function for every `GridRegion` object returned from `getRegionsWithSameCoordsTransformation`,
       and use the `transformCoordsByRegions` helper function for `PuzzleTypeManager.transformCoords`.
3. Modify the value of [`PuzzleDefinition.gridSize.gridSize`](../../src/types/puzzle/GridSize.ts)
   to fully cover all transformed regions.
4. It usually makes sense to also set the value of
   [`PuzzleTypeManager.ignoreRowsColumnCountInTheWrapper`](../../src/types/puzzle/PuzzleTypeManager.ts)
   to `true` if `gridSize.rowsCount` and `gridSize.columnsCount` values
   are no longer related to the rendered grid's size.
5. Implement [`PuzzleTypeManager.processArrowDirection`](../../src/types/puzzle/PuzzleTypeManager.ts)
   to define custom arrow navigation handler.
   In the implementation, handle the navigation between the edges of transformed regions manually
   (because the platform will not automatically understand which transformed regions are connected),
   and fall back to the default handler by using the `defaultProcessArrowDirection()` function for other cases.
   If the transformed regions have rotation/skew transformations significant enough
   for the default arrow navigation to make no sense, the manual implementation should compensate for that as well.
6. Implement [`PuzzleTypeManager.getCellCornerClones`](../../src/types/puzzle/PuzzleTypeManager.ts)
   to describe inter-region connections between the cells
   (important for drawing lines with the pen tool, and for some other things).
7. Implement a custom grid wrapper component if you need to render something not related to the transformed regions.
8. If the transformed regions rotate the cell contents too much, then implement
   [`PuzzleTypeManager.processCellDataPosition`](../../src/types/puzzle/PuzzleTypeManager.ts)
   to compensate the rotation for the digits and pencilmarks in the cell.
9. Implement [`PuzzleTypeManager.getRegionsForRowsAndColumns`](../../src/types/puzzle/PuzzleTypeManager.ts)
   if the puzzle has rows and columns that should have unique cell values.
10. There's usually no additional effort required to support constraint rendering in the transformed regions,
    but if there are cross-region constraints then it might be required
    to split them into "data validation constraint" object (same constraint, but with `component` property undefined)
    and several "visual representation constraint" objects for each transformed region
    (render the part of the constraint for one transformed region and one cell outside the region,
    and disable the data validation by using the `toDecorativeConstraint` helper function).
    See examples in the [spark puzzles](../../src/data/puzzles/Spark.tsx).

See [`SparkTypeManager`](../../src/puzzleTypes/spark/types/SparkTypeManager.ts) for example.

## Non-linear coordinate transformations

Coordinate transformations that can't be described as a combination of
moving, scaling, rotating and skewing are out of scope of the article.

An example could be found in [GoogleMapsTypeManager](../../src/puzzleTypes/google-maps/types/GoogleMapsTypeManager.ts), though.
