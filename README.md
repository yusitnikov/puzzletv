# Sudoku

A web application for creating and solving different types of sudoku.

## TODO/TOFIX
| Type | Easy? |  Important?  | Task                                                                                 |
|:----:|:-----:|:------------:|--------------------------------------------------------------------------------------|
| Feat | Easy  |  Important   | Timer.                                                                               |
| Feat | Easy  |  Important   | Double-click on cell to select similar cells.                                        |
| Mix  | Easy  |  Important   | Improve selection when dragging the mouse diagonally (don't include unwanted cells). |
| Feat |  Mid  |  Important   | Checker.                                                                             |
| Mix  | Hard  |  Must have   | Keep the progress when refreshing/duplicating the tab + restart button.              |
| Feat | Hard  |  Must have   | Setter mode.                                                                         |
| Bug  |  Mid  |   Not sure   | Do something with the Ctrl+N bug for the knight (maybe use Alt instead?).            |
| Feat | Easy  | Nice to have | Visual tooltips on the grid when hovering/clicking specific sudoku rules.            |
| Bug  |  Mid  | Nice to have | Warn about the progress when navigating to another hash (possibly by history API).   |
| Bug  |  Mid  | Nice to have | 2-color solid chess pieces.                                                          |

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
