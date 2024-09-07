import {observer} from "mobx-react-lite";
import {ReactNode} from "react";
import {profiler} from "../../../utils/profiler";
import {useWindowSize} from "../../../hooks/useWindowSize";
import {headerPadding} from "../../app/globals";

interface GridProps {
    children: ReactNode | ((itemWidth: number) => ReactNode);
    defaultWidth: number;
    gridGap?: number;
}

export const Grid = observer(function Grid({children, gridGap = headerPadding, defaultWidth}: GridProps) {
    profiler.trace();

    const {width: windowWidth} = useWindowSize();
    const innerWidth = windowWidth - headerPadding * 2;
    const columnsCount = Math.max(Math.round(innerWidth / defaultWidth), 1);
    const itemWidth = (innerWidth - (columnsCount - 1) * gridGap) / columnsCount;

    return <div style={{
        display: "grid",
        gap: gridGap,
        gridTemplateColumns: "minmax(0, 1fr) ".repeat(columnsCount),
    }}>
        {typeof children === "function" ? children(itemWidth) : children}
    </div>;
});
