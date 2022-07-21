import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class BreadthFirst {
    traverse: NodeType;
    graph: INode[][];
    totalIterations: number;
    boundaries: boolean;
    visited?: (row: number, column: number) => Promise<void>;
    dequeued?: (row: number, column: number) => Promise<void>;
    queued?: (row: number, column: number) => Promise<void>;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean) {
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {...node, state: "unvisited"};
                return newNode;
            })];
        })];
    }

    scan = async (startNode: INode) => {
        const queue = [this.graph[startNode.row][startNode.column]];

        while(queue.length > 0) {
            const current = await this.dequeue(queue);

            if(!current) continue;
            if(current.state === "visited") continue;

            await this.visit(current);

            const neighbors = NeighborHelper.getNeighbors(this.graph, current, this.boundaries); 

            for(let neighbor of neighbors) {
                if(neighbor.state === "queued" || 
                  neighbor.state === "visited" || 
                  neighbor.type !== this.traverse) continue;
                
                await this.queue(queue, neighbor)
            }

            this.totalIterations++;
        }

        return this.graph;
    };

    dequeue = async (queue: INode[]) => {
        const current = queue.pop();

        if(current && this.dequeued) 
            await this.dequeued(current.row, current.column);

        return current;
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited) 
            await this.visited(node.row, node.column);
    }

    queue = async (stack: INode[], node: INode) => {
        stack.unshift(node);

        if(this.queued) 
            await this.queued(node.row, node.column);
    }
}