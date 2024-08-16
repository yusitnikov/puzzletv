import {globalPaddingCoeff, lightRedColor} from "../../../components/app/globals";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../types/sudoku/Constraint";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {parsePositionLiterals, PositionLiteral} from "../../../types/layout/Position";
import {getRegionBoundingBox} from "../../../utils/regions";
import {Gift} from "@emotion-icons/fluentui-system-filled";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import styled from "@emotion/styled";
import {Modal} from "../../../components/layout/modal/Modal";
import {ReactNode, useState} from "react";
import {Button} from "../../../components/layout/button/Button";
import {AnyRuleBoxPTM} from "../types/RuleBoxPTM";
import {RuleBoxGameState} from "../types/RuleBoxGameState";

const ruleBoxTag = "rule-box";

export interface RuleBoxProps {
    rulesText: string;
    rulesNode: ReactNode;
}

export const RuleBox: ConstraintPropsGenericFcMap<RuleBoxProps, AnyRuleBoxPTM> = {
    [FieldLayer.regular]: observer(function RuleBoxUi<T extends AnyRuleBoxPTM>(
        {cells, props: {rulesText}, color = lightRedColor, context}: ConstraintProps<T, RuleBoxProps>
    ) {
        profiler.trace();

        if ((context.stateExtension as RuleBoxGameState).ruleBoxes[rulesText]) {
            return null;
        }

        const bounds = getRegionBoundingBox(cells, 1);

        return <AutoSvg {...bounds}>
            <Gift
              width={bounds.width}
              height={bounds.height}
              color={color}
            />
        </AutoSvg>;
    }),
    [FieldLayer.interactive]: observer(function RuleBoxClicker<T extends AnyRuleBoxPTM>(
        {cells, props: {rulesText, rulesNode}, context}: ConstraintProps<T, RuleBoxProps>
    ) {
        profiler.trace();

        const {
            fogVisibleCells,
            cellSizeForSidePanel: cellSize,
        } = context;

        const [showModal, setShowModal] = useState(false);
        const closeModal = () => setShowModal(false);

        return <>
            {!(context.stateExtension as RuleBoxGameState).ruleBoxes[rulesText] && <StyledClickArea
              onClick={() => {
                  setShowModal(true);
                  context.onStateChange({
                      extension: {
                          ruleBoxes: {
                              ...(context.stateExtension as RuleBoxGameState).ruleBoxes,
                              [rulesText]: true,
                          }
                      } as Partial<RuleBoxGameState>,
                  });
              }}
            >
                {cells.map(({top, left}) => (!fogVisibleCells || fogVisibleCells[top][left]) && <rect
                  key={`${top}-${left}`}
                  fill={"none"}
                  stroke={"none"}
                  strokeWidth={0}
                  x={left}
                  y={top}
                  width={1}
                  height={1}
                />)}
            </StyledClickArea>}

            {showModal && <Modal cellSize={cellSize} onClose={closeModal}>
                <div>{rulesNode}</div>

                <Button
                  type={"button"}
                  cellSize={cellSize}
                  autoFocus={true}
                  onClick={closeModal}
                  style={{
                      marginTop: cellSize * globalPaddingCoeff,
                      padding: "0.5em 1em",
                  }}
                >
                    OK
                </Button>
            </Modal>}
        </>;
    }),
};

const StyledClickArea = styled("g")({
    pointerEvents: "all",
    cursor: "pointer",
});

export const RuleBoxConstraint = <T extends AnyRuleBoxPTM>(cells: PositionLiteral[], rulesText: string, rulesNode: ReactNode): Constraint<T, RuleBoxProps> => ({
    name: "rules box",
    tags: [ruleBoxTag],
    cells: parsePositionLiterals(cells),
    component: RuleBox,
    props: {rulesText, rulesNode},
});

export const isRuleBoxConstraint = <T extends AnyRuleBoxPTM>(constraint: Constraint<T, any>): constraint is Constraint<T, RuleBoxProps> =>
  (constraint.tags ?? []).includes(ruleBoxTag);
