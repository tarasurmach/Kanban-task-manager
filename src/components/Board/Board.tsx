import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, MouseEvent} from "react";
import {
    ColumnTasksMap,
    groupTasks,
    IColumn,
    initColumns,
    initSelected,
    initTasks, moveTasks,
    SelectedItems
} from "../../utils/column.ts";
import styles from "./Board.module.css"


import {
    closestCenter,
    CollisionDetection,
    DndContext,
    DragEndEvent, DragOverEvent,
    DragOverlay,
    DragStartEvent, getFirstCollision,
    PointerSensor, pointerWithin, rectIntersection, UniqueIdentifier,
    useSensor,
    useSensors,
    Modifier,

} from "@dnd-kit/core";
import {arrayMove, SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {createPortal} from "react-dom";
import TaskCard, {TaskView} from "../TaskCard/TaskCard.tsx";
import {ITask} from "../../utils/task.ts";
import {getEventCoordinates} from "@dnd-kit/utilities";
import SortableContainer, {TaskList} from "../Column/SortableContainer.tsx";
import Column from "../Column/Column.tsx";
import {Flex} from "@chakra-ui/react";





const Board = () => {
    const [columns, setColumns] = useState<IColumn[]>(initColumns);
    const [tasks, setTasks] = useState<ColumnTasksMap>(groupTasks(initTasks, initColumns))
    const colIds = useMemo(() => columns.map(col => col.id), [columns])
    const [selectedItems, setSelectedItems] = useState<SelectedItems>(initSelected);
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [clonedItems, setClonedItems] = useState<ColumnTasksMap|null>(null)
    const [boardWidth, setBoardWidth] = useState<number>();
    const elementRef = useRef<HTMLDivElement>();
    const latestOverId = useRef<UniqueIdentifier|null>(null);
    const recentlyMovedToNewColumn = useRef(false);
    const [activeId, setActiveId] = useState<UniqueIdentifier|null>(null);
    const isActiveDrag = activeId !== null;
    const cbRef = (node:HTMLDivElement) => {
        elementRef.current = node;
    }
    const onKeyDown = (e:KeyboardEvent) => {
        if(!e.ctrlKey) return;
        setSelectionMode(true);
    }
    const onKeyUp = (e:KeyboardEvent) => {
        setSelectionMode(false)
    }
    const toggleTaskSelection = (taskId: string, columnId:string, index:number) => () => {
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
                    prev.tasks.splice(index, 0, taskId)
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
        console.log(selectedItems.tasks);

        console.log(activeId)
        //console.log(activeColumn)
    }, [selectedItems.tasks.length]);
    useLayoutEffect(() => {
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);
    const handleResize = () => {
        console.log(elementRef.current?.clientWidth)
        setBoardWidth(elementRef.current?.clientWidth)
    };

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance:10
        }
    }))
    const customCollisionDetection:CollisionDetection = useCallback((args) => {
        if(activeId && activeId in tasks) { //meaning draggable is column
            return closestCenter({
                ...args, droppableContainers:args.droppableContainers.filter(cont => cont.id in tasks) // we're dragging container, thus we only need to rearrange containers
            })
        }
        const pointerIntersections = pointerWithin(args);
        const intersections = pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);

        let overId = getFirstCollision(intersections, "id") // find closest droppable

        //handle scenario where we have first collision
        if(overId !== null) {
            if(overId in tasks) {//droppable is column
                const columnTasks = tasks[overId];
                if(columnTasks.length > 0) { //column not empty
                    overId = closestCenter({
                        ...args, droppableContainers:args.droppableContainers.filter(droppable => droppable.id !== overId && columnTasks.some(t => t.id === droppable.id))
                    })[0]?.id; // closest index to insert task in sortable context. Useful for inserting draggable into newColumn to calculate new position appropriately
                }

            }
            latestOverId.current = overId;
            return [{id:overId}]
        }
        if(recentlyMovedToNewColumn.current) {
            latestOverId.current = activeId;
        }
        return latestOverId.current ? [{id:latestOverId.current}] : [];


    }, [activeId, tasks]);
    const showArrows = boardWidth ? boardWidth > 900 : true;
    const isActiveAColumn = activeId ? columns.some(col => col.id === activeId) : false;
    const snapCenterToCursor:Modifier = ({transform, activatorEvent, draggingNodeRect}) => {
        if(draggingNodeRect && activatorEvent) {
            const activatorCoordinates = getEventCoordinates(activatorEvent);
            if(!activatorCoordinates) return transform;
            const offsetY = activatorCoordinates.y - draggingNodeRect.top;
            if(isActiveAColumn) return transform;
            return {...transform,  y: transform.y + offsetY - draggingNodeRect.height / 2}
        }
        return transform;
    }

    return (
        <div className={styles.board} ref={cbRef}>
            <DndContext sensors={sensors} onDragStart={onDragStart}  onDragEnd={onDragEnd} onDragOver={onDragOver} onDragCancel={onDragCancel} collisionDetection={customCollisionDetection}>
                <SortableContext items={colIds} >
                    {
                        columns.map(col => <SortableContainer
                            key={col.id}
                            id={col.id}
                            tasks={tasks[col.id]}
                            onClick={deleteColumn(col.id)}
                            title={col.title}
                            disabled={isActiveDrag}
                        >
                            <TaskList isActiveDrag={isActiveDrag}>
                                <SortableContext items={tasks[col.id].map(t=> t.id)} strategy={verticalListSortingStrategy} >
                                    {tasks[col.id].map((task, index) => <TaskCard key={task.id} task={task} isTaskSelected={isTaskSelected(task.id)} showArrows={showArrows} toggleTaskSelection={toggleTaskSelection(task.id, col.id, index)} moveTasks={moveTasks(setTasks, columns)}/>)}
                                </SortableContext>
                            </TaskList>
                        </SortableContainer>)
                    }

                </SortableContext>
                <SortableContainer onClick={addNewColumn} id={"new"} disabled={isActiveDrag} >
                    <p>+Add new column</p>
                </SortableContainer>
                {createPortal(
                    <DragOverlay modifiers={[snapCenterToCursor]}>

                        {isActiveAColumn ? (
                            renderColumnOverlay(columns.find(col => col.id === activeId) as IColumn)
                        ) : (<TaskView
                            task={findItem(activeId as string) as ITask }
                            selectedLength={selectedItems.tasks.length}
                        />) }
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
    function renderColumnOverlay({id, title}:IColumn) {
        return <Column style={{height:"100%"}} title={title}>
            <Flex direction={"column"} p={"0.5rem"} bgColor={"#A47015"} gap={"0.5rem"} h={"100%"}>
                {tasks[id].map(t => <TaskView task={t} selectedLength={0}/>)}
            </Flex>
        </Column>
    }
    function onDragStart(e:DragStartEvent) {
        setActiveId(e.active.id);
        setClonedItems(tasks);
        if(!selectedItems.tasks.includes(e.active.id as string)) {
            console.log("true")
            setSelectedItems(initSelected);
            return;
        }
        const activeColumn = findColumn(e.active.id as string)



        if(!activeColumn ) return;
        if(selectedItems.tasks.length > 0) {
            setTasks(prev => ({...prev, [activeColumn]:prev[activeColumn].filter(t => t.id === e.active.id || !selectedItems.tasks.includes(t.id))}))

        }

    }
    function onDragCancel() {
        if(clonedItems) {
            setTasks(clonedItems)
        }
        setActiveId(null);
        setClonedItems(null)
    }
    //handle columns movement
    function onDragEnd(e:DragEndEvent) {
        const {active, over} =e;
        //this handler serves specifically to reorder sortable items within single sortable context(either task or column)
        if(active.id in tasks && over?.id) {
            setColumns(prev => {
                const activeIdx = prev.findIndex(col => col.id === active.id);
                const overIdx = prev.findIndex(col => col.id === over.id)
                return arrayMove(prev, activeIdx, overIdx)
            })
        }
        const activeColumn = findColumn(active.id as string);
        if(!activeColumn) {
            setActiveId(null);
            return;
        }
        const overId = over?.id;
        if(!overId) {
            setActiveId(null);
            return;
        }
        console.log(over.id);
        if(overId === "new") {
            const newColId = `Column ${columns.length + 1}`;
            setColumns(prev => ([...prev, {id:newColId, title:newColId.charAt(0).toUpperCase() + newColId.slice(1)}]));
            setTasks(prev => {
                const tasksMap = {...prev};
                tasksMap[activeColumn] = tasksMap[activeColumn].slice();
                const [task] = tasksMap[activeColumn].splice(tasksMap[activeColumn].findIndex(t => t.id === active.id), 1);
                tasksMap[newColId] = [task]
                return tasksMap;
            });
            setActiveId(null);
            return;
        }
        const overColumn = findColumn(over.id as string);
        console.log(overColumn)
        if(!overColumn){
            setActiveId(null);
            return;
        }
        const activeIdx = tasks[activeColumn].findIndex(t => t.id === active.id);
        const overIdx = tasks[overColumn].findIndex(t => t.id === over.id);
        const {tasks:selectedIds, columnId:selectedColumnId} = selectedItems;
        console.log(clonedItems, selectedColumnId)
        const selectedTasks = selectedColumnId && clonedItems ? clonedItems[selectedColumnId].filter(t => selectedIds.includes(t.id)) : [];
        setTasks(prev => {
            const tasksMap = Object.assign({}, prev) ;
            if(activeIdx === overIdx) {
                if(selectedTasks?.length === 0) return prev;
                selectedTasks.forEach(t => {
                    t.columnId = overColumn
                });
                tasksMap[overColumn] = tasksMap[overColumn].slice();
                tasksMap[overColumn].splice(overIdx, 1, ...selectedTasks);
                return tasksMap;
            }
            if(selectedTasks?.length === 0) {
                tasksMap[overColumn] = arrayMove(tasksMap[overColumn], activeIdx, overIdx);
                return tasksMap;
            }
            selectedTasks.forEach(t => {
                t.columnId = overColumn
            });
            tasksMap[overColumn] = tasksMap[overColumn].slice()
            tasksMap[overColumn].splice(activeIdx, 1);
            tasksMap[overColumn].splice(overIdx, 0, ...selectedTasks)
            return tasksMap;

        });
        setSelectedItems(prev => ({...prev, columnId:overColumn}));
        console.log(selectedItems)
        setActiveId(null);


    }


    //handle tasks movement
    function onDragOver(e:DragOverEvent) {
        //this handler is used for dynamic rearranging of tasks between columns and proper placeholder rendering
        const {active, over } = e;
        const overId = over?.id as string;

        if(!overId || overId === "new" ) return;
        console.log(overId)
        if(active.id in tasks) return;
        const activeColumn = findColumn(active.id as string)
        const overColumn = findColumn(overId as string);


        if(!activeColumn || !overColumn) return;

        if(activeColumn === overColumn) { //since rearranging within the same sortable context is handled in onDragEnd callback
            console.log("same column");
            return;
        }
        console.log("active column: " + activeColumn + " over column: " + overColumn);

        setTasks(prev => {
                const activeIndex = prev[activeColumn].findIndex(t => t.id === active.id);
                const overIndex = prev[overColumn].findIndex(t => t.id === overId);
                let newIndex:number;
                if(overId in prev) { // means the droppable is column and it's empty
                    console.log("hovering over column: " + overId);
                    console.log(prev[overId].length)
                    newIndex = prev[overId].length === 0 ? prev[overColumn].length + 1 : 0;
                }else { // means the droppable is another task
                    const isActiveBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                    const modifier = isActiveBelowOverItem ? 1 : 0; //meaning that if the dragged task is below over task, we shift it down by one
                    newIndex = overIndex >= 0 ? overIndex + modifier : prev[overColumn].length + 1;
                    console.log("hovering over: " + newIndex)
                    recentlyMovedToNewColumn.current = true;
                }
                prev = {...prev}
                prev[activeColumn] = prev[activeColumn].slice();
                const [task] = prev[activeColumn].splice(activeIndex, 1);

                task.columnId = overColumn;
                prev[overColumn] = prev[overColumn].slice();
                prev[overColumn].splice(newIndex, 0, task);
                console.log(`${activeColumn}-${activeIndex}`);
                console.log(`${activeIndex}-`)
                return prev;


            })
    }
    function addNewColumn() {
        const newColId = `Column ${columns.length + 1}`;
        setColumns(prev => ([...prev, {id:newColId, title:newColId.charAt(0).toUpperCase() + newColId.slice(1)}]));
        setTasks(prev => ({...prev, [newColId]:[]}))
    }
    function deleteColumn(colId:string) {
        return () => {
            setColumns(prev => prev.filter(col => col.id !== colId));
            setTasks(prev => {
                const newMap:Record<string, ITask[]> = {};
                for (const col of columns) {
                    if(col.id === colId) continue;
                    newMap[col.id] = prev[col.id]
                }
                return newMap;
            });
            if(selectedItems.columnId === colId) {
                setSelectedItems(initSelected)
            }
        }
    }
    function findColumn(id:string) {
        if(id in tasks) {
            return id
        }
        for (const key in tasks) {
            if(tasks[key].some(task => task.id === id)) {
                return key;
            }
        }
    }
    function findItem(id:string) {
        let task;
        for (const key in tasks) {
            task = tasks[key].find(t => t.id === id);
            if(task) return task;
        }
    }


};



export default Board;