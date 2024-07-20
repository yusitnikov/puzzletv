import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {CaterpillarPTM} from "./CaterpillarPTM";
import {ZoomInButtonItem, ZoomOutButtonItem} from "../../../components/sudoku/controls/ZoomButton";
import {CaterpillarPuzzleExtension} from "./CaterpillarPuzzleExtension";
import {CaterpillarGrid} from "./CaterpillarGrid";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {isCellInRect} from "../../../types/layout/Rect";
import {RulesParagraph} from "../../../components/sudoku/rules/RulesParagraph";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {CaterpillarGridFocusConstraint} from "../constraints/CaterpillarGridFocus";
import {lightGreyColor} from "../../../components/app/globals";

export const CaterpillarSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
): SudokuTypeManager<CaterpillarPTM<T>> => {
    const typedBaseTypeManager = baseTypeManager as unknown as SudokuTypeManager<CaterpillarPTM<T>>;

    return {
        ...typedBaseTypeManager,

        allowMove: true,
        allowScale: true,
        initialScale: 0.9,
        isFreeScale: true,
        gridBackgroundColor: lightGreyColor,
        controlButtons: [
            ...(typedBaseTypeManager.controlButtons ?? []),
            ZoomInButtonItem(),
            ZoomOutButtonItem(),
        ],

        preProcessImportGrid(puzzle, importer, gridParser) {
            typedBaseTypeManager.preProcessImportGrid?.(puzzle, importer, gridParser);

            const newGrid: CaterpillarGrid = {
                bounds: gridParser.bounds,
                outsideBounds: gridParser.outsideBounds,
                props: {},
                overrides: gridParser.importOptionOverrides,
            };
            puzzle.extension = {
                ...puzzle.extension,
                caterpillarGrids: [
                    ...puzzle.extension?.caterpillarGrids ?? [],
                    newGrid,
                ],
            };
        },
        postProcessImportGrid(puzzle, importer, gridParser) {
            typedBaseTypeManager.postProcessImportGrid?.(puzzle, importer, gridParser);

            const {caterpillarGrids} = puzzle.extension as CaterpillarPuzzleExtension;
            caterpillarGrids[caterpillarGrids.length - 1].outsideBounds = gridParser.outsideBounds;
        },

        onImportPuzzleProp<P extends keyof PuzzleDefinition<CaterpillarPTM<T>>>(
            puzzle: PuzzleDefinition<CaterpillarPTM<T>>,
            prop: P,
            value: PuzzleDefinition<CaterpillarPTM<T>>[P],
        ): boolean {
            if (prop === "title" || prop === "author" || prop === "rules") {
                const grids = (puzzle.extension as CaterpillarPuzzleExtension)?.caterpillarGrids;
                if (grids?.length) {
                    const currentGrid = grids[grids.length - 1];
                    currentGrid.props[prop] = value;
                    return true;
                }
            }

            return typedBaseTypeManager.onImportPuzzleProp?.(puzzle, prop, value) ?? false;
        },

        postProcessPuzzle(puzzle): PuzzleDefinition<CaterpillarPTM<T>> {
            const grids = (puzzle.extension as CaterpillarPuzzleExtension)?.caterpillarGrids ?? [];

            const {items = []} = puzzle;
            const extraItems = grids.map((grid) => CaterpillarGridFocusConstraint<CaterpillarPTM<T>>(grid.bounds));

            return {
                ...puzzle,
                items: typeof items === "function"
                    ? (context) => [
                        ...extraItems,
                        ...items(context),
                    ]
                    : [
                        ...extraItems,
                        ...items,
                    ],
                rules: (translate, context) => {
                    const selectedCells = context.selectedCells.items;

                    const gridRules = grids
                        .map(({bounds, props}, index) => {
                            if ((props.title || props.author || props.rules) && selectedCells.some((cell) => isCellInRect(bounds, cell))) {
                                return <div key={index}>
                                    {!!(props.title || props.author) && <RulesParagraph>
                                        {!!props.title && <strong>{translate(props.title)} </strong>}
                                        {!!props.author && <em>{translate("by")} {translate(props.author)}</em>}
                                    </RulesParagraph>}

                                    {!!props.rules && props.rules(translate, context)}
                                </div>;
                            }

                            return undefined;
                        })
                        .filter(Boolean);

                    if (gridRules.length === 0) {
                        return <RulesParagraph>{translate({
                            [LanguageCode.en]: "Click on a grid to see its rules",
                            [LanguageCode.ru]: "Нажмите на поле, чтобы увидеть его правила",
                            [LanguageCode.de]: "Klicken Sie auf ein Raster, um dessen Regeln anzuzeigen",
                        })}.</RulesParagraph>;
                    }

                    return <div style={{display: "flex", flexDirection: "column", gap: "1em"}}>
                        {gridRules}
                    </div>;
                },
            };
        },

        importOptionOverrides(context) {
            let result = typedBaseTypeManager.importOptionOverrides?.(context) ?? {};

            const grids = (context.puzzle.extension as CaterpillarPuzzleExtension)?.caterpillarGrids ?? [];
            const selectedCells = context.selectedCells.items;

            for (const {bounds, overrides} of grids) {
                if (selectedCells.some((cell) => isCellInRect(bounds, cell))) {
                    result = {...result, ...overrides};
                }
            }

            return result;
        },
    };
};
