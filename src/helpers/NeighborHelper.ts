import INode from "../models/INode";

export default class NeighborHelper {
    static getNeighbors = (graph: INode[][], node: INode, boundaries: boolean, includeCorners: boolean = false) : INode[] => {
        const neighbors: INode[] = [];

        const top = NeighborHelper.getNeighbor(graph, node.row - 1, node.column, boundaries);
        const topRight = NeighborHelper.getNeighbor(graph, node.row - 1, node.column + 1, boundaries);
        const right = NeighborHelper.getNeighbor(graph, node.row, node.column + 1, boundaries);
        const bottomRight = NeighborHelper.getNeighbor(graph, node.row + 1, node.column + 1, boundaries);
        const bottom = NeighborHelper.getNeighbor(graph, node.row + 1, node.column, boundaries);
        const bottomLeft = NeighborHelper.getNeighbor(graph, node.row + 1, node.column - 1, boundaries);
        const left = NeighborHelper.getNeighbor(graph, node.row, node.column - 1, boundaries);
        const topLeft = NeighborHelper.getNeighbor(graph, node.row - 1, node.column - 1, boundaries);

        if(top) neighbors.push(top);
        if(topRight && includeCorners) neighbors.push(topRight);
        if(right) neighbors.push(right);
        if(bottomRight && includeCorners) neighbors.push(bottomRight);
        if(bottom) neighbors.push(bottom);
        if(bottomLeft && includeCorners) neighbors.push(bottomLeft);
        if(left) neighbors.push(left);
        if(topLeft && includeCorners) neighbors.push(topLeft);

        return neighbors;
    }

    static getNeighbor = (graph: INode[][], row: number, column: number, boundaries: boolean): INode | null => {
        if(boundaries){
            const rowInbouds = 0 <= row && row < graph.length;
            const columnInbounds = 0 <= column && graph[0].length;

            if(!rowInbouds || !columnInbounds) return null;
        }
        else {
            row = ((row % graph.length) + graph.length) % graph.length;
            column = ((column % graph[0].length) + graph[0].length) % graph[0].length;
        }

        return graph[row][column];
    }
}