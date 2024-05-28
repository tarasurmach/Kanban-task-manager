import {useDroppable} from "@dnd-kit/core";
import {Flex} from "@chakra-ui/react";
import styles from "./Column.module.css"
import classNames from "classnames";
export const Placeholder = ({addNewColumn}:{addNewColumn():void}) => {
    const { setNodeRef, isOver} = useDroppable({id:"new"});
    return <Flex ref={setNodeRef} align={"center"} justify={"center"} className={classNames(styles.column, {[styles.placeholder]:isOver})} onClick={addNewColumn}>
        Create New Column
    </Flex>
}