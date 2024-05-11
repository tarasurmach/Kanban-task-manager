import styles from "./Column.module.css"
import { IColumn} from "../../utils/column.ts";
import {Draggable, Droppable} from "@hello-pangea/dnd";
import TaskCard from "../TaskCard/TaskCard.tsx";
import {ITask} from "../../utils/task.ts";
import classNames from "classnames";
import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from "react";
import {horizontalListSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {DragStartEvent} from "@dnd-kit/core";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import {Direction} from "../Board/Board.tsx";


interface Props {
    column:IColumn,
    columnIndex?:number,
    tasks:ITask[],
    isTaskSelected:(taskId:string) => boolean,
    toggleTaskSelection:(taskId:string, columnId:string) => ()=> void,
    selectionMode:boolean,
    setSelectionMode:Dispatch<boolean>,
    setTasks:Dispatch<SetStateAction<ITask[]>>,
    isActiveDrag:boolean,
    columns:IColumn[]
}

/*
const Column = ({column, columnIndex, tasks}:Props) => {

    return (
        <Draggable draggableId={column.id} index={columnIndex}>
            {(provide) => (
                <div className={styles.column} ref={provide.innerRef} {...provide.draggableProps}>
                    <p {...provide.dragHandleProps}>{column.title}</p>
                    <Droppable droppableId={column.id.toString()} type="task" direction={"vertical"}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={classNames({[styles.over]:snapshot.isDraggingOver})}>
                                {tasks && tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index}/>)}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
};

export default Column;*/




const Column = ({column, tasks, columns, isTaskSelected, selectionMode, toggleTaskSelection, setTasks, isActiveDrag}:Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const taskIds = useMemo(() => tasks.map(task => task.id), [tasks]);
    const [container, enableAnimations] = useAutoAnimate({easing:"ease-in"});
    useEffect(() => {
        enableAnimations(!isActiveDrag)
    }, [isActiveDrag]);
    const cbRef = (node:HTMLDivElement) => {

    }
    const {setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
        id:column.id,
        data:{
            type:"column",
            column
        },
        disabled:editMode
    });

    const style = {
        transition,
        transform:CSS.Transform.toString(transform)
    }
    const moveUp = (id:string, dir:Direction)=> () => {
        const index = tasks.findIndex(task => task.id === id);
        const foundTask = tasks[index];
        if(dir=== "up" || dir==="down") {

            if((dir==="up" && index === 0) || (dir==="down" && index === tasks.length - 1)) return;
            const destination = dir === "up" ? index - 1 : index + 1;

            const prevTask = tasks[destination];
            setTasks(prevTasks => {
                prevTasks = prevTasks.slice()
                const index1 = prevTasks.findIndex(task => task.id === foundTask.id);
                const index2 = prevTasks.findIndex(task => task.id === prevTask.id);
                prevTasks[index1] = prevTasks.splice(index2, 1, prevTasks[index1])[0]
                return prevTasks;
            })
        }else{
            const sourceColIndex = columns.findIndex(col => col.id === foundTask.columnId);
            if((sourceColIndex === 0 && dir === "left") || ((sourceColIndex === columns.length - 1) && dir==="right")) return;
            const destColIndex = dir === "left" ? sourceColIndex - 1 : sourceColIndex  + 1;
            const destCol = columns[destColIndex];
            foundTask.columnId = destCol.id;
            setTasks(prev => {
                prev = prev.slice();
                return prev;
            })

        }


    }
    if(isDragging) {
        return (
            <div ref={setNodeRef} className={classNames(styles.column, styles.placeholder)} style={style}>

            </div>
        );
    }
    return (
        <div className={styles.column} ref={setNodeRef} style={style} >
            <p {...attributes} {...listeners}>{column.title}</p>
            <div className={styles.taskContainer}  ref={container}>
                <SortableContext items={taskIds} strategy={horizontalListSortingStrategy} >
                    {tasks.map(task => <TaskCard key={task.id} task={task} isTaskSelected={isTaskSelected(task.id)} toggleTaskSelection={toggleTaskSelection(task.id, column.id)} onSwap={moveUp}/>)}

                </SortableContext>
            </div>
        </div>
    );


};

export default Column;