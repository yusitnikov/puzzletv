import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {RotatableCluesPTM} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesPTM";

export const Revolutionary: PuzzleDefinitionLoader<RotatableCluesPTM<NumberPTM>> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        rotatableClues: true,
        load: "N4IgzglgXgpiBcBOANCALhNAbO8QCUYA3AeywFcMSA7AQwCcBPEVWygCxPoRAFlas9EgHMWIeuRxgYaHgDkuAWwEACMOQAmJANbkVEqStoAHY1kYA6ADrUAIhGGYwKmkepH6QgO5ryilWgkAewwKkQC5KEQ7mghRmhotADGIRoqSRD0STgWKvaOaM7RRum0wqHKjCrUJGj6MMYwtHW01Gnq/oHBoYGJWCqORDDU1tQACuT0ZqFahR6hxhCkdcYk0XMAZlzpNGBo9LTr6RQwYMgqXuwQKfq1zaHZJEnaXhDSHiTkbd2ZKovLfzW1DqsSE5GE7BUcjUaAazhIGxUiAADCoNDBhPQYKdzpcYFioSo3t0whFQq5YgslrVcvg7rC0tlIs5Ki4hvQsCYVAAjSgqRTkPbVWoqGAAD1h30+hQg6JJmNlFjECo0CAA2mrgABfZDa3U6vWGg3G/UAXWQmpNRv1Nut2vNlttVudToddpd7rNFs9Pudbo9Add3sDvq9jtDvv9TujkfNIG0ECwOCyZVwmpASRgSbA6oIAEYAMJ5sT4ABMRZAcfCJx4eYArCADRms1gc/A1fmC4gS+Xu1WybWG03M9nc/hCw3UOOCwA2HuzyuoauRHil4vDlttjtlgsAFhLAGY94eC5OCLvT4uQMvcCB6424wxvOrQFhoqd1duZwXSyW6z+SwvX8pyPYtTTjEdWzHb9f1NJs32oD92y/Y8p3/fcpwvfdwNQSCtwIb9sPg98t23f9u0wrtAILAAOE8AHZKwgzcx3IytiMQ0iCIXKdv0YtDaOouicObUd224uc4N1EAEKQjUCHoniFILfjuOE5ixO3RTJI4uStILA8S0U4DuLAjSoPE/BFMMqTXxIz8CBoy8p0Us98G/BsRLwscnM8rUIMybI01AbzLKPRi425WhpALHgAGJEBUutErEaVZNivA4uRbKcrELZgQykAspy7KxFeDRYgQZELAPVAQgcdhZHgaqDw3TTz2PSLopgQqEqSlLUDS99epK0rUHytARtGsrZUq5qarqmAGqalq2os7cgKvKKYvixL6OS2LBsodL4tG5E8poSbTum1ByrmlrFuWqqarW/Cd2w1Btp63b+sOkAhsQqaSougrruB27ZvYZ7apAeqIRWl7pNC7cJy27rer2g7UuO4awdy8bLqB/GQDuqH5phuHGuh16x0LPtPvRn79oG/6ccBvGxpACaic50noce+HqaRljLMLMCGZ2zLMZZgHvsys6Qau+WbpJyH+dhpbBfJmnLO/SSJblorpb+2WefOgnQeV8HVYqsmHo1p7teF9r3MErrJaN37sewXGreJ7mOfNm37oWh2tdW531uU2CDYxr2jp99m/c5gPk6DvnyYFqmnZCkX9M82OmaxhOTrTxWzZm231cphHWog1N1TjMAyEoCAaHVejkBo5Bd2QPNkDrZBS2QWqZ2QFAx8H2qUE73vh+7/uUGH/vau7yfkFnruR6H5Ax97xeB43vuj/XlBarnrfe5QQfO/n4/R8P/vu972rO7Hpft7H2/j5QZ/D+Hq+W916dxXnBIAA=",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "revolutionary",
};

export const SumwhereAroundHere: PuzzleDefinitionLoader<RotatableCluesPTM<NumberPTM>> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        rotatableClues: true,
        load: "N4IgzglgXgpiBcBOANCALhNAbO8QGUBXAWwHcALGAJxgAIBBKge0IDsATWgCWrlQENCackyoIQAWX5ZmAcxCoqhHGBhpxAOVHFptMIXZMA1oVpKVtfgAcrWAJ4A6ADqsAQlkJ0sEVjDCWaMxhZCCZWPRJab18wB1oASQAzSyifOgBjZjBVfxoQsNoAI1F2an9hGHCKuz0YK34qfjQ6CtTfWh80JlrZYkq0f1JMcloYAEdCXX1iWNoAEQgwDFZ0tB6+1gHaIeEfWlawfj6g/PCGulYmNem+zi7ZNUoqZ1YABUIqWzpDLfPaKwgADcrv8mJ1/IlRLR0mElo1OtCPH5kNtyBB0iNmGgmhksEx0kYhqoAiwOPtKBAqP8gSCrGDNuTmIRZCMNHpmlZ/ExkogAAy0UqyGjI1G8WhsxbkuiA6SeWgFVoA4FoOIAJSuOM46SR/h0NSYgOoWGsRSEtGIhCWtEuaxgAA9mmSWAMIKUpbQha6HAoQJ72AgANoB4AAX2QofDYYj0ajscjAF1kMG4zHI2nU6HE8n0ynczmsxm84WE0ni2XcwWi1X86Xq+WS9n6+XKznW83EyB0pTtbhg52YFgsGBAyBVQAWADCADYQB3CvxVBPxABiRATgDsAFY1z7ndEYEu8MveSfTz7IZtDyBj6eTz6huxhAheQ4x6gKSz1PAX2Oo/3B8O8ABqO64TmOs6oPOi4rmuW47qge5pFeN63ueYRoMht53qgD5Pt+r7vjAECfs+r5/ukA5DiO45gRBIBQQeMEbtuS4IUI+6YVhaGXiuWG8verp4T+hHEeQX4/uRlGAcBqqgeudEMchsEsbu7FIbxXGoBeGEaahOGCeQpFviAH5iUZkkAdRU4TgAjApC6MUeynwSAiG+JxekgNpHlnvpj6GfhxmmeJZHhv+VFAaOADMG72dBTnMS5bmOdefHcTpR5pX5QkESZREkYFIYdvugagPu0kyQAHBOm4+rJ051dZtWoPV4EtaBUWNROABMdWbhOnXxh2yXIZVvJjWNAn+eZYXlYGMn9ZVXWIF1S0tdZ8ntbFLXVTOO01bOw1qe5K4TeN/HZQFEmzWkFWjpOdktf1j2jtZL31XZQ1sdg6lHmdk2XTNZW3fNo79b1LWTp1kO0U9B1fa5x0pcu/0XSAuFXaFwMxKDqrdQdLUxXt90NTDm1g9tr0NQjI2nedAPowZQMgHNQEyTF5OqjFa0kytNNI6N9NoxjzOs0Go74810WkyTxM0Zz/Wc9ZM78z9J1Ht1ACiE6uAAYrrU05d1m5/mLC0DV1EMgRbW1tVTUv1XL1W1arHErlrOv64bmPG6bINsxTDuTnbNHQxTvWu7914e3rBuA/hvs3TjAcfV173PXVD2Hd9bsa9rsfe6RifY34uOLctq1dZzcl1bttfw0davIzHXvxy+xcs/74tc5TPc8zRfON7n0f563jPTQnJsdmATAeBgYSBlOyCVcgNnIG+m7IOuyAoN1yBRfv6/IJve8oEvK/b2vu9b4fa8rxvyBL9vm/n0fe9rwfKBvigB+b5fyB71fu/Zej9D4oG3g/D+R9t4rxfjvABx9QEoDXnvN8B8L4gO3qfUBv9V7r3jCGIAA",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "sumwhere-around-here",
};
