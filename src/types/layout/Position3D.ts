import {rotateVectorClockwise} from "./Position";

export interface Position3D {
    x: number;
    y: number;
    z: number;
}

export interface CoordsBase3D {
    ox: Position3D;
    oy: Position3D;
    oz: Position3D;
}

export const emptyPosition3D: Position3D = {x: 0, y: 0, z: 0};
export const initialCoordsBase3D: CoordsBase3D = {
    ox: {x: 1, y: 0, z: 0},
    oy: {x: 0, y: 1, z: 0},
    oz: {x: 0, y: 0, z: 1},
};

export const isSamePosition3D = (a: Position3D, b: Position3D) => a.x === b.x && a.y === b.y;

export const getVectorLength3D = ({x, y, z}: Position3D) => Math.hypot(x, y, z);

export const addVectors3D = (...vectors: Position3D[]): Position3D => {
    const result: Position3D = {x: 0, y: 0, z: 0};

    for (const {x, y, z} of vectors) {
        result.x += x;
        result.y += y;
        result.z += z;
    }

    return result;
};

export const subtractVectors3D = (a: Position3D, b: Position3D): Position3D => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});

export const scaleVector3D = ({x, y, z}: Position3D, coeff: number): Position3D => ({
    x: x * coeff,
    y: y * coeff,
    z: z * coeff,
});

export const normalizeVector3D = (vector: Position3D): Position3D => scaleVector3D(vector, 1 / (getVectorLength3D(vector) || 1));

export const roundVector3D = ({x, y, z}: Position3D): Position3D => ({
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z),
});

export const getClosestAxis3D = ({x, y, z}: Position3D): Position3D => {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);

    if (absX > absY && absX > absZ) {
        return {x: Math.sign(x), y: 0, z: 0};
    } else if (absY > absZ) {
        return {x: 0, y: Math.sign(y), z: 0};
    } else {
        return {x: 0, y: 0, z: Math.sign(z)};
    }
};

export const scalarMultiplication3D = (a: Position3D, b: Position3D): number =>
    a.x * b.x + a.y * b.y + a.z * b.z;

export const vectorMultiplication3D = (a: Position3D, b: Position3D): Position3D => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});

export const rotateVector3D = (vector: Position3D, axis: Position3D, angle: number): Position3D => {
    // Projection of the vector onto the axis
    const v1 = scaleVector3D(axis, scalarMultiplication3D(axis, vector));
    // The remaining part of the vector, perpendicular to the axis, located in the rotation plane
    const v2 = subtractVectors3D(vector, v1);
    // Vector in the rotation plane, perpendicular to both the source vector and the axis
    const v3 = vectorMultiplication3D(axis, v2);

    // Multiplication coefficients for base vectors in the rotation plane
    const {left: c1, top: c2} = rotateVectorClockwise({left: 1, top: 0}, angle);

    return addVectors3D(
        v1,
        scaleVector3D(v2, c1),
        scaleVector3D(v3, c2),
    );
};

export const rotateCoordsBase3D = ({ox, oy, oz}: CoordsBase3D, axis: Position3D, angle: number): CoordsBase3D => ({
    ox: normalizeVector3D(rotateVector3D(ox, axis, angle)),
    oy: normalizeVector3D(rotateVector3D(oy, axis, angle)),
    oz: normalizeVector3D(rotateVector3D(oz, axis, angle)),
});
