export interface CustomConstraintDefinition {
    name: string
    input: CustomConstraintInput[]
    backend: CustomConstraintBackend
    components: CustomConstraintComponent[]
}

export type CustomConstraintInputType = 'raw'

export interface CustomConstraintInput<T extends CustomConstraintInputType = CustomConstraintInputType> {
    id: string
    label: string
    params: CustomConstraintTypeMap[T]
}

interface CustomConstraintInputBase {
    type: CustomConstraintInputType
}

export interface RawInput extends CustomConstraintInputBase {
    type: 'raw'
}

export type CustomConstraintTypeMap = {
    raw: RawInput
}

export interface CustomConstraintBackend {
    type: 'code'
    code: string
}

export interface CustomConstraintComponent {
    type: 'code'
    name: string
    code: string
}

export interface Rectangle {
    x: number
    y: number
    width: number
    height: number
}

export interface IVector2 {
    x: number
    y: number
}

export type CellId = number & { __type: 'Cell' }
export type CornerId = number & { __type: 'Corner' }
export type EdgeId = number & { __type: 'Edge' }
export type OuterCellId = number & { __type: 'Outer' }

export enum DiagonalType {
    PositiveDiagonal = 1,
    NegativeDiagonal = -1
}

export interface Stroke {
    color: string
    thickness: number
}

export type IdType = number

export interface EdgeClue<ValueType = string> {
    value: ValueType
    edge: EdgeId
}

export interface OuterClue<ValueType = string> {
    value: ValueType
    outerCell: OuterCellId
    diagonal?: DiagonalType
}

export interface Cage<ValueType = string> {
    value: ValueType
    cells: CellId[]
}

export interface BulbWithArrows {
    bulbCells: CellId[] // Important: index 0 is 1s, index 1 is 10s, etc
    arrows: CellId[][]
}

export interface CageStyle {
    cage: {
        color: string
    }
    text: {
        color: string
    }
}

export interface ArrowStyle {
    color: string
    thickness: number
    headSize: number
}

export interface BasicShapeStyle {
    size: number
    fill: string
    stroke: Stroke
}

export interface LineStyle {
    color: string
    thickness: number
}

export interface LineWithEndPointsStyle {
    lines: LineStyle
    endPoints: BasicShapeStyle
}

export interface OuterClueStyle {
    color: string
}

export interface ThermometerStyle {
    color: string
    thickness: number
    bulbRadius: number
}

export interface CosmeticLineStyle extends LineStyle {
    layer?: SudokuLayer // Undefined means it's automatic - "on top" if edges are overlaying edges of the grid.
}

export enum ConstraintType {
    // Sudoku basics
    Givens = 0,
    Regions,

    // Unplaceables
    DiagonalMinus = 10,
    DiagonalPlus,
    Antiking, // Starting at 10 just in case it's ever decided to make even more sudoku basics toggleable
    Antiknight,
    DisjointGroups,
    Nonconsecutive,
    GlobalEntropy,

    // Placeable single-cell constraints
    Even = 100,
    Odd,
    Maximum,
    Minimum,

    // Placeable cell-pair constraints
    Difference = 200,
    Ratio,
    XV,

    // Simple placeable constraints
    Thermometer = 300,
    KillerCages,
    Clone,
    Quadruple,
    LookAndSayCages,
    DifferentValues,

    // Lines
    Renban = 400,
    Whisper,
    Palindrome,
    BetweenLines,
    RegionSumLine,
    Sequence,
    EntropyLines,
    LockoutLines,
    Arrow,
    DoubleArrow,

    // Outside of grid clued constraints
    LittleKillers = 500,
    SandwichSums,
    XSums,
    Skyscrapers,
    NumberedRooms,

    // Other constraints
    RowIndexer = 600,
    ColumnIndexer,

    // Custom
    Custom = 1000,

    // Cosmetics
    CosmeticLine = 2000,
    CosmeticCage = 2001,
    CosmeticSymbol = 2002,

    // Complex placeable constraints
    SudokuRules
}

export interface LineConstraintConfigBase {
    lines: CellId[][]
    style: LineStyle
}

export interface LineWithEndPointsConfigBase {
    lines: CellId[][]
    style: LineWithEndPointsStyle
}

// Constraint configs start here
export interface GivensConstraintConfig {
    type: ConstraintType.Givens
}

export interface RegionsConstraintConfig {
    type: ConstraintType.Regions
    regions: number[]
}

export interface DifferentValuesConstraintConfig {
    type: ConstraintType.DifferentValues
    cells: CellId[]
    style: {
        color: string
        offset: number
    }
}

export interface DiagonalPlusConstraintConfig {
    type: ConstraintType.DiagonalPlus
    style: LineStyle
}

export interface DiagonalMinusConstraintConfig {
    type: ConstraintType.DiagonalMinus
    style: LineStyle
}

export interface AntiknightConstraintConfig {
    type: ConstraintType.Antiknight
}

export interface AntikingConstraintConfig {
    type: ConstraintType.Antiking
}

export interface DisjointGroupsConstraintConfig {
    type: ConstraintType.DisjointGroups
}

export interface NonconsecutiveConstraintConfig {
    type: ConstraintType.Nonconsecutive
}

export interface GlobalEntropyConstraintConfig {
    type: ConstraintType.GlobalEntropy
    groups: number[]
}

export interface KillerCagesConstraintConfig {
    type: ConstraintType.KillerCages
    cages: Cage<number>[]
    style: CageStyle
}

export interface LookAndSayCagesConstraintConfig {
    type: ConstraintType.LookAndSayCages
    cages: Cage[]
    style: CageStyle
}

export interface LittleKiller {
    value: number | undefined
    outerCell: OuterCellId
    diagonal: DiagonalType
}

export interface LittleKillersConstraintConfig {
    type: ConstraintType.LittleKillers
    clues: LittleKiller[]
    style: {
        text: {
            color: string
        }
        arrow: {
            color: string
        }
    }
}

export interface RatioConstraintConfig {
    type: ConstraintType.Ratio
    clues: EdgeClue<number>[]
    negative: number[]
    overrideNegativeDifferences: boolean
}

export interface XVConstraintConfig {
    type: ConstraintType.XV
    clues: EdgeClue<number>[]
    negative: number[]
}

export interface ThermometerConstraintConfig {
    type: ConstraintType.Thermometer
    thermometers: CellId[][]
    slow: boolean
    style: ThermometerStyle
}

export interface RenbanConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.Renban
}

export interface DifferenceConstraintConfig {
    type: ConstraintType.Difference
    clues: EdgeClue<number>[]
    negative: number[]
    overrideNegativeRatios: boolean
}

export interface WhisperConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.Whisper
    minDifference: number
}

export interface PalindromeConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.Palindrome
}

export interface OddConstraintConfig {
    type: ConstraintType.Odd
    cells: CellId[]
    style: {
        color: string
        size: number
    }
}

export interface EvenConstraintConfig {
    type: ConstraintType.Even
    cells: CellId[]
    style: {
        color: string
        size: number
    }
}

export interface CloneConstraintConfig {
    type: ConstraintType.Clone
    groups: CellId[][]
    style: {
        color: string
    }
}

export interface MaximumConstraintConfig {
    type: ConstraintType.Maximum
    cells: CellId[]
    style: {
        color: string
    }
}

export interface MinimumConstraintConfig {
    type: ConstraintType.Minimum
    cells: CellId[]
    style: {
        color: string
    }
}

export interface SandwichSumsConstraintConfig {
    type: ConstraintType.SandwichSums
    clues: OuterClue<number>[]
    style: OuterClueStyle
}

export interface XSumsConstraintConfig {
    type: ConstraintType.XSums
    clues: OuterClue<number | undefined>[]
    style: OuterClueStyle
}

export interface SkyscrapersConstraintConfig {
    type: ConstraintType.Skyscrapers
    clues: OuterClue<number | undefined>[]
    style: OuterClueStyle
}

export interface NumberedRoomsConstraintConfig {
    type: ConstraintType.NumberedRooms
    clues: OuterClue<number | undefined>[]
    style: OuterClueStyle
}

export interface RegionSumLineConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.RegionSumLine
    singleRegionTotals: boolean
}

export interface SequenceConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.Sequence
}

export interface EntropyLineConstraintConfig extends LineConstraintConfigBase {
    type: ConstraintType.EntropyLines
    groups: number[]
}

export interface LockoutLineConstraintConfig extends LineWithEndPointsConfigBase {
    type: ConstraintType.LockoutLines
}

export interface ArrowConstraintConfig {
    type: ConstraintType.Arrow
    bulbsWithArrows: BulbWithArrows[]
    style: {
        arrow: ArrowStyle
        bulb: BasicShapeStyle
    }
}

export interface DoubleArrowConstraintConfig extends LineWithEndPointsConfigBase {
    type: ConstraintType.DoubleArrow
}

export interface QuadrupleClue {
    corner: CornerId
    digits: number[]
}

export interface QuadrupleConstraintConfig {
    type: ConstraintType.Quadruple
    clues: QuadrupleClue[]
    style: {
        singleLine: boolean
    }
}

export interface RowIndexerConstraintConfig {
    type: ConstraintType.RowIndexer
    cells: CellId[]
    style: {
        color: string
    }
}

export interface ColumnIndexerConstraintConfig {
    type: ConstraintType.ColumnIndexer
    cells: CellId[]
    style: {
        color: string
    }
}

export interface BetweenLinesConstraintConfig extends LineWithEndPointsConfigBase {
    type: ConstraintType.BetweenLines
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserDefined = any

export type CustomConstraintConfigInput = Record<string, UserDefined>
export type CustomConstraintConfigStyle = Record<string, UserDefined>

export interface CustomConstraintConfig {
    type: ConstraintType.Custom
    definition: CustomConstraintDefinition
    input: CustomConstraintConfigInput
    style: CustomConstraintConfigStyle
}

export interface CosmeticLineConstraintConfig {
    type: ConstraintType.CosmeticLine
    lines: IVector2[][]
    style: CosmeticLineStyle
}

export enum SymbolType {
    Rectangle = 'rectangle',
    Ellipse = 'ellipse',
    Text = 'text',
    Arrow = 'arrow'
}

export interface SymbolCommonParams {
    type: SymbolType
    angle: number
    fill: string
    stroke: string
    strokeWidth: number
}

export interface RectangleSymbolParams extends SymbolCommonParams {
    type: SymbolType.Rectangle
    width: number
    height: number
    fill: string
}

export interface EllipseSymbolParams extends SymbolCommonParams {
    type: SymbolType.Ellipse
    rx: number
    ry: number
}

export interface TextSymbolParams extends SymbolCommonParams {
    type: SymbolType.Text
    text: string
    size: number
}

export interface ArrowSymbolParams extends SymbolCommonParams {
    type: SymbolType.Arrow
    length: number
    headSize: number
}

export type SymbolParams = RectangleSymbolParams | EllipseSymbolParams | TextSymbolParams | ArrowSymbolParams

export interface CosmeticSymbol {
    position: IVector2
    layer: SudokuLayer
    params: SymbolParams
}

export interface CosmeticSymbolConstraintConfig {
    type: ConstraintType.CosmeticSymbol
    symbols: CosmeticSymbol[]
}

export interface CosmeticCageConstraintConfig {
    type: ConstraintType.CosmeticCage
    cages: Cage[]
    style: CageStyle
}

export interface SudokuRulesConstraintConfig {
    type: ConstraintType.SudokuRules
    areas?: Rectangle[]
}

export type ConstraintConfigMap = {
    [ConstraintType.Antiking]: AntikingConstraintConfig
    [ConstraintType.Antiknight]: AntiknightConstraintConfig
    [ConstraintType.Arrow]: ArrowConstraintConfig
    [ConstraintType.BetweenLines]: BetweenLinesConstraintConfig
    [ConstraintType.Clone]: CloneConstraintConfig
    [ConstraintType.ColumnIndexer]: ColumnIndexerConstraintConfig
    [ConstraintType.CosmeticCage]: CosmeticCageConstraintConfig
    [ConstraintType.CosmeticSymbol]: CosmeticSymbolConstraintConfig
    [ConstraintType.CosmeticLine]: CosmeticLineConstraintConfig
    [ConstraintType.Custom]: CustomConstraintConfig
    [ConstraintType.DiagonalMinus]: DiagonalMinusConstraintConfig
    [ConstraintType.DiagonalPlus]: DiagonalPlusConstraintConfig
    [ConstraintType.Difference]: DifferenceConstraintConfig
    [ConstraintType.DisjointGroups]: DisjointGroupsConstraintConfig
    [ConstraintType.DoubleArrow]: DoubleArrowConstraintConfig
    [ConstraintType.EntropyLines]: EntropyLineConstraintConfig
    [ConstraintType.Even]: EvenConstraintConfig
    [ConstraintType.DifferentValues]: DifferentValuesConstraintConfig
    [ConstraintType.Givens]: GivensConstraintConfig
    [ConstraintType.GlobalEntropy]: GlobalEntropyConstraintConfig
    [ConstraintType.KillerCages]: KillerCagesConstraintConfig
    [ConstraintType.LittleKillers]: LittleKillersConstraintConfig
    [ConstraintType.LockoutLines]: LockoutLineConstraintConfig
    [ConstraintType.LookAndSayCages]: LookAndSayCagesConstraintConfig
    [ConstraintType.Maximum]: MaximumConstraintConfig
    [ConstraintType.Minimum]: MinimumConstraintConfig
    [ConstraintType.Nonconsecutive]: NonconsecutiveConstraintConfig
    [ConstraintType.NumberedRooms]: NumberedRoomsConstraintConfig
    [ConstraintType.Odd]: OddConstraintConfig
    [ConstraintType.Palindrome]: PalindromeConstraintConfig
    [ConstraintType.Quadruple]: QuadrupleConstraintConfig
    [ConstraintType.Ratio]: RatioConstraintConfig
    [ConstraintType.RegionSumLine]: RegionSumLineConstraintConfig
    [ConstraintType.Regions]: RegionsConstraintConfig
    [ConstraintType.Renban]: RenbanConstraintConfig
    [ConstraintType.RowIndexer]: RowIndexerConstraintConfig
    [ConstraintType.SandwichSums]: SandwichSumsConstraintConfig
    [ConstraintType.Sequence]: SequenceConstraintConfig
    [ConstraintType.Skyscrapers]: SkyscrapersConstraintConfig
    [ConstraintType.SudokuRules]: SudokuRulesConstraintConfig
    [ConstraintType.Thermometer]: ThermometerConstraintConfig
    [ConstraintType.Whisper]: WhisperConstraintConfig
    [ConstraintType.XSums]: XSumsConstraintConfig
    [ConstraintType.XV]: XVConstraintConfig
}

export type ConstraintConfig = ConstraintConfigMap[ConstraintType]

export interface Constraint<T extends ConstraintType = ConstraintType> {
    id: IdType
    config: ConstraintConfigMap[T]
}

export enum PuzzleType {
    Sudoku = 'sudoku', // Each row, column and region (if applicable) must be of size <number of digits> and filled with all digits
    Custom = 'custom' // Anything goes
}

export enum SudokuLayer {
    Background = 'background',
    Default = 'default',
    Foreground = 'foreground',
    Grid = 'grid'
}

export interface CompressedCell {
    given?: boolean
    value?: number
    candidates?: number
    cornerPencilMarks?: number
    colors?: number
}

export interface CompressedCosmeticConfig {
    type: ConstraintType.CosmeticSymbol
    params: SymbolParams[]
    symbols: [
        number, // x
        number, // y
        number?, // params index
        SudokuLayer?
    ][]
}

export type CompressedConstraint = (ConstraintConfig | CompressedCosmeticConfig) &
  {
      name?: string
      disabled?: boolean
  }

export type CompressedSpec = {
    type?: PuzzleType
    size?: number
    width?: number
    height?: number
    minDigit?: number
    maxDigit?: number
}

export interface CompressedPuzzle extends CompressedSpec {
    cells: (CompressedCell | undefined)[],
    constraints: CompressedConstraint[]
    name: string
    author: string
    comment: string
}

export interface SudokuBlob {
    formatVersion: string
    puzzle: CompressedPuzzle
}
