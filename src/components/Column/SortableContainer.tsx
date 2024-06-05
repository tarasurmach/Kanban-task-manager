import {CSSProperties, MouseEventHandler, ReactNode, useEffect} from "react";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import styles from "./Column.module.css";
import {Flex, } from "@chakra-ui/react";
import {IColumn} from "../../utils/column.ts";
import {ITask} from "../../utils/task.ts";
import Column from "./Column.tsx";
import {UniqueIdentifier} from "@dnd-kit/core";

interface Props {
    id:UniqueIdentifier,
    tasks?:ITask[],
    title?:string,
    onClick?:MouseEventHandler,
    children:ReactNode,
    placeholder?:string,
    column?:IColumn,
    disabled?:boolean
}

const SortableContainer = ({id, column, tasks, children, disabled, onClick, ...props}:Props) => {


    console.log(tasks)
    const {setNodeRef, attributes, over, active,listeners, transform, transition, isDragging} = useSortable({
        id,
        data:{
            type:"column",
            column,
        },
        disabled
    });
    const isOverColumn = over ? (active?.data?.current?.type !== "column" && over.id === id) || !!(tasks?.some(t => over?.id === t.id)) : false;
    const style:CSSProperties = {
        transition,
        transform:CSS.Transform.toString(transform)
    }

    if(isDragging) {
        style.opacity = 0.5
    }
    return (
        <Column hover={isOverColumn} style={style} title={column?.title} ref={setNodeRef} dragHandleProps={{...attributes, ...listeners}} onClick={onClick} {...props}>
            {children}
        </Column>);


};
export const TaskList = ({isActiveDrag, children}:{isActiveDrag:boolean, children:ReactNode, isOverColumn?:boolean}) => {
    const [container, enable] = useAutoAnimate({easing:"ease-in-out"});
    useEffect(() => {
        enable(!isActiveDrag)
    }, [isActiveDrag]);
    return (
        <Flex direction={"column"} p={"0.5rem"} bgColor={"#A47015"} gap={"0.5rem"} h={"100%"}  ref={container} >
            {children}
        </Flex>
    )
}
export default SortableContainer;