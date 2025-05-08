import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { DecorativeShapeProps } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { observer } from "mobx-react-lite";
import { ComponentType, useMemo } from "react";
import { isSamePosition } from "../../../types/layout/Position";
import { GivenDigitsMap, processGivenDigitsMaps } from "../../../types/puzzle/GivenDigitsMap";
import { SlideAndSeekShape } from "../types/SlideAndSeekShape";

const SlidableShapeComponent = <T extends AnyPTM>(
    BaseComponent: ComponentType<ConstraintProps<T, DecorativeShapeProps>>,
    allGivenShapes: GivenDigitsMap<SlideAndSeekShape>,
) =>
    observer(function SlidableShapeComponent({ cells: [cell], ...props }: ConstraintProps<T, DecorativeShapeProps>) {
        const {
            context: { centerLineSegments, fogVisibleCells },
            props: { width, height, ...componentProps },
        } = props;

        cell = { top: cell.top + 0.5, left: cell.left + 0.5 };

        let endPoint = cell;

        const visibleGivenShapes = useMemo(
            () =>
                fogVisibleCells === undefined
                    ? allGivenShapes
                    : processGivenDigitsMaps(
                          ([shape], { top, left }) => (fogVisibleCells[top]?.[left] ? shape : undefined),
                          [allGivenShapes],
                      ),
            [fogVisibleCells],
        );

        for (const segment of centerLineSegments) {
            if (segment.isBranching || segment.isLoop) {
                continue;
            }

            // Check that the line doesn't contain other slidable shapes
            if (
                segment.points.some(
                    (point) => !isSamePosition(point, cell) && visibleGivenShapes[point.top - 0.5]?.[point.left - 0.5],
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
                            props={{ ...componentProps, width: width / 2, height: height / 2 }}
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
