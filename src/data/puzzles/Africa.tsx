import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Chameleon} from "../authors";
import {GoogleMapsFieldWrapper} from "../../sudokuTypes/google-maps/components/GoogleMapsFieldWrapper";
import {GoogleMapsState} from "../../sudokuTypes/google-maps/types/GoogleMapsState";
import {
    AfricaCountriesAreas,
    AfricaCountriesBounds,
    AfricaCountriesEnum
} from "./africa-data/AfricaCountries";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {processGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {latLngLiteralToPosition} from "../../sudokuTypes/google-maps/utils/googleMapsCoords";
import {CustomCellBounds} from "../../types/sudoku/CustomCellBounds";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {OddConstraint} from "../../components/sudoku/constraints/odd/Odd";
import {GoogleMapsTypeManager} from "../../sudokuTypes/google-maps/types/GoogleMapsTypeManager";

export const Africa: PuzzleDefinition<number, GoogleMapsState> = {
    slug: "africa",
    title: {
        [LanguageCode.en]: "Africa",
    },
    author: Chameleon,
    rules: () => <>
        <RulesParagraph>Put digits from 1 to 5 to each country of Africa, except for the islands.</RulesParagraph>
        <RulesParagraph>Neighbors (2 countries that share a border) can't contain the same digit.</RulesParagraph>
        <RulesParagraph>There are exactly 9 pairs of neighbors that have either consecutive digits or digits in a 1:2 ratio (or both).</RulesParagraph>
        <RulesParagraph>The product of all digits on the map (i.e. all digits multiplied together) ends with nine zeros.</RulesParagraph>
        <RulesParagraph>Countries that end with a consonant letter have an odd digit.</RulesParagraph>
        <RulesParagraph>Clarifications about neighborhood:</RulesParagraph>
        <RulesUnorderedList>
            <li>Zambia and Botswana <u>are</u> neighbors.</li>
            <li>Namibia and Zimbabwe <u>are not</u> neighbors.</li>
            <li>Republic of the Congo and Angola <u>are</u> neighbors (Angola has one small "extra piece").</li>
            <li>Enlarge the map if in doubt of any other neighborhood.</li>
        </RulesUnorderedList>
    </>,
    typeManager: GoogleMapsTypeManager(DigitSudokuTypeManager()),
    fieldWrapperComponent: GoogleMapsFieldWrapper({
        west: -7.5,
        east: 41.5,
        south: -25,
        north: 27,
    }),
    fieldFitsWrapper: true,
    fieldSize: {
        fieldSize: 9,
        rowsCount: 1,
        columnsCount: 49,
        regions: [],
    },
    digitsCount: 5,
    customCellBounds: processGivenDigitsMaps(
        ([bordersLatLng], {left: index}): CustomCellBounds => ({
            borders: bordersLatLng.map((border) => border.map(latLngLiteralToPosition)),
            userArea: AfricaCountriesAreas[index as AfricaCountriesEnum],
        }),
        [{0: AfricaCountriesBounds}]
    ),
    items: [
        {
            name: "neighbors",
            cells: [],
            props: undefined,
            isValidCell({top, left}, digits, regionCells, {puzzle, cellsIndex, state}): boolean {
                const digit = digits[top][left]!;

                const {neighbors} = cellsIndex.allCells[top][left];

                for (const neighbor of neighbors.items) {
                    const digit2 = digits[neighbor.top]?.[neighbor.left];

                    if (digit2 !== undefined && puzzle.typeManager.areSameCellData(digit, digit2, state, true)) {
                        return false;
                    }
                }

                return true;
            },
        },
        OddConstraint({top: 0, left: AfricaCountriesEnum.Egypt}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Niger}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Chad}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Sudan}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Senegal}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Benin}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Cameroon}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.CentAfrRep}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.SouthSudan}, false),
        OddConstraint({top: 0, left: AfricaCountriesEnum.Gabon}, false),
    ],
    resultChecker: (context) => {
        if (!isValidFinishedPuzzleByConstraints(context)) {
            return false;
        }

        const digits = gameStateGetCurrentFieldState(context.state).cells[0].map(({usersDigit}) => usersDigit!);
        const cellInfos = context.cellsIndex.allCells[0];

        let product = 1;
        let dots = 0;

        for (const [index, digit] of digits.entries()) {
            product = (product * digit) % 1000000000;

            for (const neighbor of cellInfos[index].neighbors.items) {
                const digit2 = digits[neighbor.left];

                if (Math.abs(digit - digit2) === 1 || digit === digit2 * 2 || digit2 === digit * 2) {
                    dots++;
                }
            }
        }

        // Dots are counted twice
        return product === 0 && dots === 18;
    },
    enableDragMode: true,
    // TODO: allowDrawing: ["border-mark"],
};
