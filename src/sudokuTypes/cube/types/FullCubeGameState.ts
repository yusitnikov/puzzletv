import {Position3D, rotateCoordsBase3D} from "../../../types/layout/Position3D";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FullCubePTM} from "./FullCubePTM";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {vector4} from "xyzw";

export interface FullCubeGameState {
    // Rotation quaternion
    coordsBase: vector4.Vector4;
    // TODO: don't animate on puzzle reset?
}

export interface ProcessedFullCubeGameState {
    animatedCoordsBase: vector4.Vector4;
}

export const gameStateHandleRotateFullCube = (
    context: PuzzleContext<FullCubePTM>,
    axis: Position3D,
    angle: number,
): PartialGameStateEx<FullCubePTM> => ({
    extension: {
        coordsBase: rotateCoordsBase3D(context.stateExtension.coordsBase, axis, angle),
    },
});
