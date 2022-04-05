export const isUpsideDownAngle = (angle: number) => angle % 360 !== 0;

export const isStartAngle = (angle: number) => angle % 180 !== 0;

export const rotateClockwise = (angle: number) => angle + (isStartAngle(angle) ? 90 : 180);
