import {CoordsBase3D, Position3D, rotateCoordsBase3D} from "../../../types/layout/Position3D";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FullCubePTM} from "./FullCubePTM";

export interface FullCubeGameState {
    coordsBase: CoordsBase3D;
    // TODO: don't animate on puzzle reset?
}

export interface ProcessedFullCubeGameState {
    animatedCoordsBase: CoordsBase3D;
}

export const gameStateHandleRotateFullCube = (context: PuzzleContext<FullCubePTM>, axis: Position3D, angle: number) =>
    context.onStateChange((context) => ({
        extension: {
            coordsBase: rotateCoordsBase3D(context.stateExtension.coordsBase, axis, angle),
        },
    }));
