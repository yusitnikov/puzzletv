export enum ChessPieceType {
    pawn = 1,
    knight,
    bishop,
    rook,
    queen,
    king,
}

export const ChessPieceTypeNotation: Record<ChessPieceType, string> = {
    [ChessPieceType.pawn]: "P",
    [ChessPieceType.knight]: "N",
    [ChessPieceType.bishop]: "B",
    [ChessPieceType.rook]: "R",
    [ChessPieceType.queen]: "Q",
    [ChessPieceType.king]: "K",
};

export const ChessPieceTypeReverseMap: Record<string, ChessPieceType> = {
    P: ChessPieceType.pawn,
    N: ChessPieceType.knight,
    B: ChessPieceType.bishop,
    R: ChessPieceType.rook,
    Q: ChessPieceType.queen,
    K: ChessPieceType.king,
};
