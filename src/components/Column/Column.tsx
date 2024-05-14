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
    moveTasks:MoveTasks

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




const Column = ({column, tasks, columns, isTaskSelected, selectionMode, toggleTaskSelection, setTasks, isActiveDrag, moveTasks}:Props) => {
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
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy} >
                    {tasks.map(task => <TaskCard key={task.id} task={task} isTaskSelected={isTaskSelected(task.id)} toggleTaskSelection={toggleTaskSelection(task.id, column.id)} moveTasks={moveTasks}/>)}

                </SortableContext>
            </div>
        </div>
    );


};

export default Column;