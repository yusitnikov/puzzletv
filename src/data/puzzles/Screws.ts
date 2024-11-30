import { FPuzzles } from "./Import";
import { PuzzleImportOptions } from "../../types/sudoku/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";

export const Screws: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        FPuzzles.loadPuzzle({
            screws: true,
            noSpecialRules: true,
            load: "N4IgzglgXgpiBcBOANCALhNAbO8QGUBjAJxgHcwRUBDAVzQAsB7YhEAKSYCMmqRjaOMDDRsAciwC21LAAIwtACZMA1rVkChs6gAcdWAJ4A6ADoA7cwBEIAc0xhZTM9vklysybTBptemNWJZCGdGah8YAA9qQh8A4mozGxhJGDM0ZFkueldSCg9qA1kGagA3GFk0JkzysDcyGEVZZTJnalkzWkkuGECmADMNJjzKl2kIxwGyBlSK6Zz3QgSzJh8bKr7aYkYeo1lrOzQHJ1mautkyCCw5SSYy7SwnG3PMBhP5slksCBVytumv8YwMrEQrEIZBHwQBy1XINJpDMymCxmADCMCu0JgOgCYThXEKbRUZlsDDQAHIHDc7oszMsfIQnGhqME3mBqCkmrZMEY+DZiBBFAgANpC4AAX2Q4slEqlspl8ulAF1kKKQCUZLRcAAmVB2MpmBBoAQwBWgdVYTUIACMuog+sNxplao1uAA7Lb7fAjZrTc6LbgAKwe1IOn3SyV+y3wd0gPUhr2OpUqs0uhAADmDBoTYdlkdwADZM6GTeHc+ao4XY3b496Syn/QgUFXPbWneXcE241nWxH2wgdc2a47laK26n4DbB93E/Woxmp8Wxw34ABmIvZuum319+DzruLkezjvrnty0tLqMD/cb7fjgAsJ5nYsPW/Pb7lL/fr7P4s/P+/W5/gBX5KsqIAJBgRIkqIG6oKQMQJDYODCqAhDolglDwEKIAAEoriiVp8HhKJaiAYFcNQwgomwADEABiDGMXwTD0F8ZgwNReA0QADLxfF8H0jKcSAPF8bxfAXIojD9qg0zQQgAZOmhGLCrh+F3kR+ErmRqAUVRtGMUxqAsdgwQcbRYniagglpMJoliRJArSfAA5yTYpIKUp6GYdhxGuppKL5jpIB6eZXGGQxzGsWZdmWdxAlCRZlmOVJDAySAbkefAikRspGGqcRaYBYgwWhXZEV0VFpnsbFyXWYlXFxSlzmuTA8nZc+YpAA",
        } as PuzzleImportOptions),
    noIndex: false,
    slug: "screws",
};
