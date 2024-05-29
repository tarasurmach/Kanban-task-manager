import {ITask} from "./task.ts";

import {Dispatch, SetStateAction} from "react";
import {arrayMove, arraySwap} from "@dnd-kit/sortable";

export interface IColumn {
    id:string,
    title:string,

}
export type Direction = "up"|"down"|"left"|"right";
export const initColumns:IColumn[] = [
    {id:"stodo", title:"Todo"},
    {id:"sprog", title:"Progress"},
    {id:"sdone", title:"Done"},
    {id:"stest", title:"Test"},
    {id:"snew", title:"New"},

];

export const initTasks:ITask[] = [
    {id:'11', title:"Todo First", status:"todo", updated_at:new Date().toDateString(), columnId:"stodo"},
    {id:'12', title:"Todo Second", updated_at: new Date().toDateString(), status: "todo", columnId:"stodo"},
    {id:'13', title:"Todo Third", updated_at: new Date().toDateString(), status: "todo", columnId:"stodo"},
    {id:'21', title: "Progress First", status: "progress", updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sprog" },
    {id:'22', title: "Progress Second", status: "progress",  updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sprog"},
    {id:'31', title: "Done First", status: "done", updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sdone" },
    {id:'32', title: "Done Second", status: "done",  updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sdone"}

];

export const ROW_SIZE = 3;
export type SetState<T> = Dispatch<SetStateAction<T>>;
export type MoveTasks =  (id:string, dir:Direction) => () => void;
export const moveTasks = (setTasks:SetState<ColumnTasksMap>, columns:IColumn[]) => (id:string, dir:Direction, )=> () => {

    setTasks(prev => {
        const tasksMap = Object.assign({}, prev);
        const [index, column] = findTask(tasksMap, id);
        const task = tasksMap[column][index];
        const columnIndex = columns.findIndex(col => col.id === task.columnId);
        if(dir=== "up" || dir==="down") {
            const destIdx = dir === "up" ? index - 1 : index + 1;
            if(dir === "up") {
                if(index === 0) {
                    const destColumnIdx = columnIndex - ROW_SIZE;
                    const destColumn = columns[destColumnIdx];
                    if(destColumnIdx < 0) return tasksMap;
                    const [removed] = tasksMap[column].splice(index, 1);
                    removed.columnId = destColumn.id
                    tasksMap[destColumn.id].push(removed);
                }else {
                    tasksMap[column] = arraySwap(tasksMap[column], index, destIdx);
                }

            }else  {
                if(index === tasksMap[column].length - 1) {
                    const destColumnIdx = columnIndex + ROW_SIZE;
                    if(destColumnIdx >= columns.length) return tasksMap;
                    const destColumn = columns[destColumnIdx];
                    const [removed] = tasksMap[column].splice(index, 1);
                    removed.columnId = destColumn.id
                    tasksMap[destColumn.id].unshift(removed)
                }else {
                    tasksMap[column] = arraySwap(tasksMap[column], index, destIdx)
                }
            }

        }else{
            if(dir === "left" && columnIndex === 0 || (dir==="right" && columnIndex === (columns.length-1))) return;
            const destIdx = dir === "left" ? columnIndex - 1 : columnIndex + 1;
            const destColumn = columns[destIdx];
            const [removed] = tasksMap[column].splice(index, 1);
            removed.columnId = destColumn.id;
            tasksMap[destColumn.id].splice(index, 0, removed);
            return tasksMap;
        }
        return tasksMap
    });
}
export type ColumnTasksMap = Record<string, ITask[]>
export const findTask = (map:ColumnTasksMap, id:string):[number, string] => {
   //console.log({map, id})
    let result ;
    for (const mapKey in map) {
        const index = map[mapKey].findIndex(t => t.id === id);
        if(index > -1) {
            result = [index, mapKey];
            break;
        }
    }
    return result as [number, string];
}

export const groupTasks = (tasks:ITask[], columns:IColumn[]):ColumnTasksMap => {
    return tasks.reduce((accum, task) => ({
     ...accum, [task.columnId] : accum[task.columnId].concat(task)
    }), columns.reduce((prev, curr) => ({...prev, [curr.id]:[]}), {}) as Record<string, ITask[]>)
}
export type SelectedItems = {
    columnId:string,
    tasks:string[]
}


export const initSelected:SelectedItems = {columnId:"", tasks:[]}