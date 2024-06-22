import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {SudokuMaker} from "./SudokuMaker";

const sudokubanLoadString = "N4IgzglgXgpiBcBOANCALhNAbO8QGUBXAEwHsBrQgIwEMA7EVGwtAC1ICcEQOBPC0oTCsajHoRxgYabgDlOAWxpYABOQhYcHFUTKUVHCTDAqaABzNZeAOgA6dAOoxNyFVRgAzTjBX9CKgGN6UwsrFTYYBVc/FREANx80UkCcYMIzFSwaMDQVOggAc1Y0AHITBWMTCDok0xU45QhiFTASCn8zQigoHDs6ewAVVh9LGl4YbRyaDjQTDw5SBXDhlWriCCC0GGawAEdCaZ96ZqC6FRhMYY57ewBaFQVSBJVONlIC0jplMM/a+lIItpImY0LwWvtDvZOHcVJ1hC86D5SB5lj4ggVjCp5os3DBWGsEX8zsDQeCDhwYH0APJ0H6IwI0DEMs7uB5PbamXI0cIQCp9MQFDhNBAAbRFwAAvshJdKpTL5XLFbKALrIcVKhWyrWayWq9XajWGg16nVG00qtXmq2Gk1mu3Gy3260W/XO622g2e92qkDqTQTdG4cUgALOLBgUUgABKAGYAMIARhAPoaWEIuBASblIbDEfgIujACY44Xk6hU+nuKXs6HNHmC1GE3GY2WQBWMy2a7nI7Hm6321WQF26z2mwBWfvKSt4AAsQ+lOZH+aLcYnKanGYnw/DPfjc/XaYzAHZ56Bazvl4244hJ4fuCft/Xo/GbwfpyBqwvz0+ozO4wAOW93znR8ezHOMTzfDtT0XC8GwANggoDjxg78e0QwCoPvVDu0vRDX3LDduBAr9cIbcD90Iu88BvUDL3AtcqPfB9SKXBC43g5DuC3Vi4OjI9Vy4vBOLoht/0ErC8E7Xif3EzjJJAESZJ7RA40otsiNnHC2OjcSWwUlizzI6NVP0pjN20viowE0sFMA0T+MTISQGkoydN7TDzOwhzfz7BSs2U+iS2cki3KsxCkwUz8wp/ATIK8vB7MChtVPijTqJAJKYpU69nNo5Lo0Qsz0uYyyfz/WyEo/IcfQCCAOACHBRWyy9VMYkBaCkONuAAYgAMQGwaxEEbBqhgbq8B6gAGGbZrELwagmkBptmmaxAAdyaNgECm6wx1QYZCmKHa9olZUJSAA";

export const Sudokuban: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        sokoban: true,
        noSpecialRules: true,
        load: sudokubanLoadString,
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "sudokuban",
};

export const SudokubanSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        load: sudokubanLoadString,
    } as PuzzleImportOptions),
    slug: "sudokuban-source",
};

const easterSokobanLoadString = "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQBMJADCADQgAOArgF7MA2KBoOcMnhAUTjoEaAAQBlCAGsIAIzh46cRggAW0AiADCa3ig65aIAMYQYfHAi0A5aPDZj0jACYzGYqIw7oxcevRsAJ4kADo4drBwjtKYbBxQYiZwAOYont4ovv6BQfhi6ukmbIzpmDgFakXQOOIQYH5JqWU4LpjJor4A7mrtamJtKZgIYikQWWLlCBCVRc1hONrN2VDpOBAjtSZZ6HBQcUGTFYWYiWDl0WL0EFgI2DjoNJUQjCn9ALSzh2beLmJy6RgEAAbig-nJDnBJDJ5Iormw4EE0AsACpVaGyBQVQKI8QiPYIXzlWZHNodMFXG7De5PRR-ZIVIGgsQcMAIJ77N7ssSMehiaADCBdCooOAmfpMlALJZpFbpKpwYFBJ4oFIpOUszBckhiNHpHFIxIM9YjSViIGrSpw3BzNJ%2BEZQu58J5yVSTBAAcl813QWDkHAKMzNRCadrpfhwkKBjCs-IaqvVfjZ4mGTwFACtGCII1GXrH6mIE9k2DaFgAhN0lmT81QAQjEABFcB6Ruh4Oh%2BopDkW04lCqN9JNfCC0PWAJINfsG8T0Va%2BiY2-mJC3pIv-FAILooFDHdEpfbg6AuNCPUMLvvo6dQJ79tdpVvtqouHUTiOFtWCrI4FtOBDh3CNMkdoCgBU4IoaN7ogmYhgNEbDZK0TiPlkJDGAgQT0PwIDOG40iMMYWDMPwABsdDbPE6AEAA2sAAC%2BNB0Qx9GMSxzFsUxHGsZx7FcbxPH8dxgl8UJ-EALpkbgIhQHAUyUfgNEgOhmEEJQzGKRh-BEHQqxDJJ1GUDQBkGVpJmGWZxk0KZZA0NZ1kAMw0A5Dm2TZjluQ5AAsNBeV5ACsND%2Bf5PneQFoW%2BaJalKfwZCUJQ1kMHsvByQpUVaAYbCYPQ6CcNpAAeKkkF5IBQEEBVFYoKQcCpdDnPEWgAMRgE1zUEQgUAyFh9Wxd11B0FJHUAOqYC46gFXFtHidhQQwHIEDwdRVGUCQ-lLeFk08HwWgAArgWgICRRpBB2ZQWmmMs1GgOR83yXZk3AtEpQEEQalXclAAcd0PZpL3pclRCfSU0U-RR1FELddD3YDR3A9dVFEB5AOPfgHkw8ldlkIj30MaYv3UcRmMECj2OvaD%2BMQ19BC%2Baj1F2Qj5NQ-gVPE7jN3hfTSNkNT8lEAAnATyNc3D-3syRE19ehVX4KAoi5dYUumHNmiEF1PXUPRZ1pFwCsllADWq2r6sbVh2jSZ0%2B3Y6l%2BAxSdZHnfJoCQ0jIDGCT8kAOwRZNIhBJL0soLLWtmDreuq%2BbGv8Jdiu68rsVNbHYD7Yb%2BhaAIaqUQdylW7Fp1AVkF0gI7WEuyzcOUJ74s%2BxHin%2B3LkfBzHofq7ngdRyHJiUM1Ce0d3FuHVnNvh8lDsU4Qxcg-JZD42L2ES1XMu19rSsgCrPVh838tB0vjVgPHTWJxn0XZ7bsr54XWhj7DGPT97vvVwHG%2Btw3q9N80Lf18vcfdXv3cTd3QA";

export const EasterSokoban: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => SudokuMaker.loadPuzzle({
        sokoban: true,
        eggs: true,
        noSpecialRules: true,
        load: easterSokobanLoadString,
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "easter-sokoban",
};

export const EasterSokobanSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => SudokuMaker.loadPuzzle({
        load: easterSokobanLoadString,
    } as PuzzleImportOptions),
    slug: "easter-sokoban-source",
};
