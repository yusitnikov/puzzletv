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
import {getRegionBoundingBox} from "../../utils/regions";
import {getRectCenter} from "../../types/layout/Rect";

export const Africa: PuzzleDefinition<number, GoogleMapsState, GoogleMapsState> = {
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
        processArrowDirection({left: cell}, xDirection, yDirection, {puzzle: {customCellBounds}}): Position | undefined {
            const getCountryCenter = (cell: number) => getRectCenter(getRegionBoundingBox(customCellBounds![0][cell].borders.flat()));
            const {left, top} = getCountryCenter(cell);

            let bestDist = 1000;
            let bestCell: number | undefined = undefined;

            for (const cell2Str of Object.keys(AfricaCountriesNeighborsGraph[cell as AfricaCountriesEnum] || {})) {
                const cell2 = Number(cell2Str);
                const {left: left2, top: top2} = getCountryCenter(cell2);

                const straightDist = (left2 - left) * xDirection + (top - top2) * yDirection;
                const errorDist = Math.abs((left2 - left) * yDirection) + Math.abs((top - top2) * xDirection);
                const dist = Math.abs(Math.atan2(errorDist, straightDist));
                if (dist < bestDist) {
                    bestDist = dist;
                    bestCell = cell2;
                }
            }

            return bestCell === undefined
                ? undefined
                : {top: 0, left: bestCell};
        },
    },
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
            name: "countries",
            cells: [],
            component: withFieldLayer(FieldLayer.lines, ({context: {puzzle, state}}) => <>
                {Object.values(puzzle.customCellBounds![0]).map(
                    ({borders}, countryIndex) => borders.map(
                        (border, partIndex) => <polygon
                            key={`${countryIndex}-${partIndex}`}
                            points={formatSvgPointsArray(border.map(
                                (point) => puzzle.typeManager.transformCoords!(point, puzzle, state)
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
    resultChecker: (context) => {
        if (!isValidFinishedPuzzleByConstraints(context)) {
            return false;
        }

        const digits = gameStateGetCurrentFieldState(context.state).cells[0].map(({usersDigit}) => usersDigit!);

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
