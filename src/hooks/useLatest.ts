import {useEffect, useRef} from "react";

export const useLatest = <T extends any>(val?:T) => {
    const latest = useRef(val);
    useEffect(() => {
        latest.current = val
    }, [val]);
    return latest.current
}