import {useEffect, useMemo, useRef, useState} from "react";
import {
    ColumnTasksMap, findTask,
    groupTasks,
    IColumn,
    initColumns,
    initSelected,
    initTasks, moveTasks,
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
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {ITask} from "../../utils/task.ts";
import {createPortal} from "react-dom";
import TaskCard from "../TaskCard/TaskCard.tsx";
import {useLatest} from "../../hooks/useLatest.ts";



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
    const [tasks, setTasks] = useState<ColumnTasksMap>(groupTasks(initTasks, initColumns))
    const colIds = useMemo(() => columns.map(col => col.id), [columns])
    const [activeTask, setActiveTask] = useState<ITask|null>(null);
    const [activeColumn, setActiveColumn] = useState<IColumn|null>(null);
    const [selectedItems, setSelectedItems] = useState<SelectedItems>(initSelected);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const isActiveDrag = !!(activeTask || activeColumn);
    const latestOverId = useRef<number|null>(null);
    const recentlyMovedToNewColumn = useRef(false);

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
        //console.log(tasks);
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
            <DndContext sensors={sensors} onDragStart={onDragStart}  onDragEnd={onDragEnd} onDragOver={onDragOver} onDragCancel={onDragCancel}>
                <SortableContext items={colIds} >
                    {
                        columns.map(col => <Column
                            key={col.id}
                            column={col}
                            tasks={tasks[col.id]}
                            selectionMode={selectionMode}
                            setSelectionMode={setSelectionMode}
                            isTaskSelected={isTaskSelected}
                            toggleTaskSelection={toggleTaskSelection}
                            moveTasks={moveTasks(setTasks, columns)}
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
                                tasks={tasks[activeColumn.id]}
                                selectionMode={selectionMode}
                                setSelectionMode={setSelectionMode}
                                isTaskSelected={isTaskSelected}
                                toggleTaskSelection={toggleTaskSelection}
                                moveTasks={moveTasks(setTasks, columns)}
                            />
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                moveTasks={()=>{}}
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
            setActiveTask(current.task);
            //latestOverId.current = findTask(tasks, e.active.id as string)[0]
        }
    }

    //handle columns movement
    function onDragEnd(e:DragEndEvent) {
        setActiveTask(null);
        setActiveColumn(null);
        latestOverId.current = null;
        recentlyMovedToNewColumn.current = false;
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
    function onDragCancel() {
        console.log("cancelling")
        setActiveColumn(null);
        latestOverId.current = null;
        setActiveTask(null);
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
        console.log("latest over index " + latestOverId.current)
        if(isOverATask) {

            setTasks(prev => {
                const tasksMap = Object.assign({}, prev);
                const [activeIdx, activeColumn] = findTask(tasksMap, activeId as string);
                const activeTask = tasksMap[activeColumn][activeIdx];
                const [overIdx, overColumn] = findTask(tasksMap, overId as string);
                console.log("over is a task: " + "from " + activeIdx + "to " + overIdx)
                const overTask = tasksMap[overColumn][overIdx];
                if(overTask.columnId === activeTask.columnId) {
                    tasksMap[overColumn] = arrayMove(tasksMap[overColumn], activeIdx, overIdx);
                    return tasksMap
                }
                latestOverId.current = overIdx
                const [task] = tasksMap[activeColumn].splice(activeIdx, 1);
                task.columnId = overColumn;
                tasksMap[overColumn].splice(overIdx , 0, task);
                console.log(tasksMap)
                return tasksMap;

            })
        }

        const isOverAColumn = over.data.current?.type === "column"
        if(isActiveATask && isOverAColumn) {
            console.log("over is a column" + "last over idx: " + latestOverId.current);
            setTasks(prev => {
                const tasksMap = Object.assign({}, prev);

                //const task = e.active.data.current.task
                //console.log(task);
                //const task = tasksMap[column][index];
                const [index, column] = findTask(tasksMap, activeId as string)
                let task = tasksMap[column][index]
                if (task.columnId === overId) return tasksMap;

                //const index = tasksMap[task.columnId].findIndex(t => t.id === activeId)


                task = tasksMap[task.columnId].splice(index, 1)[0]
                task.columnId = overId as string;
                tasksMap[overId].splice( latestOverId.current ?? 0, 0, task);
                recentlyMovedToNewColumn.current = true;
                return tasksMap
            })
                /*if(task.columnId !== overId) {

                    console.log(task.columnId);
                    //const index = tasksMap[task.columnId].findIndex(t => t.id === activeId)
                    const [sourceTask] = tasksMap[task.columnId].splice(index, 1)
                    task.columnId = overId as string
                    tasksMap[overId].splice(latestOverId.current ?? 0, 0, task);
                    return tasksMap;
                }*/
                console.log("last: " + latestOverId.current)
                //tasksMap[overId] = arrayMove(tasksMap[overId], index, latestOverId.current ?? 0)
                //return tasksMap
                console.log("same column")


                /*tasksMap[overId] =  tasksMap[overId].map(task => {
                    console.log(task.id === activeId)
                    return task.id === activeId ? ({...task, columnId:overId.toString()}) : task
                });
                return tasksMap*/
                /*prev = prev.slice();
                const taskIndex = prev.findIndex(task => task.id === activeId);
                const task = prev[taskIndex];
                task.columnId = overId as string;
                return prev;

            })*/
        }
    }


};



export default Board;