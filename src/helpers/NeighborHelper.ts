import INode from "../models/INode";

export default class NeighborHelper {
    static getNeighbors = (graph: INode[][], node: INode) : INode[] => {
        const neighbors: INode[] = [];

        const top = NeighborHelper.getNeighbor(graph, node.row - 1, node.column);
        const right = NeighborHelper.getNeighbor(graph, node.row, node.column + 1);
        const bottom = NeighborHelper.getNeighbor(graph, node.row + 1, node.column);
        const left = NeighborHelper.getNeighbor(graph, node.row, node.column - 1);

        if(top) neighbors.push(top);
        if(right) neighbors.push(right);
        if(bottom) neighbors.push(bottom);
        if(left) neighbors.push(left);

        return neighbors;
    }

    static getNeighbor = (graph: INode[][], row: number, column: number): INode | null => {
        const rowInbouds = 0 <= row && row < graph.length;
        const columnInbounds = 0 <= column && graph[0].length;

        if(!rowInbouds || !columnInbounds) return null;

        return graph[row][column];
    }
}