import styles from "./TaskCard.module.css"
import {ITask} from "../../utils/task.ts";
import {Draggable} from "@hello-pangea/dnd";
import {useSortable} from "@dnd-kit/sortable";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {DragHandleIcon, TriangleDownIcon, TriangleUpIcon} from "@chakra-ui/icons";
import {Direction} from "../Board/Board.tsx";
import {MoveTasks} from "../../utils/column.ts";




type Props = {
    task:ITask,
    isTaskSelected:boolean,
    toggleTaskSelection:()=>void,
    moveTasks:MoveTasks;

}
const TaskCard = ({task, isTaskSelected, toggleTaskSelection, moveTasks}:Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {setNodeRef, attributes, listeners, transition, transform, isDragging, rect, node} = useSortable({
        id:task.id,
        data:{
            type:"task",
            task
        },
        disabled:editMode,

    });
    const elementRef = useRef<HTMLDivElement>();
    const [clientWidth, setClientWidth] = useState<number>();

    const cbRef = (node:HTMLDivElement) => {
        setNodeRef(node);
        elementRef.current = node;
    }
    useLayoutEffect(() => {
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize);

        }

    }, []);
    useEffect(() => {
        handleResize()
    }, []);
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
    const showArrows =  clientWidth && (clientWidth > 200);
    return (
        <div  ref={cbRef} {...listeners} {...attributes} className={classNames(styles.taskCard, {[styles.selected]:isTaskSelected})} style={style} onClick={toggleTaskSelection}>
            <div className={styles.row}>
                <p>{task.title}</p>

                {showArrows && <span className={styles.arrows}>
                    <TriangleDownIcon onClick={moveTasks(task.id, "left")}  style={{rotate:"90deg"}}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "up")}  />
                    <TriangleDownIcon onClick={moveTasks(task.id, "down")}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "right")} style={{rotate:"90deg"}}/>
                </span>}
                <DragHandleIcon className={classNames({[styles.grabbing]:isDragging})}></DragHandleIcon>
            </div>
        </div>
    );
    function handleResize() {
        setClientWidth(elementRef.current?.clientWidth)
    }
};
export const TaskView = ({task}:{task:ITask}) => {
    return (<div   className={classNames(styles.taskCard)}  >
        <div className={styles.row}>
            <p>{task.title}</p>

        </div>
    </div>)
}
export default TaskCard;