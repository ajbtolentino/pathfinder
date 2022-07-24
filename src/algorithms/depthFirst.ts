import { wait } from "../helpers/WaitHelper";
import NeighborHelper from "../helpers/NeighborHelper";
import Grid from "../models/Grid";
import Node, { NodeState, NodeType } from "../models/Node";

export class DepthFirst {
    grid: Grid;
    traverse: NodeType;
    hasBorders: boolean;
    diagonalSearch: boolean;
    totalIterations: number;

    constructor(grid: Grid, traverse: NodeType, boundaries: boolean = false, diagonalSearch: boolean = false){
        this.traverse = traverse;
        this.hasBorders = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.grid = grid;
        this.totalIterations = 0;
    };
    
    runStack = async (delay: number) => {
        const startNode = this.grid.getStartNode();

        if(!startNode) return;

        const stack: Node[] = [];

        startNode.unshiftIn(stack);

        while(stack.length > 0) {
            const current = stack.shift();

            if(!current) continue;
            if(current.getState() === NodeState.Visited) continue;

            current.visit();

            const neighbors = this.grid.getNeighbors(current, this.hasBorders, this.diagonalSearch); 

            for(let neighbor of neighbors) {
                if(neighbor.getState() === NodeState.Visited || neighbor.getType() !== this.traverse) 
                    continue;
                
                neighbor.unshiftIn(stack);
            }

            if(delay) await wait(delay);
        }

        return this.grid;
    };

    runRecursive = async (delay: number, startNode: Node | undefined = undefined) => {
        if(!startNode)
            startNode = this.grid.getStartNode();

        if(!startNode) 
            return;

        await this.recursive(startNode, delay);

        this.totalIterations++;
    };

    private recursive = async (node: Node, delay: number) => {
        const current = this.grid.nodes[node.x][node.y];

        if(!current) return;

        if(current.getState() === NodeState.Visited) return;

        current.visit();

        if(delay) await wait(delay);

        const neighbors = this.grid.getNeighbors(current, this.hasBorders, this.diagonalSearch);

        for(let neighbor of neighbors) {
            if(neighbor.getState() === NodeState.Visited || neighbor.getType() !== this.traverse) continue;

            await this.recursive(neighbor, delay);
        }

        if(!current.x && !current.y) return;
    }
} 