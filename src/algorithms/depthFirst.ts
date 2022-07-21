import { wait } from "../helpers/WaitHelper";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class DepthFirst {
    graph: INode[][];
    traverse: NodeType;
    totalIterations: number;
    boundaries: boolean;
    diagonalSearch: boolean;
    pointed?: (row: number, column: number) => Promise<void>;
    visited?: (row: number, column: number) => Promise<void>;
    stacked?: (row: number, column: number) => Promise<void>;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean = false, diagonalSearch: boolean = false){
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {...node, state: "unvisited"};
                return newNode;
            })];
        })];
    };
    
    runStack = async (row: number, column: number) => {
        this.totalIterations = 0;

        const stack: INode[] = [this.graph[row][column]];

        while(stack.length > 0) {
            const current = await this.shift(stack);

            if(!current) continue;
            if(current.state === "visited") continue;

            await this.visit(current);

            const neighbors = NeighborHelper.getNeighbors(this.graph, current, this.boundaries); 

            for(let neighbor of neighbors) {
                if(neighbor.state === "visited" || neighbor.type !== this.traverse) 
                    continue;
                
                await this.stack(stack, neighbor);
            }

            this.totalIterations++;
        }

        return this.graph;
    };

    runRecursive = async (row: number, column: number) => {
        const current = this.graph[row][column];

        if(!current) return;
        
        if(this.pointed)
            await this.pointed(current.row, current.column);

        if(current.state === "visited") return;

        await this.visit(current);

        const neighbors = NeighborHelper.getNeighbors(this.graph, current, this.boundaries, this.diagonalSearch); 

        for(let neighbor of neighbors) {
            if(neighbor.state === "visited" || neighbor.type !== this.traverse) continue;

            await this.runRecursive(neighbor.row, neighbor.column);
        }

        this.totalIterations++;

        if(current.row === 0 && current.column === 0) 
            return this.graph;
    };

    shift = async (stack: INode[]): Promise<INode | undefined | null> => {
        const current = stack.shift();

        if(!current) return null;

        if(this.pointed)
            await this.pointed(current.row, current.column);

        return current;
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited)
            await this.visited(node.row, node.column);
    }

    stack = async (stack: INode[], node: INode) => {
        stack.unshift(node);

        if(this.stacked) 
            await this.stacked(node.row, node.column);
    }
} 