# Sudoku

A web application for creating and solving different types of sudoku.

## TODO/TOFIX
| Type | Easy? |  Important?  | Task                                                                               |
|:----:|:-----:|:------------:|------------------------------------------------------------------------------------|
| Feat |  Mid  |  Must have   | Put X on a border.                                                                 |
| Feat |  Mid  |  Must have   | Draw lines between the cells.                                                      |
| Feat |  Mid  |  Must have   | Auto-detect and check regions based on user's borders and/or colors.               |
| Feat | Easy  |  Important   | Timer.                                                                             |
| Feat | Easy  |  Important   | Double-click on cell to select similar cells.                                      |
| Feat |  Mid  |  Important   | Help button (for mobile users - they can't see the titles!).                       |
| Mix  | Hard  |  Must have   | Keep the progress when refreshing/duplicating the tab + restart button.            |
| Feat | Hard  |  Must have   | Setter mode.                                                                       |
| Bug  |  Mid  |   Not sure   | Do something with the Ctrl+N bug for the knight (maybe use Alt instead?).          |
| Bug  | Easy  | Nice to have | Ctrl+Z to select the previous selection.                                           |
| Feat | Easy  | Nice to have | Visual tooltips on the grid when hovering/clicking specific sudoku rules.          |
| Bug  |  Mid  | Nice to have | Warn about the progress when navigating to another hash (possibly by history API). |
| Bug  |  Mid  | Nice to have | 2-color solid chess pieces with a normal font.                                     |

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
