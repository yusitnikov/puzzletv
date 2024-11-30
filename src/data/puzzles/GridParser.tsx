import { AnyPTM } from "../../types/sudoku/PuzzleTypeMap";
import { PuzzleImporter } from "./PuzzleImporter";
import { parsePositionLiteral, Position, PositionLiteral } from "../../types/layout/Position";
import { CellColor } from "../../types/sudoku/CellColor";
import { FieldSize } from "../../types/sudoku/FieldSize";
import { PuzzleImportOptions } from "../../types/sudoku/PuzzleImportOptions";
import { Rect } from "../../types/layout/Rect";

export abstract class GridParser<T extends AnyPTM, JsonT> {
    public readonly outsideBounds: Rect;

    protected constructor(
        public puzzleJson: JsonT,
        public bounds: Rect,
        public size: number,
        public minDigit: number | undefined,
        public maxDigit: number | undefined,
        public colorsMap: Record<string, CellColor>,
        public importOptionOverrides: Partial<PuzzleImportOptions>,
    ) {
        this.outsideBounds = { ...bounds };
    }

    abstract addToImporter(importer: PuzzleImporter<T>): void;

    get offsetX() {
        return this.bounds.left;
    }
    get offsetY() {
        return this.bounds.top;
    }
    get columnsCount() {
        return this.bounds.width;
    }
    get rowsCount() {
        return this.bounds.height;
    }

    get regionWidth() {
        const { rowsCount } = this;

        let bestHeight = 1;

        for (let height = 2; height * height <= rowsCount; height++) {
            if (rowsCount % height === 0) {
                bestHeight = height;
            }
        }

        return rowsCount / bestHeight;
    }
    get regionHeight() {
        return this.columnsCount / this.regionWidth;
    }
    get fieldSize(): FieldSize {
        return {
            fieldSize: this.size,
            rowsCount: this.rowsCount,
            columnsCount: this.columnsCount,
            regionWidth: this.regionWidth,
            regionHeight: this.regionHeight,
        };
    }

    offsetCoords(position: PositionLiteral): Position {
        const { top, left } = parsePositionLiteral(position);
        return {
            top: top + this.offsetY,
            left: left + this.offsetX,
        };
    }
    offsetCoordsArray(positions: PositionLiteral[]) {
        return positions.map((position) => this.offsetCoords(position));
    }

    extendOutsideBoundsByCells(cells: Position[]) {
        let { left, top, width, height } = this.outsideBounds;

        let right = left + width;
        let bottom = top + height;

        for (const cell of cells) {
            left = Math.min(left, cell.left);
            top = Math.min(top, cell.top);
            right = Math.max(right, cell.left + 1);
            bottom = Math.max(bottom, cell.top + 1);
        }

        this.outsideBounds.left = left;
        this.outsideBounds.top = top;
        this.outsideBounds.width = right - left;
        this.outsideBounds.height = bottom - top;
    }

    get hasSolution() {
        return false;
    }
    get hasFog() {
        return false;
    }
    get hasCosmeticElements() {
        return false;
    }
    get hasInitialColors() {
        return false;
    }
    get hasSolutionColors() {
        return false;
    }
    get hasArrows() {
        return false;
    }
    get hasZeroRegion() {
        return false;
    }

    get quadruplePositions(): Position[] {
        return [];
    }
}

export type GridParserFactory<T extends AnyPTM, JsonT> = (
    load: string,
    offsetX: number,
    offsetY: number,
    importOptionOverrides: Partial<PuzzleImportOptions>,
) => GridParser<T, JsonT>;
