# Data structures and types

The key types for defining puzzles and managing their state are:

- [`PuzzleTypeMap`](../src/types/puzzle/PuzzleTypeMap.ts), a.k.a. `PTM` -
  type map that fully defines all typings of a puzzle:
  cell data type, puzzle data extensions, state type extensions.
- [`PuzzleDefinition`](../src/types/puzzle/PuzzleDefinition.ts) - defines one concrete puzzle
  (but not the puzzle solving state - see [`GameState`](../src/types/puzzle/GameState.ts) for that).
- [`PuzzleTypeManager`](../src/types/puzzle/PuzzleTypeManager.ts) -
  defines all aspects of handling puzzles' genre (e.g. infinite loop sudoku):
  what's the possible contents of a cell, how to render it, how to render a custom grid, how to import the grid from Sudoku Maker,
  what are additional solving states and how to handle them, and many more things.
- [`GameState`](../src/types/puzzle/GameState.ts), [`GridStateHistory`](../src/types/puzzle/GridStateHistory.ts),
  [`GridState`](../src/types/puzzle/GridState.ts), [`CellState`](../src/types/puzzle/CellState.ts) -
  solving states of the whole puzzle and of its parts.
- [`PuzzleContext`](../src/types/puzzle/PuzzleContext.ts) -
  unified object that holds everything needed for rendering the puzzle solving page:
  puzzle definition, puzzle solving state, page's UI elements and properties.
- [`Constraint`](../src/types/puzzle/Constraint.ts) - defines one constraint (clue) in a puzzle:
  how to render it on the grid, and how to validate the affected cells.

## [`PuzzleTypeMap`](../src/types/puzzle/PuzzleTypeMap.ts) (a.k.a. `PTM`)

All types related to puzzles (`PuzzleDefinition`, `PuzzleContext`, etc.) have many type parameters that define various extension types:

- Cell data type - the type of the main data that could be stored in a cell (not counting cell coloring and the pen tool).
  For regular sudoku, it's just `number`, since the content of a sudoku cell is a digit.
  But the platform allows putting anything into a cell: a chess piece, a picture of an animal from a given set,
  a digit that was rotated by a certain angle, and the list goes on.
  See the "`PuzzleTypeManager`" section below for more info about how to support custom cell data type.
- Puzzle extension type - which additional data is stored on the [puzzle definition](../src/types/puzzle/PuzzleDefinition.ts).
  For instance, [jigsaw puzzles](../src/puzzleTypes/jigsaw/types/JigsawPuzzleEx.ts) store the list of all jigsaw pieces,
  [sokoban puzzles](../src/puzzleTypes/sokoban/types/SokobanPuzzleExtension.ts)
  store the list of cages and the starting position of the sokoban player, etc.
- Game state extension type and grid state extension type -
  which additional data needs to be stored in the React state to maintain the puzzle solving page.
  For instance, rush hour puzzles store [the current positions of the cars](../src/puzzleTypes/rush-hour/types/RushHourGridState.ts)
  and [user's selected choice for hiding the cars or not](../src/puzzleTypes/rush-hour/types/RushHourGameState.ts),
  ["find the 3" puzzles](../src/puzzleTypes/find3/types/Find3GridState.ts) store the current number of available gifts
  and which cells the user applied the gifts to, etc.
  See the "Puzzle solving state types" section below to learn more about the puzzle solving states
  and about the difference between _game_ state extension and _grid_ state extension.

Dragging all these type parameters in each type definition and
remembering what's the correct set of type parameters for a certain puzzle genre would be a nightmare, e.g.

```typescript
interface PuzzleDefinition<CellType, GameStateExType = {}, GridStateExType = {}, PuzzleExType = {}> {
    // ...
    extension?: PuzzleExType;
    initialDigits?: CellsMap<CellType>;
    items?: Constraint<CellType, GameStateExType, GridStateExType, PuzzleExType, any>[] | ((context: PuzzleContext<CellType, GameStateExType, GridStateExType, PuzzleExType>) => Constraint<CellType, GameStateExType, GridStateExType, PuzzleExType, any>[]);
    // ...
}
```

To avoid that, all these type parameters were grouped into a single "type map" interface - `PuzzleTypeMap` (usually referred to as `PTM`),
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

The "extension" parts of the type map could usually be stacked on top of each other
to combine multiple genres and constraints.
For instance, if there's a multi-stage rush hour puzzle with rotatable clues,
then the puzzle extension would be combination of `RushHourPuzzleExtension` and `RotatableCluesPuzzleExtension`,
the game state extension would be combination of `RushHourGameState`, `MultiStageGameState` and `RotatableCluesGameState`,
and the grid state extension would combine `RushHourGridState` and `RotatableCluesGridState`.  
That's why `PTM` definitions for a genre or constraint usually don't assume that they will be applied to just a basic sudoku,
but instead they define how to extend any other `PTM` to support the genre/constraint,
using the helpers from [`PuzzleTypeManagerPlugin`](../src/types/puzzle/PuzzleTypeManagerPlugin.ts), e.g.

```typescript
export type SlideAndSeekPTM<T extends AnyPTM> = AddPuzzleEx<T, SlideAndSeekPuzzleExtension>;

export type ToMultiStagePTM<T extends AnyPTM> = AddGameStateEx<T, MultiStageGameState>;
```

See the "`PuzzleTypeManager`" section below for more information on how to stack extensions on top of each other.

## [`PuzzleTypeManager`](../src/types/puzzle/PuzzleTypeManager.ts)

TBD...

## Puzzle solving state types

TBD...

## [`PuzzleContext`](../src/types/puzzle/PuzzleContext.ts)

TBD...

## [`Constraint`](../src/types/puzzle/Constraint.ts)

TBD...
