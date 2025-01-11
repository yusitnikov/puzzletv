import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { DecorativeShapeProps } from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import { Constraint, ConstraintProps } from "../../../types/sudoku/Constraint";
import { observer } from "mobx-react-lite";
import { ComponentType } from "react";
import { isSamePosition } from "../../../types/layout/Position";
import { GivenDigitsMap } from "../../../types/sudoku/GivenDigitsMap";
import { SlideAndSeekShape } from "../types/SlideAndSeekShape";

const SlidableShapeComponent = <T extends AnyPTM>(
    BaseComponent: ComponentType<ConstraintProps<T, DecorativeShapeProps>>,
    allGivenShapes: GivenDigitsMap<SlideAndSeekShape>,
) =>
    observer(function SlidableShapeComponent({ cells: [cell], ...props }: ConstraintProps<T, DecorativeShapeProps>) {
        cell = { top: cell.top + 0.5, left: cell.left + 0.5 };

        let endPoint = cell;

        for (const segment of props.context.centerLineSegments) {
            if (segment.isBranching || segment.isLoop) {
                continue;
            }

            // Check that the line doesn't contain other slidable shapes
            if (
                segment.points.some(
                    (point) => !isSamePosition(point, cell) && allGivenShapes[point.top - 0.5]?.[point.left - 0.5],
                )
            ) {
                continue;
            }

            const start = segment.points[0];
            const end = segment.points[segment.points.length - 1];
            if (isSamePosition(cell, start)) {
                endPoint = end;
                break;
            }
            if (isSamePosition(cell, end)) {
                endPoint = start;
                break;
            }
        }

        return (
            <>
                {!isSamePosition(endPoint, cell) && (
                    <g opacity={0.2}>
                        <BaseComponent
                            {...props}
                            cells={[{ top: cell.top - 0.5, left: cell.left - 0.5 }]}
                            props={{ ...props.props, width: props.props.width / 2, height: props.props.height / 2 }}
                        />
                    </g>
                )}
                <BaseComponent {...props} cells={[{ top: endPoint.top - 0.5, left: endPoint.left - 0.5 }]} />
            </>
        );
    });

export const SlidableShapeConstraint = <T extends AnyPTM>(
    baseConstraint: Constraint<T, DecorativeShapeProps>,
    allGivenShapes: GivenDigitsMap<SlideAndSeekShape>,
): Constraint<T, DecorativeShapeProps> => ({
    ...baseConstraint,
    component: Object.fromEntries(
        Object.entries(baseConstraint.component ?? {}).map(([layer, component]) => [
            layer,
            SlidableShapeComponent(component, allGivenShapes),
        ]),
    ),
    renderSingleCellInUserArea: false,
});
