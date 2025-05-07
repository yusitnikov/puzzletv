# Puzzle rendering

Puzzle TV can render puzzles that form a grid of some sort - a set of polygonal cells.
And solving the puzzle usually means interacting with these cells:
writing data into them (usually digits, but not necessarily), coloring them, drawing lines over cell centers and borders.

The puzzle solving page's layout consist of puzzle grid area and a sidebar with rules and tool buttons.

The [`Puzzle`](../src/components/sudoku/puzzle/Puzzle.tsx) component initializes the "puzzle context" (controls the solving state),
calculates the position of the grid area and of the sidebar area,
and renders the relevant components there.
The [`Field`](../src/components/sudoku/field/Field.tsx) component renders the puzzle grid,
and the [`SidePanel`](../src/components/sudoku/side-panel/SidePanel.tsx) component renders the side panel.
This article covers rendering the grid, including:

- Cell borders.
- Cell contents (digits, colors, pencilmarks).
- Constraint clues.
- Lines drawn with the pen tool.
- Other interactive elements.

## DOM layers and positioning

Most of the grid is rendered as a part of SVG image.
But there are some non-SVG layers before it that control the layout and allow customizations.

### Non-SVG layers

The outer layer of the grid is an absolutely positioned wrapper div that takes the whole square of the area dedicated to the puzzle's grid.
Note: the grid's container is always a square (even if the puzzle itself is rectangular)
in order to make the layout consistent, so that content creators don't have to redefine their OBS scenes for each puzzle.
The topmost wrapper div also captures mouse gestures that are applied to the whole grid (like panning/zooming the puzzle).

The next layer of the grid is an optional `FieldWrapper` component defined on the
[type manager level](./Data%20structures%20and%20types.md) in the `fieldWrapperComponent` field.
By default, it's a pass-though component that renders the children without any modifications,
but puzzles can redefine it to render custom wrapper div for the puzzle and change the DOM structure a bit.
Examples:

- [Elephant slitherlink](../src/data/puzzles/Slitherlink.tsx) puzzle uses custom wrapper to add a background image behind the grid.
- [Africa](../src/data/puzzles/Africa.tsx) puzzle uses it to render the puzzle as a layer in Google Maps.

Next to the `FieldWrapper`, there's an additional optional component that could be rendered by the
[type manager](./Data%20structures%20and%20types.md) - `FieldControls`, defined on type manager's `fieldControlsComponent` field.
The purpose of this component is to render puzzle-specific control buttons that are not related to specific cells, but to the whole grid.
Examples:

- [Rotatable cube](../src/sudokuTypes/cube/components/FullCubeControls.tsx) puzzles uses it to render cube rotation buttons outside the grid.
- [Infinite ring](../src/sudokuTypes/infinite-rings/components/InfiniteRingsFieldControls.tsx) type manager uses it to
  draw thick grid borders and render zoom buttons in the center of grid.

The next layer inside the field wrapper is the absolutely positioned and possibly rotated and scaled div
that applies transformations created by panning, rotating and zooming the grid (if applicable).
But it's possible to cancel some of these automatic panning and scale (zoom) effects by using the
`fieldFitsWrapper` and `fieldWrapperHandlesScale` flags on the type manager and
to implement panning and scaling manually in the field wrapper component (see above)
or by applying custom transformations to the grid from `getRegionsWithSameCoordsTransformation()` and `transformCoords()` methods.
For instance:

- [Google Maps type manager](../src/sudokuTypes/google-maps/types/GoogleMapsTypeManager.ts)
  enables `fieldFitsWrapper` because panning and zooming is handled by the Google Maps widget.
- [Infinite rings type manager](../src/sudokuTypes/infinite-rings/types/InfiniteRingsSudokuTypeManager.ts)
  enables `fieldWrapperHandlesScale` because zooming is handled by custom transformations of the ring regions.

### SVG layers

And finally, the direct child of the transformations layer is the SVG tag
that contains most of the grid shapes and handles interactions with the cells.

#### Main SVG tag

The main SVG tag is rendered by the [`FieldSVG`](../src/components/sudoku/field/FieldSvg.tsx) component.

By default, it's positioned and transformed in a way that
the coordinate system inside SVG begins in the top-left corner of the grid not counting the margins
(i.e. the top-left corner of the top-left cell of the grid),
and the cell is a 1x1 square (unless custom cell bounds are applied).
Re-defining the SVG coordinate system this way can be cancelled
by enabling the `SudokuTypeManager.fieldFitsWrapper` flag.

Also, by default the puzzle is positioned in the center of the grid's square
according to the `PuzzleDefinition.fieldSize` values.
It makes sense for puzzles with regular rectangular grid that consists of 1x1 square cells.
For such puzzles, `PuzzleDefinition.fieldSize.fieldSize` should be the maximum value of
`PuzzleDefinition.fieldSize.rowsCount` and `PuzzleDefinition.fieldSize.columnsCount`,
and the cell's indexes in the 2-dimensional array directly correspond to the cell's coordinates in the SVG.
However, grids with custom cell bounds and/or grid transformations usually mean
that cell's indexes in the array are not directly related to the cell's coordinates,
so centering the puzzle automatically based on the array's dimensions doesn't make much sense.
In these cases, automatic centering could be cancelled
by enabling the `SudokuTypeManager.ignoreRowsColumnCountInTheWrapper` flag,
and the base of the SVG coordinates system will be located in the top-left corner of the grid's area.

#### Coordinate transformation regions

One way of customizing grid UI is to divide into several rectangular regions
and apply different coordinate transformations (translating, scaling, rotating, skewing) to each region.

The way to define these regions and transformations is to implement
`getRegionsWithSameCoordsTransformation()` and `transformCoords()` methods on the type manager:

- `getRegionsWithSameCoordsTransformation()` returns the list of regions -
  rectangles or arrays of source cells that are going to be transformed.
- `transformCoords()` maps source coordinates to transformed coordinates.
  Note that it must be a linear transformation - `(x, y) -> (ax + by +c, dx + ey + f)`.

It's also possible to define the `transformCoords()` prop on each region returned from `getRegionsWithSameCoordsTransformation()`,
and then use `transformCoordsByRegions()` helper to implement the `transformCoords()` method on the type manager.

The component that renders these regions is
[`FieldRegionsWithSameCoordsTransformation`](../src/components/sudoku/field/FieldRegionsWithSameCoordsTransformation.tsx),
and it's a direct child of `FieldSVG` in the DOM structure.
The component goes over all regions, and renders the whole grid into each of them,
using SVG clipping to hide the parts that go outside the region.

But there are cases when it's necessary to disable clipping and draw something outside the regions,
e.g. JSS clues related to the region.
In this case, the constraint could use special `noClip` layer that is being rendered with no clipping by region.
But constraints that do that are responsible to check what's the context region when they get rendered,
and render only graphics related to this specific region.
See [`Jss`](../src/sudokuTypes/jss/constraints/Jss.tsx) for usage example.

The `FieldRegionsWithSameCoordsTransformation` component applies two coordinate transformations to the contents:

1. First, it applies the transformation defined by the `transformCoords()` method,
   so that the coordinates' base would be moved to the top-left corner of the transformed region.
2. Then, it applies a backward translate transformation by the amount
   of the top-left corner of the source region (before the transformation),
   so that the top-left corner of the region will have the same coordinates as it did before the transformation.

This way, the transformation remains transparent to the components that render all the graphics -
they can act like there's no transformation at all and just do their job as usual.

#### Field layers

Inside each transformation region, the grid contents are rendered in several layers -
see [`FieldLayer`](../src/types/sudoku/FieldLayer.ts) enum.
These layers are used to control what would be rendered behind, and what would be rendered on top
(SVG doesn't support `z-index` CSS property, unfortunately).

The best way to learn which layers are supported and in which order they go
is to just look in the source code of the [`Field`](../src/components/sudoku/field/Field.tsx) component.

Most of the layers are rendering constraints' visual clues that are defined on
[`Constraint.component`](../src/types/sudoku/Constraint.ts).
Other are rendering cells and their contents: background, digits, selection indication, pen tool's marks.
The topmost layers are rendering interactive elements that could be clicked/dragged with the mouse.

Let's look at each of above in more details.

##### Rendering constraints

Each visual constraint defines the [`component`](../src/types/sudoku/Constraint.ts) field,
which is a set of React components mapped by [field layers](../src/types/sudoku/FieldLayer.ts).
For each layer, the `Field` component collects all constraints that have a mapping for the layer, and render all of them one by one.

The properties being passed to each component are defined in [`ConstraintProps`](../src/types/sudoku/Constraint.ts) and include:

- All fields of the constraint object that is being rendered.
- [Puzzle context](./Data%20structures%20and%20types.md) object.
- The object and the index of the region that is being rendered (see the "Coordinate transformation regions" section above).

So, usually the component will get the coordinates and styles of the constraint from the constraint object's field for rendering static elements,
and get the puzzle's solving state for rendering dynamic elements.

Most of the field layers ignore all pointer events, so constraints with interactive elements should render them
in the [`interactive` field layer](../src/types/sudoku/FieldLayer.ts).

By default, the constraint's React component is responsible for supporting custom cell bounds (non-square cells in random positions).
However, if the constraint is designed to render something only in the center of a single cell, or on the border between two adjacent cells,
it could enable the `renderSingleCellInUserArea` flag to indicate that.
When enabled, single cell constraints will be automatically rendered in the cell's user area
(the main area of the cell where the user can write the digit and pencilmarks, see the "Rendering grid cells" section below)
by applying the [`SingleCellFieldItemPositionFix`](../src/components/sudoku/field/SingleCellFieldItemPositionFix.tsx) wrapper,
and two-cell ("domino") constraints are being rendered between the two cells.
Both for single-cell and for two-cell constraints, the platform takes care of applying all coordinate transformations (translating, scaling, rotating),
and for the React component that renders the constraint everything looks like it's getting a regular 1x1 cell.

##### Rendering grid cells

There are two supported cell types in Puzzle TV:

1. Regular cells - each cell is a 1x1 square located according to its indexes in the 2-dimensional cells' array.
   That's the default mode.
2. Cells with custom bounds - each cell is a polygon with coordinates defined in the `customCellBounds` field
   on the [puzzle definition](./Data%20structures%20and%20types.md) object.
   The [`CustomCellBounds`](../src/types/sudoku/CustomCellBounds.ts) object defines not only the polygon of cell's borders,
   but also the "user area" - a rectangle (usually, a square) inside the cell to place digits and pencilmarks in.
   User area rectangle must be fully inside the cell's polygon.
   The same rectangle will be used as the area for rendering single-cell constraint clues.

Note: the user area of a regular cell is the whole cell.

The `Field` component uses the [`FieldCellsLayer`](../src/components/sudoku/field/FieldCellsLayer.tsx) component
to go over all cells in the grid/region and render each of them.
The component has several conditions for skipping cells that don't have to be rendered:
cells that don't belong to the currently rendered region, cells that out of the view box because of panning, etc.

The cell content renderers mostly use the [`FieldCellShape`](../src/components/sudoku/field/FieldCellShape.tsx) component
to render the cell's polygon (either to draw the cell's border or to clip some graphics by the cell's shape),
and the [`FieldCellUserArea`](../src/components/sudoku/field/FieldCellUserArea.tsx) component
to draw something in the cell's user area rectangle.

In order to support rotated and skewed grids and cells, [type manager](./Data%20structures%20and%20types.md)
may define the `processCellDataPosition` function that can re-arrange positions and angles
of the main digits and pencilmarks, for instance:

- [Cube](../src/sudokuTypes/cube/types/CubeTypeManager.ts),
  [monument valley](../src/sudokuTypes/monument-valley/types/MonumentValleyTypeManager.ts),
  [safe cracker](../src/sudokuTypes/safe-cracker/types/SafeCrackerSudokuTypeManager.ts) and other type managers
  use `processCellDataPosition()` to compensate for the rotation transformation that was applied to the cells
  and make the digits look vertical again.
- [rotatable digit](../src/sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager.ts) and
  [jigsaw](../src/sudokuTypes/jigsaw/types/JigsawSudokuTypeManager.ts) type managers
  use the function to re-arrange the pencilmarks when the grid or region is rotated,
  because the digit's value may change after rotation (e.g. 6 becomes a 9 after turning it upside-down),
  and the pencilmarks should be re-sorted according to the changed values.

The `processCellDataPosition()` function takes the default position of the digit or pencilmark,
and it should return the processed position. For simple transformations, it's enough.
But for the cases when the pencilmarks' order is going to be changed,
it also accepts data about the whole set of pencilmarks, the index of the current pencilmark in the set,
and the callback that returns default pencilmark's position according to the index in the set.
This way, the custom position handler can use the `getCellDataSortIndexes()` helper
to re-order the pencilmarks according to new sorting criteria
and know the index of the current pencilmark in the re-ordered set.

See the "Rendering interactive elements" section below to learn how Puzzle TV handles pointer events for cells.

##### Rendering pen tool's lines and marks

Pen tool lines and marks are being rendered by the
[`UserLines` constraint](../src/components/sudoku/constraints/user-lines/UserLines.tsx)
in the dedicated [field layers](../src/types/sudoku/FieldLayer.ts):

- Lines and marks that were already added to the grid are rendered in the `givenUserLines` layer.
- The line that the user is drawing right now (started drawing, but still holds the mouse down)
  is rendered in the `newUserLines` layer, as well as an indication of deleting the line segments in the process of doing it.

The reason for separating the above into different layers is to ensure
that the current user's action indication is never covered by existing lines.

##### Rendering interactive elements

Custom interactive elements that belong to certain cells are being rendered by constraints by implementing a component
in the [`interactive` field layer](../src/types/sudoku/FieldLayer.ts) - see the "Rendering constraints" section.

Custom interactive elements that do not belong to any cells are being rendered outside the SVG tag
by implementing `SudokuTypeManager.fieldControlsComponent`.

Core interactions with the cells (selecting the cells, drawing lines and marks over them etc.)
are implemented in the "mouse handler" field layer that goes right before the `interactive` layer
(see the "Rendering grid cells" section),
and it's handled by the [`FieldCellMouseHandler`](../src/components/sudoku/field/FieldCellMouseHandler.tsx) component.
The component renders multiple SVG shapes for different parts of the cell that handle pointer events independently,
in order to know which part of the cell was clicked by the user (center, border or corner).

For regular cells, it renders a 4x4 grid of equal cell part squares.
Not only it allows detecting corner clicks and border clicks easily,
but also it helps to select multiple cells more accurately by ignoring the corner parts of the cell.
For instance, if the user wants to select r1c1 and r2c2,
it's almost impossible not to go through a corner of r1c2 or r2c1 on a way.
Doing so shouldn't select the cells that were touched by accident.

For the cells with custom bounds, it renders one handler for the whole cell
and separate handlers for every border segment and corner.
Most of the cell interaction shapes are being clipped by the cell's shape
(using the [`FieldCellShape`](../src/components/sudoku/field/FieldCellShape.tsx) component),
but there's an additional layer of mouse handlers with no clipping for the cells on the grid's border
to support user gestures a little bit outside the grid.

##### Rendering toroidal grid

Each field layer is using the [`FieldLoop`](../src/components/sudoku/field/FieldLoop.tsx) component
to support looping (toroidal) grids by rendering all items of the layer multiple times with different offset.

##### Rendering the fog

The fog and the light bulbs are being rendered by the [`Fog`](../src/components/sudoku/constraints/fog/Fog.tsx) constraint
in the [`regular` field layer](../src/types/sudoku/FieldLayer.ts).

The way it renders the fog is to draw a grey rectangle over the whole grid
and apply an SVG mask that filters only fog cells.
It also re-draws all user's cell coloring over the fog, with the same SVG mask,
so the cell coloring is not hidden behind the fog, but it also doesn't reveal any other graphics behind the fog.

Since the fog is being rendered in the `regular` layer, and the cell selection indicators are usually behind it,
there's a special `prioritizeSelection` flag on the [puzzle definition](./Data%20structures%20and%20types.md) level
that moves the cell selection indicators to the front of the `regular` layer.
Puzzles with fog support should enable this flag (it happens automatically when importing from F-Puzzles and Sudoku Maker).
