export interface SafeCrackerPuzzleParams {
    size: number;
    circleRegionsCount: number;
    codeCellsCount: number;
}

export const defaultSafeCrackerPuzzleParams: SafeCrackerPuzzleParams = {
    size: 9,
    circleRegionsCount: 4,
    codeCellsCount: 6,
};
