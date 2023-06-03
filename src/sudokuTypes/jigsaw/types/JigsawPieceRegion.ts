import {makeAutoObservable} from "mobx";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {JigsawPTM} from "./JigsawPTM";
import {getActiveJigsawPieceZIndex, getJigsawPiecesWithCache} from "./helpers";
import {Position, rotateVectorClockwise} from "../../../types/layout/Position";
import {getRectCenter} from "../../../types/layout/Rect";
import {profiler} from "../../../utils/profiler";

export class JigsawPieceRegion implements GridRegion {
    private readonly center: Position;

    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
    readonly cells?: Position[];

    get zIndex() {
        profiler.trace();
        return this.context.fieldExtension.pieces[this.index].zIndex;
    }

    private get activeZIndex() {
        profiler.trace();
        return getActiveJigsawPieceZIndex(this.context.fieldExtension.pieces);
    }

    get highlighted() {
        profiler.trace();
        return this.context.stateExtension.highlightCurrentPiece && this.zIndex === this.activeZIndex;
    }

    constructor(
        private readonly context: PuzzleContext<JigsawPTM>,
        private readonly index: number,
    ) {
        makeAutoObservable(this);

        const {cells, boundingRect} = getJigsawPiecesWithCache(context.puzzleIndex).pieces[index];

        this.top = boundingRect.top;
        this.left = boundingRect.left;
        this.width = boundingRect.width;
        this.height = boundingRect.height;

        if (cells.length) {
            this.cells = cells;
        }

        this.center = getRectCenter(boundingRect);

        this.transformCoords = this.transformCoords.bind(this);
    }

    private get animatedPosition() {
        profiler.trace();
        return this.context.processedGameStateExtension.pieces[this.index];
    }

    private get animatedTop() {
        profiler.trace();
        return this.animatedPosition.top;
    }

    private get animatedLeft() {
        profiler.trace();
        return this.animatedPosition.left;
    }

    private get animatedAngle() {
        profiler.trace();
        return this.animatedPosition.angle;
    }

    transformCoords(position: Position): Position {
        const rotated = rotateVectorClockwise(position, this.animatedAngle, this.center);

        return {
            top: rotated.top + this.animatedTop,
            left: rotated.left + this.animatedLeft,
        };
    }
}
