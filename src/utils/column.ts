import {ITask} from "./task.ts";

export interface IColumn {
    id:string,
    title:string,

}

export const initColumns:IColumn[] = [
    {id:"stodo", title:"Todo"},
    {id:"sprog", title:"Progress"},
    {id:"sdone", title:"Done"},
    {id:"stest", title:"Test"},
    {id:"snew", title:"New"},

];

export const initTasks:ITask[] = [
    {id:11, title:"First", status:"todo", updated_at:new Date().toDateString(), columnId:"stodo"},
    {id:12, title:"Todo Second", updated_at: new Date().toDateString(), status: "todo", columnId:"stodo"},
    {id:21, title: "Progress First", status: "progress", updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sprog" },
    {id:22, title: "Progress Second", status: "progress",  updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sprog"},
    {id:31, title: "Done First", status: "done", updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sdone" },
    {id:32, title: "Done Second", status: "done",  updated_at: new Date(2024, 3, new Date().getDate()-1).toDateString(), columnId:"sdone"}

];

export type ColumnTasksMap = Record<string, ITask[]>

export const groupTasks = (tasks:ITask[], columns:IColumn[]):ColumnTasksMap => {
    return tasks.reduce((accum, task) => ({
     ...accum, [task.columnId] : accum[task.columnId].concat(task)
    }), columns.reduce((prev, curr) => ({...prev, [curr.id]:[]}), {}) as Record<string, ITask[]>)
}