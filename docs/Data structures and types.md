# Data structures and types

The key types for defining puzzles and managing their state are:

- `PuzzleTypeMap`, a.k.a. `PTM` - type map that fully defines all typings of a puzzle:
  cell data type, puzzle data extensions, state type extensions.
- `PuzzleDefinition` - defines one concrete puzzle (but not the puzzle solving state - see `GameState` for that).
- `PuzzleTypeManager` - defines all aspects of handling puzzles' genre (e.g. infinite loop sudoku):
  what's the possible contents of a cell, how to render it, how to render a custom grid, how to import the grid from Sudoku Maker,
  what are additional solving states and how to handle them, and many more things.
- `GameState`, `GridStateHistory`, `GridState`, `CellState` - solving states of the whole puzzle and of its parts.
- `PuzzleContext` - unified object that holds everything needed for rendering the puzzle solving page:
  puzzle definition, puzzle solving state, page's UI elements and properties.
- `Constraint` - defines one constraint (clue) in a puzzle: how to render it on the grid, and how to validate the affected cells.

## [`PuzzleTypeMap`](../src/types/puzzle/PuzzleTypeMap.ts) (a.k.a. `PTM`)

All types related to puzzles (`PuzzleDefinition`, `PuzzleContext`, etc.) have many type parameters that define various extension types:
the type of data in the cell, the type of additional data in the puzzle definition, the type of additional data in the puzzle solving state, etc.
Dragging all these type parameters in each type definition would be a nightmare, e.g.

```typescript
interface PuzzleDefinition<CellType, GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> {
    // ...
    extension?: PuzzleExType;
    initialDigits?: CellsMap<CellType>;
    items?: Constraint<CellType, GameStateExType, GridStateEx, PuzzleExType, any>[] | ((context: PuzzleContext<CellType, GameStateExType, GridStateEx, PuzzleExType>) => Constraint<CellType, GameStateExType, GridStateEx, PuzzleExType, any>[]);
    // ...
}
```

To avoid that, all these type parameters were grouped into a single "type map" interface - `PuzzleTypeMap` (usually referred as `PTM`),
and individual type parameters can be referred as its properties.
For instance, the previous example now looks like this:

```typescript
interface PuzzleDefinition<T extends AnyPTM> {
    // ...
    extension?: T["puzzleEx"];
    initialDigits?: CellsMap<T["cell"]>;
    items?: Constraint<T, any>[] | ((context: PuzzleContext<T>) => Constraint<T, any>[]);
    // ...
}
```

## `PuzzleDefinition`

## `PuzzleTypeManager`

## Puzzle solving state types

## `PuzzleContext`

## `Constraint`
