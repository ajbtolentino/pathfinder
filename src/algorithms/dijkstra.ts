import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class Dijkstra {
    traverse: NodeType;
    graph: INode[][];
    totalIterations: number;
    boundaries: boolean;
    path: INode[];
    delay: number;
    visited?: (row: number, column: number) => void;
    dequeued?: (row: number, column: number) => void;
    queued?: (row: number, column: number) => void;
    pathUpdated?: (path: INode[]) => void;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean, delay: number = 0) {
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.path = [];
        this.delay = delay;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {...node, state: "unvisited"};
                return newNode;
            })];
        })];
    }

    search = async (startNode: INode) => {
        const first = this.graph[startNode.row][startNode.column];
        first.distance = 0;

        const queue = [first];

        let finalNode: INode | undefined | null = null;

        while(queue.length > 0) {
            const current = await this.dequeue(queue);

            if(!current) continue;

            if(current.state === "visited") continue;

            await this.visit(current);

            const isFound = await this.isFound(queue, current);
            if(isFound) {
                finalNode = isFound;
                break;
            }
            this.totalIterations++;
        }

        return this.graph;
    };
    
    drawPath = async (node: INode) => {
        if(!node) return;

        this.path.push(node);

        if(node.previous) this.drawPath(node.previous);

        if(this.pathUpdated) {
            this.pathUpdated([...this.path]);
            await wait(0);
        } 
    }

    isFound = async (queue: INode[], current: INode) => {
        const neighbors = NeighborHelper.getNeighbors(this.graph, current, this.boundaries); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.type === this.traverse || neighbor.type === "end" || neighbor.type === "start";
            const isValid = isValidType && neighbor.state === "unvisited";

            if(!isValid) continue;

            if(current.distance < neighbor.distance) {
                neighbor.distance = current.distance + 1;
                neighbor.previous = {...current};

                this.path = [];
                await this.drawPath(neighbor.previous);
            }

            if(neighbor.type === "end") return neighbor;
            
            await this.queue(queue, neighbor);
        }

        return null;
    }

    dequeue = async (queue: INode[]) => {
        const current = queue.pop();

        if(current && this.dequeued){
            this.dequeued(current.row, current.column);
            await wait(0);
        }

        return current;
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited) {
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