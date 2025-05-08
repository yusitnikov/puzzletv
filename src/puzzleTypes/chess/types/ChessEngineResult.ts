interface BaseChessEngineResult<T extends string> {
    type: T;
    mid: number;
}

export interface MovesChessEngineResult extends BaseChessEngineResult<"moves"> {
    moves: string[];
}

export interface VariationChessEngineResult extends BaseChessEngineResult<"variation"> {
    score: {
        unit: string;
        value: number;
    };
    depth: number;
    seldepth: number;
    time: number;
    nodes: number;
    currmovenumber: number;
    hashfull: number;
    nps: number;
    tbhits: number;
    cpuload: number;
    multipv: number;
    currmove: string;
    pv: string;
    string: string;
    refutation: string;
    currline: string;
}

export type ChessEngineResult = MovesChessEngineResult | VariationChessEngineResult;
