import {SudokuMaker} from "./SudokuMaker";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

const load2 = "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAFUwIOAAiK0QcRggAW0AiACCM+VHGSAxhBh8cCRQCVGHdONEBaUTmjw2o9IwAmEANaNRUEyjNx69NgBPEgAdHGNTcyt0BDgcJzgoJ1FEqAgAd3QSSQRA+n4QRxd3SSxmfgA2Ok0UNjZ0AgBtUAA3ODZGfiIAXxpW9s6CMl7+jsqRkDaxggBmCanB-AAWeYH+AFZV6fw5vsm1ghW9hY2txZ7jg-xhy+2Ks9Pb84ehl+W3+6f+XdHFz9-vm8jgDXl8CJswfgLiD3pCITCfvs7m9oUjFjcYRi0eNIaiTuC3oj8e8ALrVXAxKBwTD6Br4ZogXL5AiUCZMrp0KAoADm2BwdMalBoQqFRBoYrFIuF4plYrINHl8pmNGVysVCpVmuVSxoOp16xoBoNet1hrN6xJbLy-CWlAAHHQAEYmR3oADqwlkSigaUyTVAzrYjoAwrV6k0iDMyVIfRkBY1I+KdQ6yCTLXtAyGwwKyBVo6k401GrmFaKAJziu1piaZ0N1AVl-Oxv30xoVogGohVIgAdmrGZddfD9LIqboBZbjWLirlPZVUct0ZigQ4XBAmbXZX4lBIDvAmDqigAxGBT2fSgg0q5+KA5JhNK4cD46TvKPKQNo2ApCEe4H--yA3S9DGvprneD5PugL5UAaH4QF+UDHv+AF0LIKBwE4ADKmDlCyJAzJsQGWt0QA";
const load1 = "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAFUwIOAAjK0QcRggAW0AiACCM+VHGSAxhBh8cCRQCVGHdONEBaUTmjw2o9IwAmEANaNRUEyjNx69NgBPEgAdHGNTcyt0BDgcJzgoJ1FEqAgAd3QSSQRA+n4QRxd3SSxmfgA2Ok0UNjZ0AgBtUAA3ODZGfiIAXxpW9s6CMl7+jsqRkDaxggBmCanB-AAWeYH+AFZV6fw5vsm1ghW9hY2txZ7jg-xhy+2Ks9Pb84ehl+W3+6f+XdHFz9-vm8jgDXl8CJswfgLiD3pCITCfvs7m9oUjFjcYRi0eNIaiTuC3oj8e8ALrVXAxKBwTD6Br4ZogXL5AiUCZMrp0KAoADm2BwdMalBoQqFRBoYrFIuF4plYrINHl8pmNGVysVCpVmuVSxoOp16xoBoNet1hrN6xJbLy-CWlAAHHQAEYmR3oADqwlkSigaUyTVAzrYjoAwrV6k0iDMyVIfRkBY1I+KdQ6yCTLXtAyGwwKyBVo6k401GrmFaKAJziu1piaZ0N1AVl-Oxv30xoVogGohVIgAdmrGZddfD9LIqboBZbjWLirlPZVUct0ZigQ4XBAmbXZX4lBIDvAmDqigAxGBT2fSgg0q5+KA5JhNK4cD46TvKPKQNo2ApCEe4H--yA3S9DGvprneD5PugL5UAaH4QF+UDHv+AF0LIKBwE4ADKmDlCyJAzJsQGWt0QA";

export const CaterpillarPoc: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => SudokuMaker.loadPuzzle({
        title: "Meme's Caterdokupillar",
        author: "A lot of people, really",
        digitsCount: 6,
        load: load1,
        offsetX: 4,
        offsetY: 4,
        extraGrids: [
            {
                load: load2,
                offsetX: 8,
                offsetY: 8,
            },
            {
                load: load1,
                offsetX: 4,
                offsetY: 12,
            },
            {
                load: load1,
                offsetX: 4,
                offsetY: 20,
            },
            {
                load: load1,
                offsetX: 4,
                offsetY: 28,
            },
            {
                load: load2,
                offsetX: 8,
                offsetY: 16,
            },
            {
                load: load2,
                offsetX: 8,
                offsetY: 24,
            },
            {
                load: load2,
                offsetX: 8,
                offsetY: 32,
            },
            {
                load: load1,
                offsetX: 12,
                offsetY: 36,
            },
            {
                load: load2,
                offsetX: 0,
                offsetY: 0,
            },
            {
                load: load2,
                offsetX: 16,
                offsetY: 16,
            },
            {
                load: load2,
                offsetX: 16,
                offsetY: 24,
            },
            {
                load: load2,
                offsetX: 16,
                offsetY: 32,
            },
            {
                load: load2,
                offsetX: 24,
                offsetY: 8,
            },
            {
                load: load2,
                offsetX: 32,
                offsetY: 16,
            },
            {
                load: load2,
                offsetX: 32,
                offsetY: 24,
            },
            {
                load: load2,
                offsetX: 32,
                offsetY: 32,
            },
            {
                load: load1,
                offsetX: 20,
                offsetY: 28,
            },
            {
                load: load1,
                offsetX: 20,
                offsetY: 20,
            },
            {
                load: load1,
                offsetX: 20,
                offsetY: 12,
            },
            {
                load: load1,
                offsetX: 28,
                offsetY: 12,
            },
            {
                load: load1,
                offsetX: 28,
                offsetY: 20,
            },
            {
                load: load1,
                offsetX: 28,
                offsetY: 28,
            },
            {
                load: load1,
                offsetX: 36,
                offsetY: 36,
            },
        ],
        caterpillar: true,
    } as PuzzleImportOptions),
    noIndex: true,
    slug: "caterdokupillar-poc",
};
