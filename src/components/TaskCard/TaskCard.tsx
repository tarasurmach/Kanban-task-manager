import styles from "./TaskCard.module.css"
import {ITask} from "../../utils/task.ts";
import {Draggable} from "@hello-pangea/dnd";
import {useSortable} from "@dnd-kit/sortable";
import {useLayoutEffect, useState} from "react";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {DragHandleIcon, TriangleDownIcon, TriangleUpIcon} from "@chakra-ui/icons";
import {Direction} from "../Board/Board.tsx";


/*
const TaskCard = ({task, index}:{task:ITask, index:number}) => {
    return (
        <Draggable draggableId={task.id.toString()} index={index}  >
            {(provided) => (
                <div className={styles.taskCard} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <p>{task.title}</p>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;*/

type Props = {
    task:ITask,
    isTaskSelected:boolean,
    toggleTaskSelection:()=>void,
    onSwap:(id:string, dir:Direction) => () =>void;

}
const TaskCard = ({task, isTaskSelected, toggleTaskSelection, onSwap}:Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {setNodeRef, attributes, listeners, transition, transform, isDragging, rect, node} = useSortable({
        id:task.id,
        data:{
            type:"task",
            task
        },
        disabled:editMode
    });
    const [clientWidth, setClientWidth] = useState<number>(node.current?.clientWidth);

    useLayoutEffect(() => {
        function handleResize() {
            setClientWidth(node.current?.clientWidth)
        }
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }

    }, [])
    console.log(clientWidth)
    const style = {
        transition,
        transform:CSS.Transform.toString(transform)
    };
    if(isDragging) {
        return (
            <div className={classNames(styles.taskCard, styles.dragging) }>

            </div>
        )
    }
    const showArrows = clientWidth ? clientWidth > 200 : true;
    return (
        <div  ref={setNodeRef} {...listeners} {...attributes} className={classNames(styles.taskCard, {[styles.selected]:isTaskSelected})} style={style} onClick={toggleTaskSelection}>
            <div className={styles.row}>
                <p>{task.title}</p>

                {showArrows && <span className={styles.arrows}>
                    <TriangleDownIcon onClick={onSwap(task.id, "left")}  style={{rotate:"90deg"}}/>
                    <TriangleUpIcon onClick={onSwap(task.id, "up")}  />
                    <TriangleDownIcon onClick={onSwap(task.id, "down")}/>
                    <TriangleUpIcon onClick={onSwap(task.id, "right")} style={{rotate:"90deg"}}/>
                </span>}
                <DragHandleIcon ></DragHandleIcon>
            </div>
        </div>
    );
};
export const TaskView = ({task}:{task:ITask}) => {
    return (<div   className={classNames(styles.taskCard)}  >
        <div className={styles.row}>
            <p>{task.title}</p>

        </div>
    </div>)
}
export default TaskCard;