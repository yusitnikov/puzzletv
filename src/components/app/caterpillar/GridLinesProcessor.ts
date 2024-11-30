import { Rect } from "../../../types/layout/Rect";
import { Position } from "../../../types/layout/Position";
import { getRegionBorders } from "../../../utils/regions";
import { Scl } from "../../../utils/sudokuPad";

interface PointLine {
    dashed: boolean;
    bold: boolean;
    length: number;
}

enum Direction {
    right,
    bottom,
}

export class GridLinesProcessor {
    private linesMap: Record<Direction, Record<number, Record<number, PointLine>>> = {
        [Direction.right]: {},
        [Direction.bottom]: {},
    };
    private width = 0;
    private height = 0;

    private addLine(
        top: number,
        left: number,
        direction: Direction,
        processor: (prev?: PointLine) => Omit<PointLine, "length"> | undefined,
    ) {
        const result = processor(this.linesMap[direction][top]?.[left]);
        if (!result) {
            return;
        }

        this.width = Math.max(this.width, left + (direction === Direction.right ? 1 : 0));
        this.height = Math.max(this.height, top + (direction === Direction.bottom ? 1 : 0));

        this.linesMap[direction][top] ??= {};
        this.linesMap[direction][top][left] = { ...result, length: 1 };
    }

    addGrid(bounds: Rect, regions: Position[][], dashed: boolean) {
        for (const cells of regions) {
            const points = getRegionBorders(cells, 1, false, false);

            for (const [index, p1] of points.entries()) {
                const p2 = points[(index + 1) % points.length];

                this.addLine(
                    bounds.top + Math.min(p1.top, p2.top),
                    bounds.left + Math.min(p1.left, p2.left),
                    p1.top === p2.top ? Direction.right : Direction.bottom,
                    (prev) => ({
                        dashed: dashed || (prev?.dashed ?? false) || (prev !== undefined && !prev.bold),
                        bold: true,
                    }),
                );
            }
        }

        const thinLineProcessor = (prev?: PointLine) => {
            return {
                dashed: dashed || (prev?.dashed ?? false),
                bold: prev?.bold ?? false,
            };
        };

        for (let top = bounds.top; top <= bounds.top + bounds.height; top++) {
            for (let left = bounds.left; left < bounds.left + bounds.width; left++) {
                this.addLine(top, left, Direction.right, thinLineProcessor);
            }
        }

        for (let left = bounds.left; left <= bounds.left + bounds.width; left++) {
            for (let top = bounds.top; top < bounds.top + bounds.height; top++) {
                this.addLine(top, left, Direction.bottom, thinLineProcessor);
            }
        }
    }

    private optimizeLines() {
        for (let top = 0; top <= this.height; top++) {
            for (let left = 0; left <= this.width; left++) {
                let line = this.linesMap[Direction.right][top]?.[left];
                while (line) {
                    const line2 = this.linesMap[Direction.right][top]?.[left + line.length];
                    if (!line2 || line2.dashed !== line.dashed || line2.bold !== line.bold) {
                        break;
                    }

                    delete this.linesMap[Direction.right][top][left + line.length];
                    line.length += line2.length;
                }

                line = this.linesMap[Direction.bottom][top]?.[left];
                while (line) {
                    const line2 = this.linesMap[Direction.bottom][top + line.length]?.[left];
                    if (!line2 || line2.dashed !== line.dashed || line2.bold !== line.bold) {
                        break;
                    }

                    delete this.linesMap[Direction.bottom][top + line.length][left];
                    line.length += line2.length;
                }
            }
        }
    }

    getLines() {
        this.optimizeLines();

        return Object.entries(this.linesMap).flatMap(([directionStr, map1]) => {
            const direction = Number(directionStr) as Direction;

            return Object.entries(map1).flatMap(([topStr, map2]) => {
                const top = Number(topStr);

                return Object.entries(map2).flatMap(
                    ([leftStr, { dashed, bold, length }]): NonNullable<Scl["lines"]> => {
                        const left = Number(leftStr);

                        return [
                            {
                                target: "cell-grids",
                                thickness: bold ? 3 : 0.5,
                                color: "#000000",
                                fill: undefined,
                                wayPoints: [
                                    [top, left],
                                    [
                                        top + (direction === Direction.bottom ? length : 0),
                                        left + (direction === Direction.right ? length : 0),
                                    ],
                                ],
                                "stroke-dashoffset": dashed ? 1.9 : undefined,
                                "stroke-dasharray": dashed ? "3.8,9" : undefined,
                                "stroke-linecap": undefined,
                                "stroke-linejoin": undefined,
                            },
                        ];
                    },
                );
            });
        });
    }
}
