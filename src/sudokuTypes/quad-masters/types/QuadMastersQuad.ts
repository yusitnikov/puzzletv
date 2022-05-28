import {Position} from "../../../types/layout/Position";
import {Set} from "../../../types/struct/Set";

export interface QuadMastersQuad {
    position: Position;
    digits: Set<number>;
}

export const serializeQuad = ({position, digits}: QuadMastersQuad): any => ({
    position,
    digits: digits.serialize(),
});

export const unserializeQuad = ({position, digits}: any): QuadMastersQuad => ({
    position,
    digits: Set.unserialize(digits),
});
