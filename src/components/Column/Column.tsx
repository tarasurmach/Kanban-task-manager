import styles from "./Column.module.css"
import {groupTasksByColumn, IColumn} from "../../utils/column.ts";
import {Draggable, Droppable} from "@hello-pangea/dnd";
import TaskCard from "../TaskCard/TaskCard.tsx";
import {ITask} from "../../utils/task.ts";
import classNames from "classnames";


interface Props {
    column:IColumn,
    columnIndex:number,
    tasks:ITask[]
}

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

export default Column;