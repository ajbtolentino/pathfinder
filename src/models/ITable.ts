import INode from "./INode";

export default interface ITable {
    columns: number;
    rows: number;
    grid: INode[][];
}