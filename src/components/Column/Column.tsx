import styles from "./Column.module.css"
import {ColumnTasksMap, IColumn, MoveTasks} from "../../utils/column.ts";
import {Draggable, Droppable} from "@hello-pangea/dnd";
import TaskCard from "../TaskCard/TaskCard.tsx";
import {ITask} from "../../utils/task.ts";
import classNames from "classnames";
import {
    CSSProperties,
    Dispatch,
    forwardRef, HTMLAttributes,
    MouseEventHandler,
    ReactNode,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {DragStartEvent} from "@dnd-kit/core";
import {useAutoAnimate} from "@formkit/auto-animate/react";

import {Flex, HStack, Stack, Text} from "@chakra-ui/react";
import DragHandle from "../utils/DragHandle.tsx";
import {CloseIcon} from "@chakra-ui/icons";


interface Props {

    onClick?:MouseEventHandler,
    children:ReactNode,
    placeholder?:string,
    hover?:boolean,
    style?:CSSProperties,
    title?:string,
    dragHandleProps?:HTMLAttributes<any>

}





const Column = forwardRef<HTMLElement, Props>(({ onClick, children, placeholder, hover, style, title, dragHandleProps, ...props}, ref) => {

    const Element = placeholder ? "button" : "div";

    return (
        <Element ref={ref} {...props} style={style} className={classNames(styles.column, {[styles.placeholder]:placeholder})}>
            {title ? <HStack  borderTopRadius={10} justify={"space-between"} bgColor={"#1d1d1d"} p={4}>
                <Text>{title}</Text>
                <HStack>
                    {onClick && <CloseIcon onClick={onClick}/>}
                    <DragHandle {...dragHandleProps} />
                </HStack>
            </HStack> : null}
            {children}
        </Element>
    );


});

export default Column;