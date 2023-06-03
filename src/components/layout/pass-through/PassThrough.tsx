import {FC} from "react";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const PassThrough: FC = observer(function PassThrough({children}) {
    profiler.trace();

    return <>{children}</>;
});
