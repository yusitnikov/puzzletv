export interface RuleBoxGameState {
  // Which rule boxes have been clicked (indexed by rules text)
  ruleBoxes: Record<string, boolean>;
}
