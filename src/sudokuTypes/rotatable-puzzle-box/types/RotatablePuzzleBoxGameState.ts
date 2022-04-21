export interface RotatablePuzzleBoxGameState {
    angle: number;
}

export interface RotatablePuzzleBoxProcessedGameState extends RotatablePuzzleBoxGameState {
    animatedAngle: number;
}
