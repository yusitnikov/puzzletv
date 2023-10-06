import {Position} from "../../../types/layout/Position";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FullCubePTM} from "../types/FullCubePTM";
import {initialCoordsBase3D, Position3D, rotateVector3D} from "../../../types/layout/Position3D";

export const transformFullCubeCoords3D = ({top, left}: Position, context: PuzzleContext<FullCubePTM>) => {
    const {
        puzzle: {fieldSize: {fieldSize}},
        processedGameStateExtension: {animatedCoordsBase: {ox, oy, oz}},
    } = context;

    const realFieldSize = fieldSize / 2;

    let topQuad = top < realFieldSize ? 0 : top < realFieldSize * 2 ? 1 : 2;
    let leftQuad = left < realFieldSize ? 0 : left < realFieldSize * 2 ? 1 : 2;

    let realPoint: Position3D = {
        x: left - leftQuad * realFieldSize - realFieldSize / 2,
        y: top - topQuad * realFieldSize - realFieldSize / 2,
        z: realFieldSize / 2,
    };

    if (topQuad === 1) {
        switch (leftQuad) {
            case 0:
                topQuad = 0;
                leftQuad = 3;
                break;
            case 2:
                leftQuad = 3;
                break;
        }
    }

    switch (topQuad) {
        case 0:
            realPoint = rotateVector3D(realPoint, initialCoordsBase3D.oy, leftQuad * 90);
            break;
        case 1:
            realPoint = rotateVector3D(realPoint, initialCoordsBase3D.ox, leftQuad * 90);
            break;
        case 2:
            switch (leftQuad) {
                case 0:
                    realPoint.x -= realFieldSize;
                    break;
                case 1:
                    realPoint = rotateVector3D(realPoint, initialCoordsBase3D.ox, 90);
                    realPoint.x -= realFieldSize;
                    break;
                case 2:
                    realPoint = rotateVector3D(realPoint, initialCoordsBase3D.ox, 90);
                    realPoint.z -= realFieldSize;
                    break;
            }
            break;
    }

    if (topQuad !== 2) {
        const {x, y, z} = realPoint;
        realPoint = {
            x: ox.x * x + oy.x * y + oz.x * z,
            y: ox.y * x + oy.y * y + oz.y * z,
            z: ox.z * x + oy.z * y + oz.z * z,
        };
    }

    return realPoint;
};
