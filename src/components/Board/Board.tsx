import {useEffect, useState} from "react";
import {ColumnTasksMap, groupTasks,  IColumn, initColumns, initTasks} from "../../utils/column.ts";
import styles from "./Board.module.css"
import Column from "../Column/Column.tsx";
import {DragDropContext, Droppable, DropResult} from "@hello-pangea/dnd";
import {Flex} from "@chakra-ui/react";



const Board = () => {
    const [columns, setColumns] = useState<IColumn[]>(initColumns);
    const [tasks, setTasks] = useState<ColumnTasksMap>(groupTasks(initTasks, initColumns))
    const handleDragEnd = (e:DropResult) => {
        const {destination, source, type, draggableId} = e;
        if(!destination) return;
        if(destination.index === source.index && destination.droppableId === source.droppableId) return;
        let newColumns= columns.slice();
        if(type === "column") {
            const [sourceCol] = newColumns.splice(source.index, 1)
            newColumns.splice(destination.index, 0, sourceCol)
            setColumns(newColumns);
        }else if("task") {
            const newTasks:ColumnTasksMap = Object.assign({}, tasks);
            const [sourceTask] = newTasks[source.droppableId].splice(source.index, 1);
            sourceTask.columnId = destination.droppableId;
            newTasks[destination.droppableId].splice(destination.index, 0, sourceTask);
            setTasks(newTasks)


        }
    }
    useEffect(() => {
        console.log(tasks)
    }, [tasks]);
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type={"column"}>
                {(provided) => (

                        <Flex ref={provided.innerRef} {...provided.droppableProps} className={styles.boardContainer}>
                            {
                                columns.map((column, index) => (
                                <Column column={column} columnIndex={index} key={column.id} tasks={tasks[column.id]}/>
                            ))
                            }
                            {provided.placeholder}
                        </Flex>



                )}
            </Droppable>
        </DragDropContext>
    );
};

export default Board;