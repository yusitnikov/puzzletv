import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/sudoku/Constraint";
import { Position } from "../../../types/layout/Position";
import { FieldLayer } from "../../../types/sudoku/FieldLayer";
import { observer } from "mobx-react-lite";
import { textColor } from "../../../components/app/globals";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { indexes } from "../../../utils/indexes";
import { CenteredText } from "../../../components/svg/centered-text/CenteredText";

const particlesCount = 6;

interface PortalProps {
    letter: string;
}

const Portal: ConstraintPropsGenericFcMap<PortalProps> = {
    [FieldLayer.beforeSelection]: observer(function Portal<T extends AnyPTM>({
        cells: [{ top, left }],
        color = textColor,
        props: { letter },
    }: ConstraintProps<T, PortalProps>) {
        return (
            <AutoSvg top={top + 0.5} left={left + 0.5}>
                {indexes(particlesCount).map((i) => (
                    <path
                        key={i}
                        transform={`rotate(${(360 * i) / particlesCount})`}
                        strokeWidth={0.03}
                        stroke={color}
                        fill={color}
                        d={"M 0.25 0.1 Q 0.2 0.25 0 0.4 Q 0.3 0.3 0.25 0.1"}
                    />
                ))}

                <circle r={0.32} fill={color} strokeWidth={0} opacity={0.3} />

                <CenteredText top={0.32} left={0.32} size={0.3}>
                    {letter}
                </CenteredText>
            </AutoSvg>
        );
    }),
};

export const PortalConstraint = <T extends AnyPTM>(
    cell: Position,
    color: string,
    letter: string,
): Constraint<T, PortalProps> => ({
    name: "portal",
    cells: [cell],
    color,
    props: { letter },
    component: Portal,
    renderSingleCellInUserArea: true,
});
