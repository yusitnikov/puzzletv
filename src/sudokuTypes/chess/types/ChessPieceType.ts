export enum ChessPieceType {
    pawn = 1,
    knight,
    bishop,
    rook,
    queen,
    king,
}

export const ChessPieceTypeNotation: Record<ChessPieceType, string> = {
    [ChessPieceType.pawn]: "",
    [ChessPieceType.knight]: "N",
    [ChessPieceType.bishop]: "B",
    [ChessPieceType.rook]: "R",
    [ChessPieceType.queen]: "Q",
    [ChessPieceType.king]: "K",
}
