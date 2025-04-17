import { useTranslate } from "../../hooks/useTranslate";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { Tabs } from "../layout/tabs/Tabs";
import { CubeIt } from "../../data/puzzles/Cubedoku";
import { SudokuMaker } from "../../data/puzzles/Import";
import { PuzzleImportPuzzleType } from "../../types/sudoku/PuzzleImportOptions";
import { ToroidalYinYang } from "../../data/puzzles/ToroidalYinYang";
import { ExampleTab } from "./how-to-import/ExampleTab";
import { MappingIllustration } from "./how-to-import/MappingIllustration";
import {
    addEmbeddedSolution,
    addRegularFog,
    seeExample,
    seeIllustration,
    selectAdditionalConstraintTranslation,
    selectGridTypeTranslation,
} from "./how-to-import/translations";
import { NorthOrSouth2 } from "../../data/puzzles/NorthOrSouth";
import { RushHour, RushHourSource } from "../../data/puzzles/RushHour";
import { EasterSokoban, EasterSokobanSource, Sudokuban, SudokubanSource } from "../../data/puzzles/Sudokuban";
import { Revolutionary } from "../../data/puzzles/RotatableClues";
import { JssChicken } from "../../data/puzzles/JigsawJss";
import { EndlessChristmas } from "../../data/puzzles/EndlessChristmas";
import { normalSudokuRulesApply } from "../../data/ruleSnippets";
import { Embark, embarkLoadString } from "../../data/puzzles/Embark";
import {
    InfinityLoopDotsExample,
    InfinityLoopDotsExampleSource,
    infinityLoopTemplateLink,
    MisterFantastic,
    MisterFantasticPreview,
    MisterFantasticPreviewNoOffset,
    MisterFantasticSource,
} from "../../data/puzzles/InfinityLoop";
import { OpenInNew } from "@emotion-icons/material";
import { Cornered } from "../../data/puzzles/SlideAndSeek";
import { CloseQuarters, CloseQuartersSource } from "../../data/puzzles/FractionalSudoku";

export const HowToImport = observer(function HowToImport() {
    profiler.trace();

    const translate = useTranslate();

    const fPuzzlesLink = (
        <a href="https://f-puzzles.com" target="_blank">
            f-puzzles
        </a>
    );
    const sudokuMakerLink = (
        <a href="https://sudokumaker.app" target="_blank">
            Sudoku Maker
        </a>
    );
    const bookmarkletCode =
        // eslint-disable-next-line no-script-url
        "javascript:void(h=location.href,d=window.exportPuzzle&&exportPuzzle()||h.split(/(\\?puzzleid=fpuzzles|\\.app\\/\\?puzzle=|\\.app\\/fpuzzles|[?:]load=)/)[2],d?open('https://yusitnikov.github.io/puzzletv/#'+(h.includes('sudokumaker')?'sudokumaker':'f-puzzles')+'-wizard:load='+d):alert('Unable to extract a puzzle definition'))";

    return (
        <>
            <ol>
                <li>
                    {translate({
                        [LanguageCode.en]: (
                            <>
                                Create the puzzle in {fPuzzlesLink} or {sudokuMakerLink} (like you do it for SudokuPad)
                            </>
                        ),
                        [LanguageCode.ru]: (
                            <>
                                Создайте головоломку в {fPuzzlesLink} или {sudokuMakerLink}'е (так же, как Вы делаете
                                это для SudokuPad)
                            </>
                        ),
                        [LanguageCode.de]: (
                            <>
                                Erstellen Sie das Rätsel in {fPuzzlesLink} oder {sudokuMakerLink} (wie Sie es für
                                SudokuPad tun)
                            </>
                        ),
                    })}
                    .
                </li>
                <li>
                    {translate({
                        [LanguageCode.en]: "Drag&drop the following bookmarklet into your bookmarks bar (only once)",
                        [LanguageCode.ru]: "Перетащите следующий букмарклет в Вашу панель закладок (только один раз)",
                        [LanguageCode.de]:
                            "Ziehen Sie das folgende Lesezeichen per Drag&Drop in Ihre Lesezeichenleiste (nur einmal)",
                    })}
                    :{" "}
                    <a href={bookmarkletCode}>
                        {translate({
                            [LanguageCode.en]: "Export to PuzzleTV",
                            [LanguageCode.ru]: "Экспорт в PuzzleTV",
                            [LanguageCode.de]: "Export nach PuzzleTV",
                        })}
                    </a>
                    .
                </li>
                <li>
                    {translate({
                        [LanguageCode.en]: "Click the bookmark",
                        [LanguageCode.ru]: "Нажмите на закладку",
                        [LanguageCode.de]: "Klicken Sie auf das Lesezeichen",
                    })}
                    .
                </li>
                <li>
                    {translate({
                        [LanguageCode.en]: 'Select puzzle options and click "Load"',
                        [LanguageCode.ru]: 'Выберите опции головоломки и нажмите "Загрузить"',
                        [LanguageCode.de]: 'Wählen Sie die Puzzle-Optionen und klicken Sie auf "Laden"',
                    })}
                    .
                </li>
                <li>
                    {translate({
                        [LanguageCode.en]: "Done! Now you can share the link to the puzzle",
                        [LanguageCode.ru]: "Готово! Теперь Вы можете поделиться ссылкой на головоломку",
                        [LanguageCode.de]: "Erledigt! Nun können Sie den Link zum Rätsel teilen",
                    })}
                    .
                </li>
            </ol>

            <p>
                {translate({
                    [LanguageCode.en]:
                        "Click puzzle type below to see type-specific details for importing it to Puzzle TV",
                    [LanguageCode.ru]:
                        "Нажмите на тип головоломки ниже, чтобы просмотреть детали, специфические для импорта этого типа головоломки в Puzzle TV",
                    [LanguageCode.de]:
                        "Klicken Sie unten auf den Puzzletyp, um typspezifische Details zum Importieren in Puzzle TV anzuzeigen",
                })}
                :
            </p>

            <Tabs
                urlParam={"type"}
                tabs={[
                    {
                        id: PuzzleImportPuzzleType.Cubedoku,
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Cubedoku",
                                    [LanguageCode.ru]: "Кубдоку",
                                })}
                                puzzle={CubeIt}
                            />
                        ),
                        contents: (
                            <>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Create a puzzle twice the size of the cube's face",
                                        [LanguageCode.ru]:
                                            "Создайте головоломку размером в два раза больше стороны куба",
                                        [LanguageCode.de]:
                                            "Erstellen Sie ein Puzzle, das doppelt so groß ist wie die Fläche des Würfels",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Define the regions if necessary (it's ok to use the same region number for several unconnected regions)",
                                        [LanguageCode.ru]:
                                            "Добавьте регионы, если нужно (можно использовать один и тот же номер региона для нескольких несвязанных регионов)",
                                        [LanguageCode.de]:
                                            "Definieren Sie die Regionen, falls erforderlich (es ist in Ordnung, die gleiche Regionsnummer für mehrere nicht verbundene Regionen zu verwenden)",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "The top left quadrant of the source grid will become the top face of the cube",
                                        [LanguageCode.ru]:
                                            "Верхний левый квадрант исходной сетки станет верхней гранью куба",
                                        [LanguageCode.de]:
                                            "Der obere linke Quadrant des Quellrasters wird zur oberen Fläche des Würfels",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "The top right quadrant will be ignored",
                                        [LanguageCode.ru]: "Верхний правый квадрант будет игнорироваться",
                                        [LanguageCode.de]: "Der obere rechte Quadrant wird ignoriert",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]:
                                            "The bottom left and the bottom right quadrants will become the left and the right faces of the cube, accordingly",
                                        [LanguageCode.ru]:
                                            "Нижний левый и нижний правый квадранты станут левой и правой гранями куба, соответственно",
                                        [LanguageCode.de]:
                                            "Die unteren linken und unteren rechten Quadranten werden die linken und rechten Flächen des Würfels, entsprechend",
                                    })}
                                    . {translate(seeIllustration)}:
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) =>
                                        SudokuMaker.loadPuzzle(
                                            {
                                                type: plain
                                                    ? PuzzleImportPuzzleType.Regular
                                                    : PuzzleImportPuzzleType.Cubedoku,
                                                splitUnconnectedRegions: true,
                                                load: "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAOV4oO6dAAJ0jACYQA1o1og4jBAAtoBEAGE1wjriUBjCDD44EWpQgCe9fiCON0CU0oDumaeoIAOOmoomADmapb4-iDwAB4AIiGY4QAsdEYibOgEANrAAL40eQX5hSXFZUUVpZXlVbU19dWNdU0NzW2tHS1d7d1lALqpuC5QcJgWmfg5ILb2BJTF03b8RHRQKMHYOBNZlDS7%2BzQAtCvHRycrFzSXpzfnNGT3jw%2B3Z68AzDQfX68vpyn-NBSBwOAFYaGCIVcoZcAGw0OEIp5IgDsNFR6M%2BmK%2BfQWM34ZEolAeDDgIxg21AeK0CBQ0UsdBpdK0RCUWGY-BSyhwwQ4czow3kKAA6l4fPhdiABXIHABiMDyhVKMCYNhsLRysCEwnykC4pbU2n06aGrRkVmYdkETlwbm88X8hBQQUi7xqPmSx2C9UKxV0ZWq72arU6vWzQiMo0RrRvc2W-DW238CVS4Wit32j1O6WBn1KlVqwgarWUEMFRZh41MhkmwgADVjHLoNp5SYdWdTrvdKZzvvA%2BcDxZDA0lNhgACMIBlslkHg8JdIUGAVGxLAMZ-CoSAF0vGCuQGvEcTt8vVzQsnCHh8t4uT-ucTjckA",
                                            },
                                            true,
                                        )
                                    }
                                />
                                <p>{translate(selectGridTypeTranslation("Cubedoku"))}.</p>
                            </>
                        ),
                    },
                    {
                        id: "toroidal",
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Toroidal grid",
                                    [LanguageCode.ru]: "Тороидальное поле",
                                    [LanguageCode.de]: "Toroidales Gitter",
                                })}
                                puzzle={ToroidalYinYang}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Regular"))}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Use "Loop horizontally" and "Loop vertically" checkboxes to define in which dimensions the grid should loop`,
                                        [LanguageCode.ru]: `Используйте флажки «Loop horizontally» и «Loop vertically», чтобы определить, в каких измерениях сетка должна зацикливаться`,
                                        [LanguageCode.de]: `Verwenden Sie die Kontrollkästchen "Loop horizontally" und "Loop vertically", um festzulegen, in welchen Dimensionen das Raster schleifen soll`,
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: PuzzleImportPuzzleType.Rotatable,
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Rotatable grid",
                                    [LanguageCode.ru]: "Вращающееся поле",
                                    [LanguageCode.de]: "Drehbares Gitter",
                                })}
                                puzzle={NorthOrSouth2}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Rotatable"))}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Optionally, change "Digit type" to "Calculator" to make "2" and "5" rotationally symmetric`,
                                        [LanguageCode.ru]: `При желании измените «Digit type» на «Calculator», чтобы сделать «2» и «5» симметричными при вращении вокруг оси`,
                                        [LanguageCode.de]: `Ändern Sie optional "Digit type" in "Calculator", um "2" und "5" rotationssymmetrisch zu machen`,
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: PuzzleImportPuzzleType.RushHour,
                        title: <ExampleTab title={translate({ [LanguageCode.en]: "Rush hour" })} puzzle={RushHour} />,
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Rush hour"))}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use cell background colors to mark the initial positions of the cars",
                                        [LanguageCode.ru]:
                                            "Используйте цвета фона ячеек, чтобы отметить начальные положения автомобилей",
                                        [LanguageCode.de]:
                                            "Verwenden Sie Zellhintergrundfarben, um die Anfangspositionen der Autos zu markieren",
                                    })}
                                    . {translate(seeIllustration)}:
                                </p>
                                <MappingIllustration puzzle={(plain) => (plain ? RushHourSource : RushHour)} />
                            </>
                        ),
                    },
                    {
                        id: "sokoban",
                        title: <ExampleTab title={translate({ [LanguageCode.en]: "Sokoban" })} puzzle={Sudokuban} />,
                        contents: (
                            <>
                                <p>
                                    {translate(selectGridTypeTranslation("Regular"))}.<br />
                                    {translate(selectAdditionalConstraintTranslation("Sokoban"))}.
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use cosmetic circle to mark the initial position of the sokoban player",
                                        [LanguageCode.ru]:
                                            "Используйте косметический круг, чтобы отметить начальную позицию игрока сокобан",
                                        [LanguageCode.de]:
                                            "Verwenden Sie einen kosmetischen Kreis, um die Anfangsposition des Sokoban-Spielers zu markieren",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use killer cages to mark the initial positions of the sokoban crates",
                                        [LanguageCode.ru]:
                                            "Используйте клетки (killer cages), чтобы отметить начальные позиции ящиков сокобан",
                                        [LanguageCode.de]:
                                            "Markieren Sie mit Killerkäfigen die Ausgangspositionen der Sokoban-Kisten",
                                    })}
                                    . {translate(seeIllustration)}:
                                </p>
                                <MappingIllustration puzzle={(plain) => (plain ? SudokubanSource : Sudokuban)} />
                                <p>
                                    {translate(selectAdditionalConstraintTranslation("Egg"))}
                                    {translate({
                                        [LanguageCode.en]: " to create a sokoban puzzle with eggs",
                                        [LanguageCode.ru]: ", чтобы создать головоломку сокобан с яйцами",
                                        [LanguageCode.de]: ", um ein Sokoban-Puzzle mit Eiern zu erstellen",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use cosmetic cages to mark the initial positions and colors of the eggs",
                                        [LanguageCode.ru]:
                                            "Используйте косметические клетки, чтобы отметить исходное положение и цвет яиц",
                                        [LanguageCode.de]:
                                            "Verwenden Sie kosmetische Käfige, um die ursprünglichen Positionen und Farben der Eier zu markieren",
                                    })}
                                    . {translate(seeIllustration)}:
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) => (plain ? EasterSokobanSource : EasterSokoban)}
                                />
                            </>
                        ),
                    },
                    {
                        id: "rotatable-clues",
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Rotatable clues",
                                    [LanguageCode.ru]: "Вращающиеся подсказки",
                                    [LanguageCode.de]: "Drehbare Hinweise",
                                })}
                                puzzle={Revolutionary}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Regular"))}.</p>
                                <p>{translate(selectAdditionalConstraintTranslation("Rotatable clues"))}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use cosmetic circles to mark the rotation points of the clues",
                                        [LanguageCode.ru]:
                                            "Используйте косметические круги, чтобы отметить точки вращения подсказок",
                                        [LanguageCode.de]:
                                            "Verwenden Sie kosmetische Kreise, um die Rotationspunkte der Hinweise zu markieren",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "By default, the digit in the circle will control the angle of the clue",
                                        [LanguageCode.ru]: "По умолчанию цифра в круге будет управлять углом подсказки",
                                        [LanguageCode.de]:
                                            "Standardmäßig steuert die Ziffer im Kreis den Winkel des Hinweises",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: `Turn on the "Free rotation" flag to allow rotating the clue independently of the digit`,
                                        [LanguageCode.ru]: `Включите флаг «Free rotation», чтобы разрешить вращение подсказки независимо от цифры`,
                                        [LanguageCode.de]: `Aktivieren Sie die Option „Free rotation“, um die Rotation des Hinweises unabhängig von der Ziffer zu ermöglichen`,
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Turn on the "Wheels" flag to create a wheels puzzle`,
                                        [LanguageCode.ru]: `Включите флаг «Wheels», чтобы создать головоломку с колесами`,
                                        [LanguageCode.de]: `Aktivieren Sie die Option "Wheels", um ein Räderpuzzle zu erstellen`,
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "Use cosmetic text for the digits on the wheels",
                                        [LanguageCode.ru]: "Используйте косметический текст для цифр на колесах",
                                        [LanguageCode.de]:
                                            "Verwenden Sie kosmetischen Text für die Ziffern auf den Rädern",
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: PuzzleImportPuzzleType.Jigsaw,
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Jigsaw",
                                    [LanguageCode.ru]: "Пазл (мозаика)",
                                    [LanguageCode.de]: "Puzzle",
                                })}
                                puzzle={JssChicken}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Jigsaw"))}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Use sudoku regions to define the jigsaw pieces",
                                        [LanguageCode.ru]: "Используйте регионы судоку, чтобы определить части мозаики",
                                        [LanguageCode.de]:
                                            "Verwenden Sie Sudoku-Regionen, um die Puzzleteile zu definieren",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Configure the options in the "Jigsaw" section to control rotation, visual representation and validation of the pieces`,
                                        [LanguageCode.ru]: `Настройте параметры в разделе «Jigsaw», чтобы контролировать вращение, визуальное представление и валидацию частей пазла`,
                                        [LanguageCode.de]: `Konfigurieren Sie die Optionen im Abschnitt "Jigsaw", um die Drehung, die visuelle Darstellung und die Validierung der Teile zu steuern`,
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: "rule-gifts",
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Rule gifts",
                                    [LanguageCode.ru]: "Правила-подарки",
                                    [LanguageCode.de]: "Regelgeschenke",
                                })}
                                puzzle={EndlessChristmas}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(selectGridTypeTranslation("Regular"))}.</p>
                                <p>{translate(addRegularFog)}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Use 1-cell cosmetic cages with the text that starts with "rule:" and then describes the rule for the gift boxes`,
                                        [LanguageCode.ru]: `Используйте одноклеточные косметические клетки с текстом, который начинается с «rule:», а затем описывает правило для подарочных коробок`,
                                        [LanguageCode.de]: `Verwenden Sie 1-Zellen-Kosmetikkäfige mit dem Text, der mit "rule:" beginnt und dann die Regel für die Geschenkboxen beschreibt`,
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "For instance,",
                                        [LanguageCode.ru]: "Например,",
                                        [LanguageCode.de]: "Zum Beispiel",
                                    })}{" "}
                                    "rule: {translate(normalSudokuRulesApply)}" (
                                    {translate({
                                        [LanguageCode.en]: "no double quotes",
                                        [LanguageCode.ru]: "без двойных кавычек",
                                        [LanguageCode.de]: "ohne Anführungszeichen",
                                    })}
                                    !).
                                </p>
                            </>
                        ),
                    },
                    {
                        id: "yajilin-fog",
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Yajilin fog",
                                    [LanguageCode.ru]: "Туман яджилин",
                                    [LanguageCode.de]: "Yajilin-Nebel",
                                })}
                                puzzle={Embark}
                            />
                        ),
                        contents: (
                            <>
                                <p>{translate(addRegularFog)}.</p>
                                <p>{translate(addEmbeddedSolution)}.</p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Use black cell background color for given black cells",
                                        [LanguageCode.ru]:
                                            "Используйте черный цвет фона ячейки для заданных черных ячеек",
                                        [LanguageCode.de]:
                                            "Verwende die schwarze Einfärbung um gegebebe schwarze Zellen zu erzeugen",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use grey cell background color for embedded solution for cell backgrounds",
                                        [LanguageCode.ru]:
                                            "Используйте серый цвет фона ячейки для встроенного решения для фона ячеек",
                                        [LanguageCode.de]:
                                            "Verwende die graue Einfärbung um schwarze Zellen für den Lösungs-Check zu erstellen",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "Use black cosmetic lines for embedded solution for lines",
                                        [LanguageCode.ru]:
                                            "Используйте черные косметические линии для встроенного решения для линий",
                                        [LanguageCode.de]:
                                            "Verwenden Sie schwarze kosmetische Linien für eine eingebettete Lösung für Linien",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate(seeExample)}:{" "}
                                    <a href={"https://f-puzzles.com/?load=" + embarkLoadString} target={"_blank"}>
                                        Embark
                                    </a>
                                    .
                                </p>
                                <p>{translate(selectGridTypeTranslation("Regular"))}.</p>
                                <p>{translate(selectAdditionalConstraintTranslation("Yajilin fog"))}.</p>
                                <p>
                                    {translate(
                                        selectAdditionalConstraintTranslation("Hide cosmetic elements behind the fog"),
                                    )}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: PuzzleImportPuzzleType.InfiniteRings,
                        title: (
                            <ExampleTab
                                title={translate({
                                    [LanguageCode.en]: "Infinite loop",
                                    [LanguageCode.ru]: "Бесконечный цикл",
                                    [LanguageCode.de]: "Endlosschleife",
                                })}
                                puzzle={MisterFantastic}
                            />
                        ),
                        contents: (
                            <>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "For a puzzle with N rings, create a custom grid of size 2N+2",
                                        [LanguageCode.ru]: "Для головоломки с N кольцами создайте поле размером 2N+2",
                                        [LanguageCode.de]:
                                            "Für ein Puzzle mit N Ringen erstellen Sie ein benutzerdefiniertes Raster der Größe 2N+2",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "Here's a Sudoku Maker template for 4 rings",
                                        [LanguageCode.ru]: "Вот шаблон Sudoku Maker для 4 колец",
                                        [LanguageCode.de]: "Hier ist eine Sudoku Maker-Vorlage für 4 Ringe",
                                    })}
                                    :{" "}
                                    <a href={infinityLoopTemplateLink} target="_blank">
                                        {translate("external link")}&nbsp;
                                        <OpenInNew size={"1em"} />
                                    </a>
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Cells on the main diagonals will be mapped to the corners of the rings",
                                        [LanguageCode.ru]:
                                            "Клетки на главных диагоналях будут соответствовать углам колец",
                                        [LanguageCode.de]:
                                            "Zellen auf den Hauptdiagonalen werden auf die Ecken der Ringe abgebildet",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]:
                                            "The central 2 rows and 2 columns will be mapped to the middle cells of the rings",
                                        [LanguageCode.ru]:
                                            "Центральные 2 строки и 2 столбца будут соответствовать средним клеткам колец",
                                        [LanguageCode.de]:
                                            "Die mittleren 2 Zeilen und 2 Spalten werden den mittleren Zellen der Ringe zugeordnet",
                                    })}
                                    .{" "}
                                    {translate({
                                        [LanguageCode.en]: "All other cells of the source grid will be ignored",
                                        [LanguageCode.ru]: "Все остальные клетки исходного поля будут проигнорированы",
                                        [LanguageCode.de]: "Alle anderen Zellen des Quellrasters werden ignoriert",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "It's safe to draw line constraints through the ignored cells, the validation will check only the real cells",
                                        [LanguageCode.ru]:
                                            "Можно без риска рисовать линии через игнорируемые клетки, при проверке будут использоваться только реальные клетки",
                                        [LanguageCode.de]:
                                            "Es ist sicher, Linienbeschränkungen durch die ignorierten Zellen zu ziehen, die Validierung überprüft nur die echten Zellen",
                                    })}
                                    .
                                </p>

                                <p>
                                    {translate(selectGridTypeTranslation("Infinite loop"))}.{" "}
                                    {translate(seeIllustration)}:
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) => (plain ? MisterFantasticSource : MisterFantasticPreviewNoOffset)}
                                />

                                <p>
                                    {translate({
                                        [LanguageCode.en]: `Change the "Initial zooming" to choose which ring will be focused initially when opening the puzzle`,
                                        [LanguageCode.ru]: `Измените «Initial zooming», чтобы выбрать, какое кольцо будет изначально сфокусировано при открытии головоломки`,
                                        [LanguageCode.de]: `Ändern Sie das "Initial zooming", um auszuwählen, welcher Ring beim Öffnen des Puzzles zunächst fokussiert wird`,
                                    })}
                                    :
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) =>
                                        plain ? MisterFantasticPreviewNoOffset : MisterFantasticPreview
                                    }
                                />

                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "In order to draw a kropki dot between 2 cells that have an ignored cells between them, place the dot on the border of the cell in the middle row/column in the direction of the second cell",
                                        [LanguageCode.ru]:
                                            "Чтобы нарисовать точку «кропки» между двумя клетками, между которыми есть игнорируемые клетки, поместите точку на границе клетки в средней строке/столбце в направлении второй клетки",
                                        [LanguageCode.de]:
                                            "Um einen Kropki-Punkt zwischen zwei Zellen zu zeichnen, zwischen denen sich eine ignorierte Zelle befindet, platzieren Sie den Punkt am Rand der Zelle in der mittleren Zeile/Spalte in Richtung der zweiten Zelle",
                                    })}
                                    .
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) =>
                                        plain ? InfinityLoopDotsExampleSource : InfinityLoopDotsExample
                                    }
                                />

                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Cages are currently not supported",
                                        [LanguageCode.ru]: "Клетки в настоящее время не поддерживаются",
                                        [LanguageCode.de]: "Käfige werden derzeit nicht unterstützt",
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: "slide-and-seek",
                        title: (
                            <ExampleTab title={translate({ [LanguageCode.en]: "Slide & Seek" })} puzzle={Cornered} />
                        ),
                        contents: (
                            <>
                                <p>
                                    {translate(selectGridTypeTranslation("Regular"))}.<br />
                                    {translate(selectAdditionalConstraintTranslation("Slide & Seek"))}.<br />
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            'Check the "Verify the solution based on the conflict checker" flag in the "Miscellaneous" section if the puzzle does not have non-standard rules',
                                        [LanguageCode.ru]:
                                            "Установите флажок «Verify the solution based on the conflict checker» в разделе «Miscellaneous», если головоломка не имеет нестандартных правил",
                                        [LanguageCode.de]:
                                            'Aktivieren Sie das Kontrollkästchen "Verify the solution based on the conflict checker" im Abschnitt "Miscellaneous", wenn das Puzzle keine nicht standardmäßigen Regeln enthält',
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Use cosmetic shapes and lines for initial shape placement and borders",
                                        [LanguageCode.ru]:
                                            "Используйте косметические фигуры и линии для первоначального размещения фигур и границ",
                                        [LanguageCode.de]:
                                            "Verwenden Sie kosmetische Formen und Linien für die anfängliche Formplatzierung und Grenzen",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Use given digits for the given length of the shape's path",
                                        [LanguageCode.ru]: "Используйте данные цифры для указанной длины пути фигуры",
                                        [LanguageCode.de]:
                                            "Benutze die angegebenen Ziffern für die angegebene Länge des Pfades der Form",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            'Use white cosmetic lines to hide borders between "hole" cells',
                                        [LanguageCode.ru]:
                                            "Используйте белые косметические линии, чтобы спрятать границы между клетками-«дырками»",
                                        [LanguageCode.de]:
                                            'Verwenden Sie weiße kosmetische Linien, um Grenzen zwischen "Loch"-Zellen zu verbergen',
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                    {
                        id: "fractional-sudoku",
                        title: (
                            <ExampleTab
                                title={translate({ [LanguageCode.en]: "Fractional sudoku" })}
                                puzzle={CloseQuarters}
                            />
                        ),
                        contents: (
                            <>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Create a puzzle twice the desired size",
                                        [LanguageCode.ru]: "Создайте головоломку размером в два раза больше желаемого",
                                        [LanguageCode.de]:
                                            "Erstellen Sie ein Puzzle in der doppelten gewünschten Größe",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]: "Mark each cell piece with a different color",
                                        [LanguageCode.ru]: "Отметьте каждую часть клетки различным цветом",
                                        [LanguageCode.de]: "Markieren Sie jedes Zellstück mit einer anderen Farbe",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Define sudoku regions as usual, ignore Sudoku Maker's warnings about exceeding the region size",
                                        [LanguageCode.ru]:
                                            "Определите регионы судоку как обычно, игнорируйте предупреждения Sudoku Maker-а о превышении размера региона",
                                        [LanguageCode.de]:
                                            "Definieren Sie Sudoku-Regionen wie gewohnt und ignorieren Sie die Warnungen des Sudoku Makers bezüglich der Überschreitung der Regionsgröße",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Put given digits and the digits of the embedded solution in the first cell (in the reading order) that represents the cell piece",
                                        [LanguageCode.ru]:
                                            "Поместите заданные цифры и цифры встроенного решения в первую клетку (в порядке чтения), которая представляет часть клетки",
                                        [LanguageCode.de]:
                                            "Tragen Sie die angegebenen Ziffern und die Ziffern der eingebetteten Lösung in die erste Zelle (in der Lesereihenfolge) ein, die das Zellstück darstellt",
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Note: it's not recommended to include the embedded solution (to avoid forcing the order of entering digits in equally sized cell pieces), it's better to rely on the conflict checker only",
                                        [LanguageCode.ru]:
                                            "Примечание: не рекомендуется включать встроенное решение (чтобы избежать принудительного порядка ввода цифр в ячейки одинакового размера), лучше полагаться только на средство проверки конфликтов",
                                        [LanguageCode.de]:
                                            "Hinweis: Es wird nicht empfohlen, die eingebettete Lösung einzuschließen (um zu vermeiden, dass die Reihenfolge der Eingabe von Ziffern in gleich großen Zellteilen erzwungen wird). Es ist besser, sich nur auf den Konfliktprüfer zu verlassen",
                                    })}
                                    .
                                </p>
                                <MappingIllustration
                                    puzzle={(plain) => (plain ? CloseQuartersSource : CloseQuarters)}
                                />
                                <p>
                                    {translate(selectGridTypeTranslation("Merged cells"))}.<br />
                                    {translate(selectAdditionalConstraintTranslation("Fractional sudoku"))}.<br />
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            'Check the "Verify the solution based on the conflict checker" flag in the "Miscellaneous" section if the puzzle does not have non-standard rules',
                                        [LanguageCode.ru]:
                                            "Установите флажок «Verify the solution based on the conflict checker» в разделе «Miscellaneous», если головоломка не имеет нестандартных правил",
                                        [LanguageCode.de]:
                                            'Aktivieren Sie das Kontrollkästchen "Verify the solution based on the conflict checker" im Abschnitt "Miscellaneous", wenn das Puzzle keine nicht standardmäßigen Regeln enthält',
                                    })}
                                    .
                                </p>
                                <p>
                                    {translate({
                                        [LanguageCode.en]:
                                            "Note: variant constraints (e.g. cages, renban) are currently not supported. Please contact Chameleon if you're going to use them in your puzzle",
                                        [LanguageCode.ru]:
                                            "Примечание: ограничения вариантов (например, клетки, ренбан) в настоящее время не поддерживаются. Пожалуйста, свяжитесь с Chameleon-ом, если вы собираетесь использовать их в своей головоломке",
                                        [LanguageCode.de]:
                                            "Hinweis: Variantenbeschränkungen (z. B. Käfige, Renban) werden derzeit nicht unterstützt. Bitte kontaktieren Sie Chameleon, wenn Sie diese in Ihrem Puzzle verwenden möchten",
                                    })}
                                    .
                                </p>
                            </>
                        ),
                    },
                ]}
            />
        </>
    );
});
