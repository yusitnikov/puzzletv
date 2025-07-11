import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { Chameleon } from "../authors";
import { AfricaCountriesAreas, AfricaCountriesBounds, AfricaCountriesEnum } from "./africa-data/AfricaCountries";
import { isValidFinishedPuzzleByConstraints, toInvisibleConstraint } from "../../types/puzzle/Constraint";
import { processCellsMaps } from "../../types/puzzle/CellsMap";
import { latLngLiteralToPosition } from "../../puzzleTypes/google-maps/utils/googleMapsCoords";
import { CustomCellBounds } from "../../types/puzzle/CustomCellBounds";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { OddConstraint } from "../../components/puzzle/constraints/odd/Odd";
import { GoogleMapsTypeManager } from "../../puzzleTypes/google-maps/types/GoogleMapsTypeManager";
import { GoogleMapsPTM } from "../../puzzleTypes/google-maps/types/GoogleMapsPTM";
import { indexes } from "../../utils/indexes";
import { errorResultCheck, successResultCheck } from "../../types/puzzle/PuzzleResultCheck";

export const Africa: PuzzleDefinition<GoogleMapsPTM> = {
    noIndex: true,
    slug: "africa",
    extension: {},
    title: {
        [LanguageCode.en]: "Africa",
    },
    author: Chameleon,
    rules: () => (
        <>
            <RulesParagraph>Put digits from 1 to 5 to each country of Africa, except for the islands.</RulesParagraph>
            <RulesParagraph>Neighbors (2 countries that share a border) can't contain the same digit.</RulesParagraph>
            <RulesParagraph>
                There are exactly 9 pairs of neighbors that have either consecutive digits or digits in a 1:2 ratio (or
                both).
            </RulesParagraph>
            <RulesParagraph>
                The product of all digits on the map (i.e. all digits multiplied together) ends with nine zeros.
            </RulesParagraph>
            <RulesParagraph>Countries that end with a consonant letter have an odd digit.</RulesParagraph>
            <RulesParagraph>Clarifications about neighborhood:</RulesParagraph>
            <RulesUnorderedList>
                <li>
                    Zambia and Botswana <u>are</u> neighbors.
                </li>
                <li>
                    Namibia and Zimbabwe <u>are not</u> neighbors.
                </li>
                <li>
                    Republic of the Congo and Angola <u>are</u> neighbors (Angola has one small "extra piece").
                </li>
                <li>Enlarge the map if in doubt of any other neighborhood.</li>
            </RulesUnorderedList>
        </>
    ),
    typeManager: GoogleMapsTypeManager(DigitPuzzleTypeManager(), {
        west: -7.5,
        east: 41.5,
        south: -25,
        north: 27,
    }),
    gridSize: {
        gridSize: 9,
        rowsCount: 1,
        columnsCount: 49,
    },
    maxDigit: 5,
    customCellBounds: processCellsMaps(
        ([bordersLatLng], { left: index }): CustomCellBounds => ({
            borders: bordersLatLng.map((border) => border.map(latLngLiteralToPosition)),
            userArea: AfricaCountriesAreas[index as AfricaCountriesEnum],
        }),
        [{ 0: AfricaCountriesBounds }],
    ),
    items: [
        {
            name: "neighbors",
            cells: [],
            props: undefined,
            isValidCell(cell, digits, _cells, context): boolean {
                const digit = digits[cell.top][cell.left]!;

                const { puzzle, puzzleIndex } = context;

                const { neighbors } = puzzleIndex.allCells[cell.top][cell.left];

                for (const neighbor of neighbors.items) {
                    const digit2 = digits[neighbor.top]?.[neighbor.left];

                    if (
                        digit2 !== undefined &&
                        puzzle.typeManager.areSameCellData(digit, digit2, context, cell, neighbor)
                    ) {
                        return false;
                    }
                }

                return true;
            },
        },
        ...[
            AfricaCountriesEnum.Egypt,
            AfricaCountriesEnum.Niger,
            AfricaCountriesEnum.Chad,
            AfricaCountriesEnum.Sudan,
            AfricaCountriesEnum.Senegal,
            AfricaCountriesEnum.Benin,
            AfricaCountriesEnum.Cameroon,
            AfricaCountriesEnum.CentAfrRep,
            AfricaCountriesEnum.SouthSudan,
            AfricaCountriesEnum.Gabon,
        ].map((left: number) => toInvisibleConstraint(OddConstraint({ top: 0, left }))),
    ],
    resultChecker: (context) => {
        const result = isValidFinishedPuzzleByConstraints(context);
        if (!result.isCorrectResult) {
            return result;
        }

        const digits = indexes(context.puzzle.gridSize.columnsCount).map((left) => context.getCellDigit(0, left)!);
        const cellInfos = context.puzzleIndex.allCells[0];

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
        return product === 0 && dots === 18 ? successResultCheck(context.puzzle) : errorResultCheck();
    },
    // TODO: allowDrawing: ["border-mark"],
};
