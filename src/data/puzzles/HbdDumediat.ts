import { FPuzzles } from "./Import";
import { PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { JigsawPTM } from "../../puzzleTypes/jigsaw/types/JigsawPTM";
import { PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/puzzle/PuzzleImportOptions";
import { JigsawGridState } from "../../puzzleTypes/jigsaw/types/JigsawGridState";
import { stringifyPosition } from "../../types/layout/Position";
import { JigsawPieceInfo } from "../../puzzleTypes/jigsaw/types/JigsawPieceInfo";

export const HappyBirthdayDumediat: PuzzleDefinitionLoader<JigsawPTM> = {
    loadPuzzle: () => {
        const puzzle = FPuzzles.loadPuzzle({
            type: PuzzleImportPuzzleType.Jigsaw,
            maxDigit: 9,
            angleStep: 90,
            stickyRegion: {
                top: 0,
                left: 0,
                width: 9,
                height: 9,
            },
            noPieceRegions: true,
            splitUnconnectedRegions: true,
            load: "N4IgzglgXgpiBcBOANCALhNAbO8QAkBDAB2IE8ACAIwgCc0ALAE0LOQoBEBXAWxiYiE0AQhCpCXRgHtaCEAGEGhPjikA7MSFpccYGGjkA5GT0JYKiAB6IKYLkykBrLhW26KJYljIA6ADpqAQDqDJgwFA5oYB604WBohGostEwUjrRSxI4QEVJRFAC0FIzhAgDmmLYwxIS0QvzUlIS5aDHhAMbqeu2SEABuMP5qAOKxMGoUWBBqMNG1cQlJtanDMLSmEwDuoWDEa9FFhEwAVoTt463nWFhzWOplxQzhUzMREABm72uNHq04hPEKABWIYAeTqajKz2mszatkWyVSakIVBmtEmMIOFA+HjeFVanhgtWi6ke0Jm7BKExKeMw0U6am6vQGFE2mAY2NaPC4gLUeQ8pCJtB8nAg+JJE2ayNR3xeHUSfNasT2QiGAXwUk2MAGtEpTwoxAgMHOJPeZIoZVoEFS81s7TqPCoOFS0zQUlxxzFYEImxFAAUsGdwjTPWVvZsDUaTRR3hkeOarWUGK1IExwuo3eaYDxiGhKJbrRRSTScO8U9bwgAKEqxOEwSxnbCUcZSLhJyPG2GZ94Qa7m7ZSHAWq1MACUtndjCE5vaWC4sLlFC4xGKUihNYolcXsak8fU4VD4Y75woDIwann0UzNKOp3Oalahs72Op+u9fDesXaGHUevCNXoU1zUiaJ4ggdpHFXdcnlocdElSd4TFxMBBz6FEhzsBxnCGAAZTEKBmHVbDZNB2g5To7loaJpnNHhrSYIcpDNEsYXYQjvnGVJSWaK5zCoGQ011DwkgI7VvjAEiyM/Y0fwmbjTxgPt+JSNYhgAFX1Q8fWPWFOh0VIqHCDIEjQfh2CoSRTwVflDJjKZBSYEUAFU9HNPwQB4KQBncihPLTTcABYYgyTYwHHTMmDqB54NcPJ6nNJ8TR8TQCyYBAAG10uAABfZAcry3L8qKwqSoKgBdZAstK4qCtqmqcoqqq6uqlrmsa+rWo68rKq63qWvazrBranqhr67qmrGvqBuamaprK7KgA===",
            extraGrids: [
                {
                    load: "N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9ljSQA3AQwBsBXOJVNCCmAOwQBcMGTQMMFgHtO8AEz8QgkWIDMUmRFEIF5JSvhrQ1eowAczVh268Y/IgF1khaUOViAjIvubn612MkfZCbztoGBAB2IzYxHj4fBwQABhdfeHjozWTia1sNJwSYrRzNbTtE7QtSfPlyuNRdIPgANjCTeEjzDIFPP0qJLv8i3LS+1K6BrM6UivG4qxt2xJGOpNLZ3Pdlgq65asCDRoizHq29BAb0Yz2otYnLqbbBsXnE3pqd0/DTC7uEVc/Fyby/76jeCAhbOW5A3oQjZdEFzYY9BF/STghYPfowxHXbpIw61E4sN7NfZ/QpA0kLBQouEAjEk6F0v5ooaMqzWEDYCAAM05MEE7AAxoxbIKaDQwPgQAAlOQAYXEIFQkvEcpAlikIrFEqVMoALAqpY5dar1TBReL4Hgpcq6vrJYabWryBrzZbpTL9LblR7HaBnVqdTKAKy22XBtVsmgQdhC0CR6Mu111d224Iy4IpmU2xWp4PZo15uS2pPyyxs4R0LhxmAyhAgADE4liAFEAIKN/UAdxwXAAFnEAHRyQNSKsJqWBmWOIuTjNTxX6FWKxAywtL/NS5e5jeZ23L9Pz5N5xDT4+KienqUBj2K2X7qWyrP3oMh9du1eXlWl1DlytR6u1htmzbWJO27PskkHYdyFHfBXQnOcPxLMsKyrGt4HrRtW3bVAu2wXsByHEc/zHSUky3SUJ3IgMw2Q39ozQ+sABEACE6kY2IQJwsCCKg2NiNgj89RvV9lT1L8QB/VCAJYtiONAvDwNiSCiPjAS3XlRUAw08dP1oqT0LrGT2M4kBcPwiDCOg/iLVdANHzdezrVVPS/wYwzWOM+TzKUyy+NUmyn2vD8goo5NxMk1zpI8uSuIUnirCIIA=",
                    offsetX: 10,
                    offsetY: 0,
                },
            ],
        } as PuzzleImportOptions);

        const baseInitialStateFn = puzzle.typeManager.initialGridStateExtension as (
            puzzle: PuzzleDefinition<JigsawPTM>,
        ) => JigsawGridState;

        const initialScale = 0.85;
        return {
            ...puzzle,
            typeManager: {
                ...puzzle.typeManager,
                initialPosition: {
                    top: 0,
                    left: -1.25 * initialScale,
                },
                initialScale,
                initialGridStateExtension: (puzzle) => {
                    const pieces: JigsawPieceInfo[] = puzzle.extension.pieces;
                    const pieceIndexByCell: Record<string, number> = {};
                    for (const [index, { cells }] of pieces.entries()) {
                        for (const cell of cells) {
                            pieceIndexByCell[stringifyPosition(cell)] = index;
                        }
                    }

                    const result = baseInitialStateFn(puzzle);

                    const movePiece = (top: number, left: number, newTop: number, newLeft: number, angle: number) => {
                        const index = pieceIndexByCell[stringifyPosition({ top: top - 1, left: left + 9 })];
                        const position = result.pieces[index];
                        position.top = newTop - top - 1.5;
                        position.left = newLeft - left;
                        position.angle = angle;
                    };

                    for (let i = 0; i < result.pieces.length; i++) {
                        result.pieces[i].left = 50;
                    }

                    movePiece(3, 9, 0.5, 1, 0);
                    movePiece(3, 7, 0.5, 2.5, 0);
                    movePiece(1, 2, 1, 5, 180);
                    movePiece(8, 4, 2.5, 4, 0);
                    movePiece(2, 5, 1.5, 7.5, 0);
                    movePiece(5, 5, 1, 9, 0);
                    movePiece(6, 3, 1.5, 11.5, 180);

                    movePiece(1, 8, 4.5, 1, 180);
                    movePiece(6, 2, 4, 3.5, -90);
                    movePiece(2, 3, 5.5, 5, 90);
                    movePiece(8, 1, 4, 6.5, 90);
                    movePiece(2, 1, 4.5, 9, -90);
                    movePiece(6, 5, 4, 10.5, 180);

                    movePiece(5, 1, 7.5, 1, -90);
                    movePiece(8, 3, 7, 3.5, -90);
                    movePiece(9, 8, 8, 5, 90);
                    movePiece(4, 2, 8, 6.5, 90);
                    movePiece(2, 7, 8, 8, 90);
                    movePiece(6, 4, 8, 9.5, 0);
                    movePiece(7, 8, 8, 11, 90);

                    movePiece(4, 8, 11, 1, 180);
                    movePiece(8, 8, 10.5, 3.5, 0);
                    movePiece(3, 3, 12, 3.5, 0);
                    movePiece(6, 8, 10.5, 7, 180);
                    movePiece(4, 5, 12, 7, 180);
                    movePiece(9, 5, 10.5, 10.5, 0);
                    movePiece(1, 6, 12, 10.5, 180);

                    return result;
                },
            },
        };
    },
    noIndex: true,
    slug: "happy-birthday-dumediat",
};
