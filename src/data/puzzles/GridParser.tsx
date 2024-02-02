import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {PuzzleImporter} from "./PuzzleImporter";
import {parsePositionLiteral, Position, PositionLiteral} from "../../types/layout/Position";
import {CellColor} from "../../types/sudoku/CellColor";
import {FieldSize} from "../../types/sudoku/FieldSize";

export abstract class GridParser<T extends AnyPTM, JsonT> {
    protected constructor(
        public puzzleJson: JsonT,
        public offsetX: number,
        public offsetY: number,
        public size: number,
        public columnsCount: number,
        public rowsCount: number,
        public colorsMap: Record<string, CellColor>,
    ) {}

    abstract addToImporter(importer: PuzzleImporter<T>): void;

    get regionWidth() {
        const {rowsCount} = this;

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
        const {top, left} = parsePositionLiteral(position);
        return {
            top: top + this.offsetY,
            left: left + this.offsetX,
        };
    }
    offsetCoordsArray(positions: PositionLiteral[]) {
        return positions.map((position) => this.offsetCoords(position));
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
    get hasArrows() {
        return false;
    }

    get quadruplePositions(): Position[] {
        return [];
    }
}

export type GridParserFactory<T extends AnyPTM, JsonT> = (load: string, offsetX: number, offsetY: number) => GridParser<T, JsonT>;
