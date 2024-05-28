import styles from "./Column.module.css"
import {ColumnTasksMap, IColumn, MoveTasks} from "../../utils/column.ts";
import {Draggable, Droppable} from "@hello-pangea/dnd";
import TaskCard from "../TaskCard/TaskCard.tsx";
import {ITask} from "../../utils/task.ts";
import classNames from "classnames";
import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {DragStartEvent} from "@dnd-kit/core";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import {Direction} from "../Board/Board.tsx";
import {Flex, HStack, Stack, Text} from "@chakra-ui/react";


interface Props {
    column:IColumn,
    columnIndex?:number,
    tasks:ITask[],
    isTaskSelected:(taskId:string) => boolean,
    toggleTaskSelection:(taskId:string, columnId:string) => ()=> void,
    selectionMode:boolean,
    setSelectionMode:Dispatch<boolean>,
    setTasks:Dispatch<SetStateAction<ColumnTasksMap>>,
    isActiveDrag:boolean,
    columns:IColumn[],
    moveTasks:MoveTasks,
    showArrows:boolean


}





const Column = ({column, tasks,showArrows, columns, isTaskSelected, selectionMode, toggleTaskSelection, setTasks, isActiveDrag, moveTasks}:Props) => {
    //console.log(tasks)
    const [editMode, setEditMode] = useState<boolean>(false);
    const taskIds = useMemo(() => tasks.map(task => task.id), [tasks]);
    const [container, enableAnimations] = useAutoAnimate({easing:"ease-in"});

    useEffect(() => {


        enableAnimations(!isActiveDrag)
    }, [isActiveDrag]);
    const cbRef = (node:HTMLDivElement) => {

    }
    const {setNodeRef, attributes, over, active,listeners, transform, transition, isDragging, isOver} = useSortable({
        id:column.id,
        data:{
            type:"column",
            column
        },
        disabled:editMode
    });
    const isOverColumn = taskIds.some(t => over?.id === t) || (over?.data?.current?.type === "column" && over?.data?.current?.column?.id === column.id)
    //console.log(over)
    const style = {
        transition,
        transform:CSS.Transform.toString(transform)
    }

    if(isDragging) {
        return (
            <div ref={setNodeRef} className={classNames(styles.column, styles.placeholder)} style={style}>

            </div>
        );
    }
    return (
        <Flex direction={"column"} flex="0 0 24%"  minH={400} ref={setNodeRef} style={style} >
                <HStack {...attributes} {...listeners} borderTopRadius={10} justify={"space-between"} bgColor={"#1d1d1d"} p={4}>
                    <Text>{column.title}</Text>
                </HStack>

            <Flex direction={"column"} p={"0.5rem"} bgColor={"#A47015"} gap={"0.5rem"} h={"100%"}  ref={container} className={classNames({[styles.placeholder]:isOverColumn})}>
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy} >
                    {tasks.map(task => <TaskCard key={task.id} task={task} isTaskSelected={isTaskSelected(task.id)} showArrows={showArrows} toggleTaskSelection={toggleTaskSelection(task.id, column.id)} moveTasks={moveTasks}/>)}

                </SortableContext>
            </Flex>
        </Flex>
    );


};

export default Column;