import {useMemo, useState} from "react";

export const useMap = <K, V>(init:ReadonlyArray<readonly [K, V]>) => {
    const [map, setMap] = useState<Map<K, V>>(new Map(init));
    const [mapSize, setMapSize] = useState<number>(0);
    const methods = useMemo(() => {
        return {
            set(key:K, val:V) {
                const result = map.set(key, val);
                setMapSize(result.size);
                return result;
            },
            has(key:K) {
                return map.has(key);
            },
            remove(key:K){
                const isDeleted = map.delete(key);
                setMapSize(map.size);
                return isDeleted;
            },
            clear() {
                map.clear();
                setMapSize(0);
            },


        }
    }, [mapSize])

}