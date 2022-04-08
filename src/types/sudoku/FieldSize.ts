export interface FieldSize {
    fieldSize: number;
    verticalLines: number[];
    horizontalLines: number[];
}

export const FieldSize9: FieldSize = {
    fieldSize: 9,
    verticalLines: [3, 6],
    horizontalLines: [3, 6],
};

export const FieldSize8: FieldSize = {
    fieldSize: 8,
    verticalLines: [4],
    horizontalLines: [2, 4, 6],
};
