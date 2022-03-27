import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {Line} from "../../layout/line/Line";
import {indexes09} from "../../../utils/indexes";

export interface FieldProps {
    rect: Rect;
    angle: number;
    animationSpeed: number;
    cellSize: number;
}

export const Field = ({rect, angle, animationSpeed, cellSize}: FieldProps) => <>
    <style dangerouslySetInnerHTML={{__html: `
        html,
        body {
            overflow: hidden;
        }

        .Field,
        .Field * {
            transition: all linear ${animationSpeed}ms;
            transition-property: transform, left, top;
        }
    `}}/>

    <Absolute
        className={"Field"}
        {...rect}
        angle={angle}
        style={{backgroundColor: "white"}}
    >
        {indexes09.map(index => <Line
            key={`h-line-${index}`}
            x1={0}
            y1={cellSize * index}
            x2={cellSize * 9}
            y2={cellSize * index}
            width={index % 3 ? 1 : 3}
        />)}

        {indexes09.map(index => <Line
            key={`v-line-${index}`}
            x1={cellSize * index}
            y1={0}
            x2={cellSize * index}
            y2={cellSize * 9}
            width={index % 3 ? 1 : 3}
        />)}
    </Absolute>
</>;
