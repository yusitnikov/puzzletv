import { Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { FullCubePTM } from "../types/FullCubePTM";
import { Position3D, rotateVector3D, vectorOx, vectorOy } from "../../../types/layout/Position3D";
import { matrix3, vector3 } from "xyzw";

export const transformFullCubeCoords3D = (
    { top, left }: Position,
    context: PuzzleContext<FullCubePTM>,
    useAnimatedCoords = true,
) => {
    const {
        puzzle: {
            gridSize: { columnsCount },
        },
    } = context;

    const coordsBase = useAnimatedCoords
        ? context.processedGameStateExtension.animatedCoordsBase
        : context.stateExtension.coordsBase;

    const realFieldSize = columnsCount / 3;

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
            realPoint = rotateVector3D(realPoint, vectorOy, leftQuad * 90);
            break;
        case 1:
            realPoint = rotateVector3D(realPoint, vectorOx, leftQuad * 90);
            break;
        case 2:
            switch (leftQuad) {
                case 0:
                    realPoint.x -= realFieldSize;
                    break;
                case 1:
                    realPoint = rotateVector3D(realPoint, vectorOx, 90);
                    realPoint.x -= realFieldSize;
                    break;
                case 2:
                    realPoint = rotateVector3D(realPoint, vectorOx, 90);
                    realPoint.z -= realFieldSize;
                    break;
            }
            break;
    }

    if (topQuad !== 2) {
        realPoint = vector3.MultiplyMatrix3(matrix3.Quaternion(coordsBase), realPoint);
    }

    return realPoint;
};
