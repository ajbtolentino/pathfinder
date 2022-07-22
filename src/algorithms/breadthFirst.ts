import { wait } from "@testing-library/user-event/dist/utils";
import Grid from "../models/Grid";
import Node, { NodeState, NodeType } from "../models/Node";

export class BreadthFirst {
    traverse: NodeType;
    grid: Grid;
    totalIterations: number;
    boundaries: boolean;
    diagonalSearch: boolean;

    constructor(grid: Grid, traverse: NodeType, boundaries: boolean = false, diagonalSearch: boolean = false) {
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.grid = grid;
    };

    scan = async (delay: number) => {
        this.grid.reset();

        const startNode = this.grid.getStartNode();

        if(!startNode) return;
        
        const queue = [this.grid.nodes[startNode.x][startNode.y]];

        while(queue.length > 0) {
            const current = queue.pop();

            if(!current) continue;
            if(current.getState() === NodeState.Visited) continue;

            current.setState(NodeState.Visited);

            const neighbors = this.grid.getNeighbors(current, this.boundaries, this.diagonalSearch); 

            for(let neighbor of neighbors) {
                if(neighbor.getState() === NodeState.Visited || neighbor.getType() !== this.traverse) 
                    continue;
                
                this.queue(queue, neighbor);
                queue.unshift(neighbor);
            }

            await wait(delay);

            this.totalIterations++;
        }
    };

    private queue = (stack: Node[], node: Node) => {
        stack.unshift(node);
        node.setState(NodeState.Queued);
    }
}