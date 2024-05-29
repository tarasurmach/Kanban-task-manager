import styles from "./TaskCard.module.css"
import {ITask} from "../../utils/task.ts";

import {useSortable} from "@dnd-kit/sortable";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {CSS} from "@dnd-kit/utilities";
import classNames from "classnames";
import {DragHandleIcon, TriangleDownIcon, TriangleUpIcon, CheckIcon} from "@chakra-ui/icons";

import {MoveTasks} from "../../utils/column.ts";




type Props = {
    task:ITask | {},
    isTaskSelected:boolean,
    toggleTaskSelection:()=>void,
    moveTasks:MoveTasks;
    showArrows:boolean,
    selectedLength:number

}
const TaskCard = ({task, isTaskSelected, toggleTaskSelection, selectedLength, moveTasks, showArrows}:Props) => {
    const [editMode, setEditMode] = useState<boolean>(false);
    const {setNodeRef, attributes, active, listeners, transition, transform, isDragging, rect, node} = useSortable({
        id:task.id,
        data:{
            type:"task",
            task
        },
        disabled:editMode,

    });



    const cbRef = (node:HTMLDivElement) => {
        setNodeRef(node);

    }
    if(transform && selectedLength > 0) {
        //transform.y = transform.y + selectedLength * 30;
    }
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
        <div  ref={cbRef}  className={classNames(styles.taskCard, )} style={style} onClick={toggleTaskSelection}>
            <div className={styles.row}>
                <p>{task.title}</p>
                {showArrows && <span className={styles.arrows}>
                    <TriangleDownIcon onClick={moveTasks(task.id, "left")}  style={{rotate:"90deg"}}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "up")}  />
                    <TriangleDownIcon onClick={moveTasks(task.id, "down")}/>
                    <TriangleUpIcon onClick={moveTasks(task.id, "right")} style={{rotate:"90deg"}}/>
                </span>}
                {isTaskSelected && <CheckIcon/>}
                <DragHandleIcon {...listeners} {...attributes} className={classNames({[styles.grabbing]:isTaskDragged})}></DragHandleIcon>
            </div>
        </div>

    );

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