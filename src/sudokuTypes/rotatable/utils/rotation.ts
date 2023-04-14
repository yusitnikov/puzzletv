import {loop, roundToStep} from "../../../utils/math";

export const isUpsideDownAngle = (angle: number) => loop(roundToStep(angle, 180), 360) !== 0;
