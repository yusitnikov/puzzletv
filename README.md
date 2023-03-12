# Puzzle TV

A web application for creating and solving different types of sudoku.

## TODO/TOFIX
| Type | Easy? |  Important?  | Task                                                                      |
|:----:|:-----:|:------------:|---------------------------------------------------------------------------|
| Feat | Easy  |  Must have   | Fully import the cubedoku pack.                                           |
| Feat |  Mid  |  Must have   | Letters.                                                                  |
| Feat | Hard  |  Must have   | Undo/redo via network.                                                    |
| Bug  | Easy  |  Important   | Toggling actions shouldn't cancel each other via network.                 |
| Feat | Easy  |  Important   | Timer.                                                                    |
| Bug  |  Mid  |  Important   | Infinity loop - highlight conflicts only for currently visible clues.     |
| Feat |  Mid  |  Important   | Help button (for mobile users - they can't see the titles!).              |
| Bug  | Easy  | Nice to have | Ctrl+Z to select the previous selection.                                  |
| Feat | Easy  | Nice to have | Visual tooltips on the grid when hovering/clicking specific sudoku rules. |
| Feat |  Mid  | Nice to have | Multiple color palettes that could be used simultaneously.                |
| Feat |  Mid  |   Design?    | Color selection modes.                                                    |
| Bug  |  Mid  |   Won't do   | Do something with the Ctrl+N bug for the knight (maybe use Alt instead?). |

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
