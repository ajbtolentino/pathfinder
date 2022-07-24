import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import Grid from "../models/Grid";
import Node, { NodeState, NodeType } from "../models/Node";

export class Dijkstra {
    traverse: NodeType;
    grid: Grid;
    hasBorders: boolean;
    includeDiagonal: boolean;
    path: Node[];
    visited?: (row: number, column: number) => Promise<void>;
    dequeued?: (row: number, column: number) => Promise<void>;
    queued?: (row: number, column: number) => Promise<void>;
    pathUpdated?: (path: Node[]) => Promise<void>;

    constructor(grid: Grid, traverse: NodeType, boundaries: boolean, diagonalSearch: boolean) {
        this.traverse = traverse;
        this.hasBorders = boundaries;
        this.includeDiagonal = diagonalSearch;
        this.path = [];
        this.grid = grid;
    }

    search = async (delay: number) => {
        this.grid.resetAllNodes();
        
        const startNode = this.grid.getStartNode();

        if(!startNode) return;
        
        startNode.gScore = 0;

        const queue: Node[] = [startNode];

        while(queue.length > 0) {
            const currentNode = queue.pop();

            if(!currentNode) 
                continue;
                
            if(currentNode.getState() === NodeState.Visited) 
                continue;

            if(currentNode.getType() === NodeType.Goal) {
                this.drawPath(currentNode);
                break;
            };

            currentNode.visit();

            this.calculateDistance(queue, currentNode);
            
            await wait(delay);
        }

        return this.grid;
    };
    
    drawPath = (node: Node) => {
        if(!node) return;

        this.path.push(node);

        if(node.previous) this.drawPath(node.previous);
    }

    calculateDistance = (queue: Node[], currentNode: Node) => {
        const neighbors = this.grid.getNeighbors(currentNode, this.hasBorders, this.includeDiagonal); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.getType() === this.traverse || 
                                neighbor.getType() === NodeType.Goal || 
                                neighbor.getType() === NodeType.Start;

            const isValid = isValidType && neighbor.getState() === NodeState.Unvisited;

            if(!isValid) continue;

            if(currentNode.gScore < neighbor.gScore) {
                neighbor.gScore = currentNode.gScore + 1;
                neighbor.previous = currentNode;
            }

            neighbor.unshiftIn(queue);
        }

        return null;
    }
}