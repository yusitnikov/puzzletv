import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {Chameleon} from "../authors";
import {GoogleMapsFieldWrapper} from "../../sudokuTypes/google-maps/components/GoogleMapsFieldWrapper";
import {GoogleMapsState} from "../../sudokuTypes/google-maps/types/GoogleMapsState";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";
import {emptyPosition, formatSvgPointsArray, Position} from "../../types/layout/Position";
import {
    AfricaCountriesAreas,
    AfricaCountriesBounds,
    AfricaCountriesEnum,
    AfricaCountriesNeighborsGraph
} from "./africa-data/AfricaCountries";
import {withFieldLayer} from "../../contexts/FieldLayerContext";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {Constraint, isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {processGivenDigitsMaps} from "../../types/sudoku/GivenDigitsMap";
import {latLngLiteralToPosition, positionToLatLngLiteral} from "../../sudokuTypes/google-maps/utils/googleMapsCoords";
import {CustomCellBounds} from "../../types/sudoku/CustomCellBounds";
import {textColor} from "../../components/app/globals";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {RulesUnorderedList} from "../../components/sudoku/rules/RulesUnorderedList";
import {gameStateGetCurrentFieldState} from "../../types/sudoku/GameState";
import {OddConstraint} from "../../components/sudoku/constraints/odd/Odd";

const bounds: google.maps.LatLngBoundsLiteral = {
    west: -17,
    east: 52,
    south: -36,
    north: 38,
};

export const Africa: PuzzleDefinition<number, GoogleMapsState, GoogleMapsState> = {
    slug: "africa",
    title: {
        [LanguageCode.en]: "Africa",
    },
    author: Chameleon,
    rules: () => <>
        <RulesParagraph>Put digits from 1 to 5 to each country of Africa, except for the islands.</RulesParagraph>
        <RulesParagraph>Neighbors (2 countries that share a border) can't contain the same digit.</RulesParagraph>
        <RulesParagraph>All neighbors that have consecutive digits or digits in a ratio of 1:2 have a dot between them.</RulesParagraph>
        <RulesParagraph>There are exactly 9 dots on the map.</RulesParagraph>
        <RulesParagraph>The product of all digits on the map (i.e. all digits multiplied together) ends with nine zeros.</RulesParagraph>
        <RulesParagraph>Countries that end with a consonant letter have an odd digit.</RulesParagraph>
        <RulesParagraph>Clarifications about neighborhood:</RulesParagraph>
        <RulesUnorderedList>
            <li>Namibia and Zimbabwe <u>are not</u> neighbors (they share only one corner, not a border).</li>
            <li>Zambia and Botswana <u>are not</u> neighbors (same).</li>
            <li>Republic of the Congo and Angola <u>are</u> neighbors (Angola has one small "extra piece").</li>
            <li>Enlarge the map if in doubt of any other neighborhood.</li>
        </RulesUnorderedList>
    </>,
    typeManager: {
        ...(DigitSudokuTypeManager() as SudokuTypeManager<number, any, any>),
        initialGameStateExtension: {zoom: 0, center: emptyPosition, map: undefined as any, overlay: undefined as any, renderVersion: 0},
        getRegionsForRowsAndColumns: () => [],
        transformCoords(coords, puzzle, {overlay}): Position {
            const projection = overlay?.getProjection();
            if (!projection) {
                return coords;
            }

            const {x, y} = projection.fromLatLngToContainerPixel(new google.maps.LatLng(positionToLatLngLiteral(coords)));
            return {
                left: x,
                top: y,
            };
        },
    },
    fieldWrapperComponent: GoogleMapsFieldWrapper(bounds),
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
            name: "countries",
            cells: [],
            component: withFieldLayer(FieldLayer.lines, ({puzzle, gameState}) => <>
                {Object.values(puzzle.customCellBounds![0]).map(
                    ({borders}, countryIndex) => borders.map(
                        (border, partIndex) => <polygon
                            key={`${countryIndex}-${partIndex}`}
                            points={formatSvgPointsArray(border.map(
                                (point) => puzzle.typeManager.transformCoords!(point, puzzle, gameState)
                            ))}
                            fill={"none"}
                            stroke={textColor}
                            strokeWidth={1}
                        />
                    )
                )}
            </>),
        },
        {
            name: "neighbors",
            cells: [],
            isValidCell({left: cell}, digits, regionCells, puzzle, gameState): boolean {
                const digit = digits[0]?.[cell];

                for (const cell2Str of Object.keys(AfricaCountriesNeighborsGraph[cell as AfricaCountriesEnum] || {})) {
                    const cell2 = Number(cell2Str);
                    const digit2 = digits[0]?.[cell2];

                    if (digit2 !== undefined && puzzle.typeManager.areSameCellData(digit, digit2, gameState, true)) {
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
    ] as Constraint<number, {}, GoogleMapsState, GoogleMapsState>[],
    resultChecker: (puzzle, gameState) => {
        if (!isValidFinishedPuzzleByConstraints(puzzle, gameState)) {
            return false;
        }

        const digits = gameStateGetCurrentFieldState(gameState).cells[0].map(({usersDigit}) => usersDigit!);

        let product = 1;
        let dots = 0;

        for (const [index, digit] of digits.entries()) {
            product = (product * digit) % 1000000000;

            for (const index2Str of Object.keys(AfricaCountriesNeighborsGraph[index as AfricaCountriesEnum] || {})) {
                const digit2 = digits[Number(index2Str)];

                if (Math.abs(digit - digit2) === 1 || digit === digit2 * 2 || digit2 === digit * 2) {
                    dots++;
                }
            }
        }

        // Dots are counted twice
        return product === 0 && dots === 18;
    },
    enableDragMode: true,
};
