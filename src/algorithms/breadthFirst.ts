import { wait } from "@testing-library/user-event/dist/utils";
import Grid from "../models/Grid";
import { NodeState, NodeType } from "../models/Node";

export class BreadthFirst {
    traverse: NodeType;
    grid: Grid;
    boundaries: boolean;
    diagonalSearch: boolean;

    constructor(grid: Grid, traverse: NodeType, boundaries: boolean = false, diagonalSearch: boolean = false) {
        this.traverse = traverse;
        this.boundaries = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.grid = grid;
    };

    scan = async (delay: number) => {
        const startNode = this.grid.getStartNode();

        if(!startNode) return;
        
        const queue = [startNode];

        while(queue.length > 0) {
            const current = queue.pop();

            if(!current) continue;
            if(current.getState() === NodeState.Visited) continue;

            current.visit();

            const neighbors = this.grid.getNeighbors(current, this.boundaries, this.diagonalSearch); 

            for(let neighbor of neighbors) {
                if(neighbor.getState() === NodeState.Visited || neighbor.getType() !== this.traverse) 
                    continue;
                
                neighbor.unshiftIn(queue);
            }

            if(delay) await wait(delay);
        }
    };
}