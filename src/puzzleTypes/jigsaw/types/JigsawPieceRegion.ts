import { makeAutoObservable } from "mobx";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { JigsawPTM } from "./JigsawPTM";
import { getActiveJigsawPieceZIndex } from "./helpers";
import { Position, PositionWithAngle, rotateVectorClockwise } from "../../../types/layout/Position";
import { profiler } from "../../../utils/profiler";
import { getAnimatedJigsawPiecePosition } from "./JigsawTypeManager";
import { JigsawGridPieceState } from "./JigsawGridState";

export class JigsawPieceRegion implements GridRegion {
    private readonly center: Position;

    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
    readonly cells?: Position[];

    private get staticPositions() {
        return this.positionOverrides ?? this.context.gridExtension.pieces;
    }

    get zIndex() {
        profiler.trace();
        return this.staticPositions[this.index].zIndex;
    }

    private get activeZIndex() {
        profiler.trace();
        return getActiveJigsawPieceZIndex(this.staticPositions);
    }

    get highlighted() {
        profiler.trace();
        return this.context.stateExtension.highlightCurrentPiece && this.zIndex === this.activeZIndex;
    }

    constructor(
        private readonly context: PuzzleContext<JigsawPTM>,
        private readonly index: number,
        private readonly positionOverrides?: JigsawGridPieceState[],
    ) {
        makeAutoObservable(this);

        const { cells, boundingRect, center } = context.puzzle.extension.pieces[index];

        this.top = boundingRect.top;
        this.left = boundingRect.left;
        this.width = boundingRect.width;
        this.height = boundingRect.height;

        if (cells.length) {
            this.cells = cells;
        }

        this.center = center;

        this.transformCoords = this.transformCoords.bind(this);
    }

    private get animatedPosition(): PositionWithAngle {
        profiler.trace();

        return this.positionOverrides?.[this.index] ?? getAnimatedJigsawPiecePosition(this.context, this.index);
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
