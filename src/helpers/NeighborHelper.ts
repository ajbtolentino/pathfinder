import INode from "../models/INode";

export default class NeighborHelper {
    static getNeighbors = (graph: INode[][], node: INode, boundaries: boolean = true, includeCorners: boolean = false, increment: number = 1) : INode[] => {
        const neighbors: INode[] = [];

        const top = NeighborHelper.getNeighbor(graph, node.row - increment, node.column, boundaries);
        const topRight = NeighborHelper.getNeighbor(graph, node.row - increment, node.column + increment, boundaries);
        const right = NeighborHelper.getNeighbor(graph, node.row, node.column + increment, boundaries);
        const bottomRight = NeighborHelper.getNeighbor(graph, node.row + increment, node.column + increment, boundaries);
        const bottom = NeighborHelper.getNeighbor(graph, node.row + increment, node.column, boundaries);
        const bottomLeft = NeighborHelper.getNeighbor(graph, node.row + increment, node.column - increment, boundaries);
        const left = NeighborHelper.getNeighbor(graph, node.row, node.column - increment, boundaries);
        const topLeft = NeighborHelper.getNeighbor(graph, node.row - increment, node.column - increment, boundaries);

        if(top) neighbors.push(top);
        if(topRight && includeCorners) neighbors.push(topRight);
        if(right) neighbors.push(right);
        if(bottomRight && includeCorners) neighbors.push(bottomRight);
        if(bottom) neighbors.push(bottom);
        if(bottomLeft && includeCorners) neighbors.push(bottomLeft);
        if(left) neighbors.push(left);
        if(topLeft && includeCorners) neighbors.push(topLeft);

        // const dx = [-1, 0, 1];
        // const dy = [-1, 0, 1];

        // for(let x = 0; x < dx.length; x++) {
        //     for(let y = 0; y < dy.length; y++) {
        //         const neighbor = NeighborHelper.getNeighbor(graph, node.row + dx[x], node.column + dy[y], boundaries);
        //         if(neighbor) neighbors.push(neighbor);
        //     }   
        // }

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