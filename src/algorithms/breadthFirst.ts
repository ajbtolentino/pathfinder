import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class BreadthFirst {
    traverse: NodeType;
    graph: INode[][];
    totalIterations: number;
    delay: number;
    visited?: (row: number, column: number) => void;
    dequeued?: (row: number, column: number) => void;
    queued?: (row: number, column: number) => void;
    boundaries: boolean;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean, delay: number = 0) {
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.delay = delay;
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

        if(current && this.dequeued) {
            this.dequeued(current.row, current.column);
            await wait(0);
        }

        return current;
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited){
            this.visited(node.row, node.column);
            await wait(0);
        }
    }

    queue = async (stack: INode[], node: INode) => {
        stack.unshift(node);

        if(this.queued) {
            this.queued(node.row, node.column);
            await wait(0);
        }
    }
}