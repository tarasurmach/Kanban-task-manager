import styles from "./TaskCard.module.css"
import {ITask} from "../../utils/task.ts";
import {Draggable} from "@hello-pangea/dnd";


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

export default TaskCard;