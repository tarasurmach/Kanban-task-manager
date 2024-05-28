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
    task:ITask | {},
    isTaskSelected:boolean,
    toggleTaskSelection:()=>void,
    moveTasks:MoveTasks;
    showArrows:boolean

}
const TaskCard = ({task, isTaskSelected, toggleTaskSelection, moveTasks, showArrows}:Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {setNodeRef, attributes, active, listeners, transition, transform, isDragging, rect, node} = useSortable({
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
    useEffect(() => {
        handleResize();
        return () => {
            console.log("unmounting")
        }
    }, []);
    useLayoutEffect(() => {

        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize);
        }

    }, []);
    const style = {
        transition,
        transform:CSS.Transform.toString(transform)
    };
    const isTaskDragged = active?.id === task.id;
    if(isTaskDragged) {
        //console.log("dragging: " + task.id);

        return (
            <div ref={setNodeRef}  className={styles.taskCard} style={{...style, opacity:isTaskDragged ? "0.5" : "1"}}>
                <div className={styles.row}>
                    <p>{task.title}</p>
                </div>
            </div>
        )
    }
    //const showArrows =  clientWidth && (clientWidth > 200);
    return (
        <div  ref={cbRef}  className={classNames(styles.taskCard, {[styles.selected]:isTaskSelected})} style={style} onClick={toggleTaskSelection}>
            <div className={styles.row}>
                <p>{task.title}</p>

                {showArrows && <span className={styles.arrows}>

                    <TriangleDownIcon onClick={moveTasks(task.id, "left")}  style={{rotate:"90deg"}}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "up")}  />
                    <TriangleDownIcon onClick={moveTasks(task.id, "down")}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "right")} style={{rotate:"90deg"}}/>

                </span>}
                <DragHandleIcon {...listeners} {...attributes} className={classNames({[styles.grabbing]:isTaskDragged})}></DragHandleIcon>
            </div>
        </div>

    );
    function handleResize() {

        setClientWidth(elementRef.current?.clientWidth)
    }
};
export const TaskView = ({task, selectedLength}:{task:ITask, selectedLength:number}) => {

    return (<div   className={classNames(styles.taskCard)}  >
        <div className={styles.row}>
            <p>{task.title}</p>
            {selectedLength > 0 && <p>{selectedLength}</p>}
        </div>

    </div>)
}
export default TaskCard;