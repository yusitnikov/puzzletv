export interface Position {
    left: number;
    top: number;
}

export interface PositionWithAngle extends Position {
    angle: number;
}

export const emptyPosition: Position = {
    left: 0,
    top: 0,
};

export const emptyPositionWithAngle: PositionWithAngle = {
    ...emptyPosition,
    angle: 0,
};
