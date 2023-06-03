import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

// TODO: accessibility for color-blind

export const ToroidalRenbanmometers: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        loopX: true,
        loopY: true,
        load: "N4IgzglgXgpiBcBOANCALhNAbO8QCUYA7AIwEMjBoAgFsB7amNGAJzADoOACQ0im+xizCcYANxYBPAO4ALFjACEIVGQCuaGbWYIQAYRlkGOWkWUhmqnGEY6AclupksnMKoAmtANarOFq5zIAB0CsCTYAHSJ7ZkdnZmJyIjoGJlZfSxhhIJCwzgBBLBMAc18EimTBVmRONwgizGFqVTA0TggiAGN4smtOADNmek4NGE4SSxIRIjcA6f6HAM4iEwBaeMCYMgwiEo6Taw71CHEXGABHVWIO0YAKDS22sGqRiXmY2c4tN3kZ6wurmAASjYnAAKnJSrwkgJUsJ2sMZBBhIFVFAoDgAvEAlhnIi3N8iNUTKEETAIMwxhMsnMMIEslj6uIiCCAEJUzGjLBkZhFFicDrkjr+WQQDG0+mjMCxHAUgXMIWZEG6LTxMCBEy1HbDCB02YzcZYEjCMAGLEjFyGUZ7QrMEE8RIVWH8iicOgnWpkIomJwkrSfZgaWheog+iTVcatF7OogAclaXVoYGEfto4mYXMCESI4NGRWYEBmSOGWloBac8FJxcC/JMRBgHTQwjQtErJFoaGb1GeEJwfXjtfrjeLlfzRRkaBBAFVeubwiA3TA55SOyZ/ZXuYMpJxPDAJE2WwvK3mC2wzMe3AgANqX4AAX2Qd4f98fL+fb6fAF1kDf36+n/+/zvL8fwA38wNA4DAPAqDP2/GD4LAyDoOQiC4JQhDYJAjCEKQ0C8Jwr8QDlBUr1Aa4cTAK8CAANl0aiQEI8hrF0HQAGIABEACYAGYWQAUQAdjMWh1CwdoYBYvAOJ4/ihNQPoTDQSSQFYgAGdSNLMKQCw0BBVLYAAWVA5Dqcc9MM58iJgCiqPwAzdAMhjUCYiS2K43jBOE0TxOU6SPLkkAFKIJS2I0zTUG0txdPgfSBOMskxzQcyBMs8isEo+BLxohynJAFzfLybi+NUgyAA4vOwHy2MK4qyrMIKQqksL1K0nSZGS+LTKSmK2BSh8rJszKCHs+jGJ6VypJqkrytQETKrrAqium+rFN85rVNaqL2p6oyQBMxLzIM1LrPS2yAFZdDO3L8rYgS+JZASADEZpAOaxIW277qel6GrW5rNui2LOoOnq+rIk6Mqy/BaPKsbmM+h7noq96JpUu7EZ+1bQv+iK2sO4GzJ247Bqh+zOOu8bfMe6nHs4jbZu8j6pJp2n6cCrGmpxkBIsBwyCe6/Sjv6tLIYIC7ybh1HWJZunkaq5madl+SOZU9aAe2oG9oSwnYuJ06hvwC7HMl3y+OozjqIARkeuWmZUs2Letlbgr+sL1Y6rWuuSvXRcNuiKfhqSHatm2GfmqXg6d5WXext3ca2/HPZBwWfdsy3dEQAOI4es7uPJsOUdNnO8+dxrVa5nmNb5pOdYs4WIbT3RYecym2K+3P89exns4EjvS9d8Lubx0H+e9+uSYIRAcpNtizseue59tqWF/n0P2Zjzm46HhOR5rgXetTg3OP9mepJXxeC/llTz7X37Y8HyvE/22uhfBif8Cn0aW8D8vStKlrL52zUqpP+AD15l2AVvR+O1R5E3HvrKG6cv55VbpzUBbM3pX2Aeg/u98wHQM1s/feKVCJgFoFgI4JgrxnWQKVZA1FkBGU4sgbiyAUCW2QHFDhrCUBxRoQw5hdCjJGTiswlAdCOE0NYQwuhzCuH0LYSwxhyAaHsOUVIzhtCFHMOkSo5AzCjJ0LimosRSiGGSOUXFIxyiOF0JQMwhhGjHFaNYXFIyHCxEflvEAA",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "toroidal-renbanmometers",
};
