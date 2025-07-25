import { observer } from "mobx-react-lite";
import { PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { CustomCellBounds } from "../../types/puzzle/CustomCellBounds";
import { getPointsBoundingBox } from "../../types/layout/Rect";
import { isSamePosition, Line, Position } from "../../types/layout/Position";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { PuzzleInputMode } from "../../types/puzzle/PuzzleInputMode";
import { LoopLineConstraint } from "../../components/puzzle/constraints/loop-line/LoopLine";
import { CellPart } from "../../types/puzzle/CellPart";
import { CellBorderLinesCountConstraint } from "../../components/puzzle/constraints/cell-border-lines-count/CellBorderLinesCount";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { PropsWithChildren } from "react";
import { PuzzleContextProps } from "../../types/puzzle/PuzzleContext";
import { ZoomInButtonItem, ZoomOutButtonItem } from "../../components/puzzle/controls/ZoomButton";
import { RulesUnorderedList } from "../../components/puzzle/rules/RulesUnorderedList";
import { translate } from "../../utils/translate";

const scale = 0.01;
const imageWidth = 1132,
    imageHeight = 754,
    originalImageHeight = 912;
const fieldHeight = scale * originalImageHeight;
const fieldWidth = (fieldHeight * imageWidth) / imageHeight;
const offset = (fieldWidth - fieldHeight) / 2;

const linesSrc = [
    [277, 305, 490, 480],
    [305, 323, 480, 486],
    [323, 289, 486, 556],
    [289, 263, 556, 539],
    [263, 277, 539, 490],
    [289, 253, 556, 606],
    [253, 221, 606, 590],
    [221, 263, 590, 539],
    [263, 289, 539, 556],
    [253, 175, 606, 663],
    [175, 174, 663, 632],
    [174, 221, 632, 590],
    [221, 253, 590, 606],
    [175, 73, 663, 688],
    [73, 174, 688, 632],
    [174, 175, 632, 663],
    [253, 236, 606, 704],
    [236, 174, 704, 725],
    [174, 175, 725, 663],
    [175, 253, 663, 606],
    [236, 230, 704, 795],
    [230, 173, 795, 799],
    [173, 174, 799, 725],
    [174, 236, 725, 704],
    [230, 207, 795, 908],
    [207, 165, 908, 907],
    [165, 173, 907, 799],
    [173, 230, 799, 795],
    [175, 174, 543, 584],
    [174, 113, 584, 641],
    [113, 99, 641, 623],
    [99, 175, 623, 543],
    [113, 7, 641, 689],
    [7, 99, 689, 623],
    [99, 113, 623, 641],
    [174, 174, 632, 584],
    [174, 220, 584, 533],
    [220, 221, 533, 590],
    [221, 174, 590, 632],
    [323, 349, 486, 465],
    [349, 363, 465, 409],
    [363, 281, 409, 443],
    [281, 277, 443, 490],
    [277, 305, 490, 480],
    [305, 323, 480, 486],
    [277, 221, 490, 476],
    [221, 220, 476, 533],
    [220, 221, 533, 590],
    [221, 263, 590, 539],
    [263, 277, 539, 490],
    [221, 187, 476, 438],
    [187, 175, 438, 543],
    [175, 174, 543, 584],
    [174, 220, 584, 533],
    [220, 221, 533, 476],
    [363, 366, 409, 338],
    [366, 331, 338, 310],
    [331, 290, 310, 365],
    [290, 281, 365, 443],
    [281, 363, 443, 409],
    [281, 235, 443, 410],
    [235, 221, 410, 476],
    [221, 277, 476, 490],
    [277, 281, 490, 443],
    [235, 216, 410, 369],
    [216, 187, 369, 438],
    [187, 221, 438, 476],
    [221, 235, 476, 410],
    [290, 260, 365, 323],
    [260, 235, 323, 410],
    [235, 281, 410, 443],
    [281, 290, 443, 365],
    [260, 251, 323, 274],
    [251, 216, 274, 369],
    [216, 235, 369, 410],
    [235, 260, 410, 323],
    [349, 372, 465, 514],
    [372, 455, 514, 473],
    [455, 459, 473, 449],
    [459, 403, 449, 454],
    [403, 349, 454, 465],
    [331, 363, 310, 291],
    [363, 326, 291, 250],
    [326, 286, 250, 271],
    [286, 260, 271, 323],
    [260, 290, 323, 365],
    [290, 331, 365, 310],
    [326, 340, 250, 156],
    [340, 292, 156, 180],
    [292, 286, 180, 271],
    [286, 326, 271, 250],
    [292, 251, 180, 274],
    [251, 260, 274, 323],
    [260, 286, 323, 271],
    [286, 292, 271, 180],
    [363, 392, 291, 233],
    [392, 381, 233, 154],
    [381, 340, 154, 156],
    [340, 326, 156, 250],
    [326, 363, 250, 291],
    [381, 403, 154, 154],
    [403, 450, 154, 164],
    [450, 434, 164, 242],
    [434, 392, 242, 233],
    [392, 381, 233, 154],
    [450, 473, 164, 145],
    [473, 551, 145, 137],
    [551, 546, 137, 181],
    [546, 492, 181, 185],
    [492, 450, 185, 164],
    [551, 471, 137, 128],
    [471, 403, 128, 154],
    [403, 450, 154, 164],
    [450, 473, 164, 145],
    [473, 551, 145, 137],
    [551, 609, 137, 134],
    [609, 682, 134, 166],
    [682, 622, 166, 208],
    [622, 546, 208, 181],
    [546, 551, 181, 137],
    [682, 737, 166, 220],
    [737, 678, 220, 256],
    [678, 622, 256, 208],
    [622, 682, 208, 166],
    [737, 769, 220, 246],
    [769, 771, 246, 296],
    [771, 746, 296, 347],
    [746, 681, 347, 294],
    [681, 678, 294, 256],
    [678, 737, 256, 220],
    [746, 672, 347, 412],
    [672, 623, 412, 357],
    [623, 681, 357, 294],
    [681, 746, 294, 347],
    [672, 634, 412, 442],
    [634, 590, 442, 380],
    [590, 623, 380, 357],
    [623, 672, 357, 412],
    [634, 559, 442, 497],
    [559, 535, 497, 415],
    [535, 590, 415, 380],
    [590, 634, 380, 442],
    [559, 509, 497, 512],
    [509, 495, 512, 443],
    [495, 535, 443, 415],
    [535, 559, 415, 497],
    [509, 460, 512, 522],
    [460, 455, 522, 473],
    [455, 459, 473, 449],
    [459, 495, 449, 443],
    [495, 509, 443, 512],
    [459, 473, 449, 394],
    [473, 409, 394, 402],
    [409, 403, 402, 454],
    [403, 459, 454, 449],
    [409, 363, 402, 409],
    [363, 349, 409, 465],
    [349, 403, 465, 454],
    [403, 409, 454, 402],
    [366, 399, 338, 318],
    [399, 423, 318, 337],
    [423, 409, 337, 402],
    [409, 363, 402, 409],
    [363, 366, 409, 338],
    [473, 498, 394, 306],
    [498, 423, 306, 337],
    [423, 409, 337, 402],
    [409, 473, 402, 394],
    [399, 363, 318, 291],
    [363, 392, 291, 233],
    [392, 434, 233, 242],
    [434, 399, 242, 318],
    [434, 498, 242, 306],
    [498, 423, 306, 337],
    [423, 399, 337, 318],
    [399, 434, 318, 242],
    [498, 492, 306, 185],
    [492, 450, 185, 164],
    [450, 434, 164, 242],
    [434, 498, 242, 306],
    [498, 575, 306, 287],
    [575, 622, 287, 208],
    [622, 546, 208, 181],
    [546, 492, 181, 185],
    [492, 498, 185, 306],
    [498, 590, 306, 380],
    [590, 535, 380, 415],
    [535, 495, 415, 443],
    [495, 459, 443, 449],
    [459, 473, 449, 394],
    [473, 498, 394, 306],
    [575, 681, 287, 294],
    [681, 623, 294, 357],
    [623, 590, 357, 380],
    [590, 498, 380, 306],
    [498, 575, 306, 287],
    [575, 622, 287, 208],
    [622, 678, 208, 256],
    [678, 681, 256, 294],
    [681, 575, 294, 287],
    [509, 522, 512, 593],
    [522, 577, 593, 578],
    [577, 559, 578, 497],
    [559, 509, 497, 512],
    [585, 588, 907, 876],
    [588, 677, 876, 862],
    [677, 677, 862, 906],
    [677, 585, 906, 907],
    [588, 545, 876, 844],
    [545, 472, 844, 877],
    [472, 489, 877, 907],
    [489, 585, 907, 907],
    [585, 588, 907, 876],
    [545, 539, 844, 822],
    [539, 452, 822, 822],
    [452, 472, 822, 877],
    [472, 545, 877, 844],
    [539, 553, 822, 797],
    [553, 479, 797, 748],
    [479, 452, 748, 822],
    [452, 539, 822, 822],
    [553, 581, 797, 766],
    [581, 546, 766, 727],
    [546, 479, 727, 748],
    [479, 553, 748, 797],
    [581, 580, 766, 710],
    [580, 546, 710, 727],
    [546, 581, 727, 766],
    [588, 587, 876, 816],
    [587, 625, 816, 794],
    [625, 675, 794, 814],
    [675, 677, 814, 862],
    [677, 588, 862, 876],
    [587, 581, 816, 766],
    [581, 624, 766, 722],
    [624, 625, 722, 794],
    [625, 587, 794, 816],
    [624, 687, 722, 741],
    [687, 675, 741, 814],
    [675, 625, 814, 794],
    [625, 624, 794, 722],
    [687, 719, 741, 680],
    [719, 625, 680, 662],
    [625, 624, 662, 722],
    [624, 687, 722, 741],
    [580, 576, 710, 646],
    [576, 625, 646, 662],
    [625, 624, 662, 722],
    [624, 581, 722, 766],
    [581, 580, 766, 710],
    [576, 521, 646, 646],
    [521, 479, 646, 748],
    [479, 546, 748, 727],
    [546, 580, 727, 710],
    [580, 576, 710, 646],
    [576, 577, 646, 578],
    [577, 522, 578, 593],
    [522, 521, 593, 646],
    [521, 576, 646, 646],
    [719, 744, 680, 611],
    [744, 678, 611, 571],
    [678, 633, 571, 583],
    [633, 625, 583, 662],
    [625, 719, 662, 680],
    [633, 577, 583, 578],
    [577, 576, 578, 646],
    [576, 625, 646, 662],
    [625, 633, 662, 583],
    [634, 685, 442, 486],
    [685, 678, 486, 571],
    [678, 633, 571, 583],
    [633, 577, 583, 578],
    [577, 559, 578, 497],
    [559, 634, 497, 442],
    [744, 783, 611, 506],
    [783, 685, 506, 486],
    [685, 678, 486, 571],
    [678, 744, 571, 611],
    [719, 777, 680, 670],
    [777, 744, 670, 611],
    [744, 719, 611, 680],
    [783, 752, 506, 426],
    [752, 672, 426, 412],
    [672, 634, 412, 442],
    [634, 685, 442, 486],
    [685, 783, 486, 506],
    [682, 832, 166, 198],
    [832, 769, 198, 246],
    [769, 737, 246, 220],
    [737, 682, 220, 166],
    [832, 874, 198, 206],
    [874, 855, 206, 264],
    [855, 771, 264, 296],
    [771, 769, 296, 246],
    [769, 832, 246, 198],
    [855, 845, 264, 332],
    [845, 796, 332, 367],
    [796, 746, 367, 347],
    [746, 771, 347, 296],
    [771, 855, 296, 264],
    [796, 752, 367, 426],
    [752, 672, 426, 412],
    [672, 746, 412, 347],
    [746, 796, 347, 367],
    [777, 847, 670, 702],
    [847, 860, 702, 641],
    [860, 806, 641, 602],
    [806, 744, 602, 611],
    [744, 777, 611, 670],
    [806, 866, 602, 559],
    [866, 843, 559, 481],
    [843, 783, 481, 506],
    [783, 744, 506, 611],
    [744, 806, 611, 602],
    [843, 851, 481, 408],
    [851, 796, 408, 367],
    [796, 752, 367, 426],
    [752, 783, 426, 506],
    [783, 843, 506, 481],
    [866, 945, 559, 566],
    [945, 949, 566, 638],
    [949, 860, 638, 641],
    [860, 806, 641, 602],
    [806, 866, 602, 559],
    [847, 902, 702, 720],
    [902, 956, 720, 722],
    [956, 949, 722, 638],
    [949, 860, 638, 641],
    [860, 847, 641, 702],
    [956, 1029, 722, 725],
    [1029, 1029, 725, 640],
    [1029, 949, 640, 638],
    [949, 956, 638, 722],
    [1029, 1107, 725, 723],
    [1107, 1091, 723, 618],
    [1091, 1029, 618, 640],
    [1029, 1029, 640, 725],
    [1107, 1056, 723, 797],
    [1056, 1014, 797, 783],
    [1014, 1029, 783, 725],
    [1029, 1107, 725, 723],
    [956, 967, 722, 780],
    [967, 1014, 780, 783],
    [1014, 1029, 783, 725],
    [1029, 956, 725, 722],
    [1056, 1027, 797, 862],
    [1027, 948, 862, 847],
    [948, 967, 847, 780],
    [967, 1014, 780, 783],
    [1014, 1056, 783, 797],
    [1027, 1026, 862, 904],
    [1026, 925, 904, 906],
    [925, 948, 906, 847],
    [948, 1027, 847, 862],
    [1107, 1160, 723, 729],
    [1160, 1186, 729, 681],
    [1186, 1141, 681, 610],
    [1141, 1091, 610, 618],
    [1091, 1107, 618, 723],
    [1160, 1229, 729, 787],
    [1229, 1271, 787, 742],
    [1271, 1241, 742, 645],
    [1241, 1186, 645, 681],
    [1186, 1160, 681, 729],
    [1271, 1321, 742, 728],
    [1321, 1313, 728, 615],
    [1313, 1241, 615, 645],
    [1241, 1271, 645, 742],
    [1321, 1321, 728, 807],
    [1321, 1252, 807, 838],
    [1252, 1229, 838, 787],
    [1229, 1271, 787, 742],
    [1271, 1321, 742, 728],
    [1321, 1361, 807, 903],
    [1361, 1264, 903, 902],
    [1264, 1252, 902, 838],
    [1252, 1321, 838, 807],
    [1313, 1307, 615, 515],
    [1307, 1234, 515, 510],
    [1234, 1182, 510, 562],
    [1182, 1241, 562, 645],
    [1241, 1313, 645, 615],
    [1182, 1141, 562, 610],
    [1141, 1186, 610, 681],
    [1186, 1241, 681, 645],
    [1241, 1182, 645, 562],
    [1307, 1290, 515, 402],
    [1290, 1215, 402, 401],
    [1215, 1234, 401, 510],
    [1234, 1307, 510, 515],
    [1290, 1256, 402, 310],
    [1256, 1184, 310, 333],
    [1184, 1215, 333, 401],
    [1215, 1290, 401, 402],
    [1256, 1197, 310, 246],
    [1197, 1146, 246, 290],
    [1146, 1184, 290, 333],
    [1184, 1256, 333, 310],
    [1197, 1093, 246, 206],
    [1093, 1073, 206, 270],
    [1073, 1146, 270, 290],
    [1146, 1197, 290, 246],
    [1093, 976, 206, 186],
    [976, 959, 186, 264],
    [959, 1073, 264, 270],
    [1073, 1093, 270, 206],
    [976, 874, 186, 206],
    [874, 855, 206, 264],
    [855, 959, 264, 264],
    [959, 976, 264, 186],
    [845, 925, 332, 369],
    [925, 1002, 369, 332],
    [1002, 959, 332, 264],
    [959, 855, 264, 264],
    [855, 845, 264, 332],
    [1002, 1082, 332, 361],
    [1082, 1146, 361, 290],
    [1146, 1073, 290, 270],
    [1073, 959, 270, 264],
    [959, 1002, 264, 332],
    [1082, 1144, 361, 430],
    [1144, 1215, 430, 401],
    [1215, 1184, 401, 333],
    [1184, 1146, 333, 290],
    [1146, 1082, 290, 361],
    [1144, 1126, 430, 485],
    [1126, 1182, 485, 562],
    [1182, 1234, 562, 510],
    [1234, 1215, 510, 401],
    [1215, 1144, 401, 430],
    [1126, 1041, 485, 530],
    [1041, 1091, 530, 618],
    [1091, 1141, 618, 610],
    [1141, 1182, 610, 562],
    [1182, 1126, 562, 485],
    [1041, 945, 530, 566],
    [945, 949, 566, 638],
    [949, 1029, 638, 640],
    [1029, 1091, 640, 618],
    [1091, 1041, 618, 530],
    [851, 925, 408, 369],
    [925, 845, 369, 332],
    [845, 796, 332, 367],
    [796, 851, 367, 408],
    [925, 951, 369, 427],
    [951, 933, 427, 484],
    [933, 843, 484, 481],
    [843, 851, 481, 408],
    [851, 925, 408, 369],
    [933, 1041, 484, 530],
    [1041, 945, 530, 566],
    [945, 866, 566, 559],
    [866, 843, 559, 481],
    [843, 933, 481, 484],
    [951, 1030, 427, 427],
    [1030, 1082, 427, 361],
    [1082, 1002, 361, 332],
    [1002, 925, 332, 369],
    [925, 951, 369, 427],
    [1030, 1041, 427, 530],
    [1041, 933, 530, 484],
    [933, 951, 484, 427],
    [951, 1030, 427, 427],
    [1082, 1030, 361, 427],
    [1030, 1041, 427, 530],
    [1041, 1126, 530, 485],
    [1126, 1144, 485, 430],
    [1144, 1082, 430, 361],
];

const lines: Line[] = linesSrc.map(([x1, x2, y1, y2]) => ({
    start: { top: y1 * scale + offset, left: x1 * scale },
    end: { top: y2 * scale + offset, left: x2 * scale },
}));

const polygons: Position[][] = [];
let polygon: Position[] = [];

for (const { start, end } of lines) {
    if (polygon.length === 0) {
        polygon = [start, end];
        polygons.push(polygon);
        continue;
    }

    if (!isSamePosition(start, polygon[polygon.length - 1])) {
        throw new Error("WTF?");
    }

    if (isSamePosition(end, polygon[0])) {
        polygon = [];
    } else {
        polygon.push(end);
    }
}

const userAreaCoeff = 0.6;

const bounds: CustomCellBounds[] = polygons.map((points) => {
    const bounds = getPointsBoundingBox(...points);

    return {
        borders: [points],
        userArea: {
            left: bounds.left + (bounds.width * (1 - userAreaCoeff)) / 2,
            top: bounds.top + (bounds.height * (1 - userAreaCoeff)) / 2,
            width: bounds.width * userAreaCoeff,
            height: bounds.height * userAreaCoeff,
        },
    };
});

const Wrapper = observer(function SlitherlinkTestWrapper({
    children,
    context,
}: PropsWithChildren<PuzzleContextProps<NumberPTM>>) {
    return (
        <>
            <img
                src={`${process.env.PUBLIC_URL}/images/elephant.png`}
                alt={"Elephant background"}
                style={{
                    position: "absolute",
                    inset: 0,
                    margin: "auto",
                    width: "100%",
                    pointerEvents: "none",
                    transform: `translate(${context.animatedNormalizedLeft * context.cellSize}px, ${context.animatedNormalizedTop * context.cellSize}px) scale(${context.animatedScale})`,
                }}
            />

            {children}
        </>
    );
});

const BordersCount = (index: number, count: number) => CellBorderLinesCountConstraint({ top: 0, left: index }, count);

export const ElephantSlitherlink: PuzzleDefinition<NumberPTM> = {
    slug: "elephant-slitherlink",
    extension: {},
    title: {
        [LanguageCode.en]: "Elephant slitherlink",
        [LanguageCode.ru]: "Слон-slitherlink",
        [LanguageCode.de]: "Elefanten-Rundweg",
    },
    author: {
        [LanguageCode.en]: "superrabbit",
    },
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Slitherlink (irregular)",
                    [LanguageCode.ru]: "Slitherlink (нестандартный)",
                    [LanguageCode.de]: "Rundweg (irregulär)",
                })}
                :
            </RulesParagraph>
            <RulesUnorderedList>
                <li>
                    {translate({
                        [LanguageCode.en]: "Draw a loop over dotted lines which does not branch or intersect itself",
                        [LanguageCode.ru]:
                            "Нарисуйте замкнутую линию над пунктирными линиями, которая не разветвляется и не пересекает сама себя",
                        [LanguageCode.de]:
                            "Zeichnen Sie eine Schleife über gepunktete Linien, die sich nicht verzweigt oder kreuzt",
                    })}
                    .
                </li>
                <li>
                    {translate({
                        [LanguageCode.en]: "Number clues show how many cell edges are used by the loop",
                        [LanguageCode.ru]: "Числа в клетках показывают, сколько рёбер клеток используется на линии",
                        [LanguageCode.de]: "Zahlenhinweise zeigen, wie viele Zellränder die Linie nutzt",
                    })}
                    .
                </li>
            </RulesUnorderedList>
        </>
    ),
    typeManager: {
        ...DigitPuzzleTypeManager(),
        initialInputMode: PuzzleInputMode.lines,
        allowMove: true,
        allowScale: true,
        isFreeScale: true,
        gridWrapperComponent: Wrapper,
        ignoreRowsColumnCountInTheWrapper: true,
        controlButtons: [ZoomInButtonItem(), ZoomOutButtonItem()],
    },
    gridSize: {
        gridSize: fieldWidth,
        rowsCount: 1,
        columnsCount: bounds.length,
    },
    maxDigit: 0,
    customCellBounds: {
        0: Object.fromEntries(bounds.entries()),
    },
    allowDrawing: ["border-line", "border-mark", "corner-mark"],
    disableDiagonalCenterLines: true,
    disableDiagonalBorderLines: true,
    noGridLines: true,
    mergeGridLines: false,
    borderMarkSize: 0.08,
    items: [
        BordersCount(25, 2),
        BordersCount(20, 1),
        BordersCount(38, 1),
        BordersCount(40, 1),
        BordersCount(27, 2),
        BordersCount(91, 1),
        BordersCount(90, 1),
        BordersCount(67, 0),
        BordersCount(94, 4),
        BordersCount(88, 3),
        BordersCount(17, 3),
        BordersCount(16, 3),
        BordersCount(13, 4),
        BordersCount(68, 2),
        BordersCount(71, 3),
        BordersCount(103, 1),
        BordersCount(96, 2),
        BordersCount(87, 2),
        BordersCount(18, 2),
        BordersCount(33, 4),
        BordersCount(61, 5),
        BordersCount(7, 2),
        BordersCount(9, 1),
        BordersCount(2, 2),
        BordersCount(1, 3),
        BordersCount(5, 2),
        BordersCount(51, 2),
        BordersCount(49, 1),
        BordersCount(48, 1),
        BordersCount(47, 4),
        BordersCount(77, 3),
        BordersCount(78, 2),
        BordersCount(81, 3),
        BordersCount(83, 2),
        LoopLineConstraint(CellPart.corner),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
