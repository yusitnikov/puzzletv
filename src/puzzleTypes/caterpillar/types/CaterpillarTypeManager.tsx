import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CaterpillarPTM } from "./CaterpillarPTM";
import { ZoomInButtonItem, ZoomOutButtonItem } from "../../../components/puzzle/controls/ZoomButton";
import { CaterpillarPuzzleExtension } from "./CaterpillarPuzzleExtension";
import { CaterpillarGrid } from "./CaterpillarGrid";
import { mergePuzzleItems, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { isCellInRect } from "../../../types/layout/Rect";
import { RulesParagraph } from "../../../components/puzzle/rules/RulesParagraph";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { CaterpillarGridFocusConstraint } from "../constraints/CaterpillarGridFocus";
import { lightGreyColor } from "../../../components/app/globals";
import { FocusButtonItem, FocusButtonRule } from "../components/FocusButton";
import { translate } from "../../../utils/translate";

export const CaterpillarTypeManager = <T extends AnyPTM>(
    baseTypeManager: PuzzleTypeManager<T>,
): PuzzleTypeManager<CaterpillarPTM<T>> => {
    const typedBaseTypeManager = baseTypeManager as unknown as PuzzleTypeManager<CaterpillarPTM<T>>;

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
            FocusButtonItem(),
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
                caterpillarGrids: [...(puzzle.extension.caterpillarGrids ?? []), newGrid],
            };
        },
        postProcessImportGrid(puzzle, importer, gridParser) {
            typedBaseTypeManager.postProcessImportGrid?.(puzzle, importer, gridParser);

            const { caterpillarGrids } = puzzle.extension as CaterpillarPuzzleExtension;
            caterpillarGrids[caterpillarGrids.length - 1].outsideBounds = gridParser.outsideBounds;
        },

        onImportPuzzleProp<P extends keyof PuzzleDefinition<CaterpillarPTM<T>>>(
            puzzle: PuzzleDefinition<CaterpillarPTM<T>>,
            prop: P,
            value: PuzzleDefinition<CaterpillarPTM<T>>[P],
        ): boolean {
            if (prop === "title" || prop === "author" || prop === "rules") {
                const grids = (puzzle.extension as CaterpillarPuzzleExtension).caterpillarGrids;
                if (grids?.length) {
                    const currentGrid = grids[grids.length - 1];
                    currentGrid.props[prop] = value;
                    return true;
                }
            }

            return typedBaseTypeManager.onImportPuzzleProp?.(puzzle, prop, value) ?? false;
        },

        postProcessPuzzle(puzzle): PuzzleDefinition<CaterpillarPTM<T>> {
            const grids = (puzzle.extension as CaterpillarPuzzleExtension).caterpillarGrids ?? [];

            const extraItems = grids.map((grid) => CaterpillarGridFocusConstraint<CaterpillarPTM<T>>(grid.bounds));

            return {
                ...puzzle,
                items: mergePuzzleItems(extraItems, puzzle.items),
                rules: (context) => {
                    const selectedCells = context.selectedCells.items;

                    const gridRules = grids
                        .map(({ bounds, props }, index) => {
                            if (
                                (props.title || props.author || props.rules) &&
                                selectedCells.some((cell) => isCellInRect(bounds, cell))
                            ) {
                                return (
                                    <div key={index}>
                                        {!!(props.title || props.author) && (
                                            <RulesParagraph>
                                                {!!props.title && <strong>{translate(props.title)} </strong>}
                                                {!!props.author && (
                                                    <em>
                                                        {translate("by")} {translate(props.author)}
                                                    </em>
                                                )}
                                            </RulesParagraph>
                                        )}

                                        {!!props.rules && props.rules(context)}
                                    </div>
                                );
                            }

                            return undefined;
                        })
                        .filter(Boolean);

                    if (gridRules.length === 0) {
                        return (
                            <>
                                <RulesParagraph>
                                    {translate({
                                        [LanguageCode.en]: "Click on a grid to see its rules",
                                        [LanguageCode.ru]: "Нажмите на поле, чтобы увидеть его правила",
                                        [LanguageCode.de]: "Klicken Sie auf ein Raster, um dessen Regeln anzuzeigen",
                                    })}
                                    .
                                </RulesParagraph>

                                <RulesParagraph>
                                    <FocusButtonRule context={context} />
                                </RulesParagraph>
                            </>
                        );
                    }

                    return <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>{gridRules}</div>;
                },
            };
        },

        importOptionOverrides(context) {
            let result = typedBaseTypeManager.importOptionOverrides?.(context) ?? {};

            const grids = (context.puzzle.extension as CaterpillarPuzzleExtension).caterpillarGrids ?? [];
            const selectedCells = context.selectedCells.items;

            for (const { bounds, overrides } of grids) {
                if (selectedCells.some((cell) => isCellInRect(bounds, cell))) {
                    result = { ...result, ...overrides };
                }
            }

            return result;
        },
    };
};
