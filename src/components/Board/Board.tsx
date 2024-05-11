import {useEffect, useMemo, useState} from "react";
import {
    ColumnTasksMap,
    groupTasks,
    IColumn,
    initColumns,
    initSelected,
    initTasks,
    SelectedItems
} from "../../utils/column.ts";
import styles from "./Board.module.css"
import Column from "../Column/Column.tsx";
import {DragDropContext, Droppable, DropResult} from "@hello-pangea/dnd";
import {Flex} from "@chakra-ui/react";
import {
    DndContext,
    DragEndEvent, DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {ITask} from "../../utils/task.ts";
import {createPortal} from "react-dom";
import TaskCard from "../TaskCard/TaskCard.tsx";



/*const Board = () => {
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
};*/

export type Direction = "up"|"down"|"left"|"right";
const Board = () => {
    const [columns, setColumns] = useState<IColumn[]>(initColumns);
    const [tasks, setTasks] = useState<ITask[]>(initTasks)
    const colIds = useMemo(() => columns.map(col => col.id), [columns])
    const [activeTask, setActiveTask] = useState<ITask|null>(null);
    const [activeColumn, setActiveColumn] = useState<IColumn|null>(null);
    const [selectedItems, setSelectedItems] = useState<SelectedItems>(initSelected);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const isActiveDrag = !!(activeTask || activeColumn);
    const onKeyDown = (e:KeyboardEvent) => {
        if(!e.ctrlKey) return;
        setSelectionMode(true);
    }
    const onKeyUp = (e:KeyboardEvent) => {
        setSelectionMode(false)
    }
    const toggleTaskSelection = (taskId: string, columnId:string) => () => {
        console.log(taskId, columnId)
        if(!selectionMode) return;
        setSelectedItems(prev => {
            if(prev.columnId !== columnId) {
                prev = {columnId, tasks:[taskId]}
            }else {
                prev = {...prev}
                const taskIndex = prev.tasks.findIndex(task => task === taskId);
                if(taskIndex > -1) {
                    prev.tasks.splice(taskIndex, 1);
                }else {
                    prev.tasks.push(taskId)
                }

            }
            return prev;
        })
    }
    const isTaskSelected = (taskId:string) => {
        return selectedItems.tasks.includes(taskId);
    }
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown)
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown)
            document.removeEventListener("keyup", onKeyUp);
        }
    }, []);
    useEffect(() => {
        console.log(tasks);
        //console.log(activeColumn)
    }, [tasks]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance:10
        }
    }))

    return (
        <div className={styles.board} onClick={() => {
            if(selectionMode) {
                console.log("click")
        }}}>
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} >
                <SortableContext items={colIds}>
                    {
                        columns.map(col => <Column
                            key={col.id}
                            column={col}
                            tasks={tasks.filter(task => task.columnId === col.id)}
                            selectionMode={selectionMode}
                            setSelectionMode={setSelectionMode}
                            isTaskSelected={isTaskSelected}
                            toggleTaskSelection={toggleTaskSelection}
                            setTasks={setTasks}
                            isActiveDrag={isActiveDrag}
                            columns={columns}
                        />)
                    }
                </SortableContext>
                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <Column
                                column={activeColumn}
                                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                                selectionMode={selectionMode}
                                setSelectionMode={setSelectionMode}
                                isTaskSelected={isTaskSelected}
                                toggleTaskSelection={toggleTaskSelection}
                            />
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                onSwap={()=>{}}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
    function onDragStart(e:DragStartEvent) {
        const {data:{current}} = e.active;
        if(!current?.type) return;
        if(current.type === "column") {
            setActiveColumn(current.column);
        }else if(current.type === "task") {
            if(!isTaskSelected(e.active.id as string)) {
                setSelectedItems(initSelected)
            }
            setActiveTask(current.task)
        }
    }

    //handle columns movement
    function onDragEnd(e:DragEndEvent) {
        setActiveTask(null);
        setActiveColumn(null);
        const {over, active} = e;
        if(!over) return;

        const activeColumnId = active.id;
        const overColumnId = over.id;
        if(activeColumnId === overColumnId) return;
        if(active.data.current?.type !== "column") return;
        console.log("setting")
        setColumns(prev => {
            const copy = prev.slice();
            const sourceIndex = copy.findIndex(col => col.id === activeColumnId);
            const overIndex = copy.findIndex(col => col.id === overColumnId);
            const [sourceCol] = copy.splice(sourceIndex, 1);
            copy.splice(overIndex < 0 ? copy.length + overIndex : overIndex, 0, sourceCol);
            console.log("to: " + overIndex + "  from: " + sourceIndex)
            return copy;

        })
    }
    //handle tasks movement
    function onDragOver(e:DragOverEvent) {
        const {active, over} = e;
        if(!over) return;
        const activeId = active.id;
        const overId = over.id;
        if(activeId === overId) return;
        const isActiveATask = active.data.current?.type === "task";
        const isOverATask = over.data.current?.type === "task";
        if(!isActiveATask) return;
        console.log(over.data.current?.type)
        //handle scenario of dropping a task over a task

        if(isOverATask) {
            console.log("yes")
            setTasks(prev => {
                //same column;
                /*const activeTask = active.data.current?.task as ITask;
                const overTask = over.data.current?.task as ITask;
                prev = Object.assign({}, prev);
                const sourceIndex = prev[activeTask.columnId].findIndex(task => task.id === activeId);
                const destIndex = prev[overTask.columnId].findIndex(task => task.id === overId);

                const [task] = prev[activeTask.columnId].splice(sourceIndex, 1);task.columnId = overTask.columnId;
                console.log(activeTask.columnId);
                console.log(task.columnId);
                prev[overTask.columnId].splice(destIndex, 0, task)
                return prev;*/
                prev = prev.slice();
                const sourceIndex = prev.findIndex(task => task.id === activeId);
                const overIndex = prev.findIndex(task => task.id === overId);
                if(prev[sourceIndex].columnId !== prev[overIndex].columnId) {
                    prev[sourceIndex].columnId = prev[overIndex].columnId;
                    return arrayMove(prev, sourceIndex, overIndex === 0 ? 0 : overIndex - 1)
                }
                return arrayMove(prev, sourceIndex, overIndex)

                //}

                //return prev;
            })
        }
        const isOverAColumn = over.data.current?.type === "column"
        if(isActiveATask && isOverAColumn) {
            console.log("over is a column");
            setTasks(prev => {
                /*prev = Object.assign({}, prev);
                const task = active.data.current?.task as ITask;
                if(task.columnId !== overId) {
                    console.log(task.columnId);
                    const index = prev[task.columnId].findIndex(t => t.id === activeId)
                    const [sourceTask] = prev[task.columnId].splice(index, 1)
                    task.columnId = overId as string
                    prev[overId].unshift(sourceTask)

                    return prev
                }
                prev[overId] =  prev[overId].map(task => task.id === activeId ? ({...task, columnId:overId.toString()}) : task);*/
                prev = prev.slice();
                const taskIndex = prev.findIndex(task => task.id === activeId);
                const task = prev[taskIndex];
                task.columnId = overId as string;
                return prev;

            })
        }
    }
};



export default Board;