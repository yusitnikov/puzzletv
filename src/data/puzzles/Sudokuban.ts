import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const Sudokuban: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        sokoban: true,
        noSpecialRules: true,
        load: "N4IgzglgXgpiBcBOANCALhNAbO8QGUBXAEwHsBrQgIwEMA7EVGwtAC1ICcEQOBPC0oTCsajHoRxgYabgDlOAWxpYABOQhYcHFUTKUVHCTDAqaABzNZeAOgA6dAOoxNyFVRgAzTjBX9CKgGN6UwsrFTYYBVc/FREANx80UkCcYMIzFSwaMDQVOggAc1Y0AHITBWMTCDok0xU45QhiFTASCn8zQigoHDs6ewAVVh9LGl4YbRyaDjQTDw5SBXDhlWriCCC0GGawAEdCaZ96ZqC6FRhMYY57ewBaFQVSBJVONlIC0jplMM/a+lIItpImY0LwWvtDvZOHcVJ1hC86D5SB5lj4ggVjCp5os3DBWGsEX8zsDQeCDhwYH0APJ0H6IwI0DEMs7uB5PbamXI0cIQCp9MQFDhNBAAbRFwAAvshJdKpTL5XLFbKALrIcVKhWyrWayWq9XajWGg16nVG00qtXmq2Gk1mu3Gy3260W/XO622g2e92qkDqTQTdG4cUgALOLBgUUgABKAGYAMIARhAPoaWEIuBASblIbDEfgIujACY44Xk6hU+nuKXs6HNHmC1GE3GY2WQBWMy2a7nI7Hm6321WQF26z2mwBWfvKSt4AAsQ+lOZH+aLcYnKanGYnw/DPfjc/XaYzAHZ56Bazvl4244hJ4fuCft/Xo/GbwfpyBqwvz0+ozO4wAOW93znR8ezHOMTzfDtT0XC8GwANggoDjxg78e0QwCoPvVDu0vRDX3LDduBAr9cIbcD90Iu88BvUDL3AtcqPfB9SKXBC43g5DuC3Vi4OjI9Vy4vBOLoht/0ErC8E7Xif3EzjJJAESZJ7RA40otsiNnHC2OjcSWwUlizzI6NVP0pjN20viowE0sFMA0T+MTISQGkoydN7TDzOwhzfz7BSs2U+iS2cki3KsxCkwUz8wp/ATIK8vB7MChtVPijTqJAJKYpU69nNo5Lo0Qsz0uYyyfz/WyEo/IcfQCCAOACHBRWyy9VMYkBaCkONuAAYgAMQGwaxEEbBqhgbq8B6gAGGbZrELwagmkBptmmaxAAdyaNgECm6wx1QYZCmKHa9olZUJSAA",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "sudokuban",
};
