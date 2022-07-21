import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class Dijkstra {
    traverse: NodeType;
    graph: INode[][];
    totalIterations: number;
    boundaries: boolean;
    diagonalSearch: boolean;
    path: INode[];
    visited?: (row: number, column: number) => Promise<void>;
    dequeued?: (row: number, column: number) => Promise<void>;
    queued?: (row: number, column: number) => Promise<void>;
    pathUpdated?: (path: INode[]) => Promise<void>;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean, diagonalSearch: boolean) {
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.path = [];
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {
                    ...node, 
                    distance: node.type === "start" ? 0 : Infinity,
                    state: "unvisited"
                };

                return newNode;
            })];
        })];
    }

    search = async (startNode: INode) => {
        const first = this.graph[startNode.row][startNode.column];

        const queue = [first];

        while(queue.length > 0) {
            const current = await this.dequeue(queue);

            if(!current) continue;

            this.path = [];
            await this.drawPath(current);

            if(current.state === "visited") continue;
            if(current.type === "end") break;

            await this.visit(current);
            await this.calculateDistance(queue, current);
            
            this.totalIterations++;
        }

        return this.graph;
    };
    
    drawPath = async (node: INode) => {
        if(!node) return;

        this.path.push(node);

        if(node.previous) this.drawPath(node.previous);

        if(this.pathUpdated) await this.pathUpdated([...this.path]);
    }

    calculateDistance = async (queue: INode[], current: INode) => {
        const neighbors = NeighborHelper.getNeighbors(this.graph, current, this.boundaries, this.diagonalSearch); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.type === this.traverse || neighbor.type === "end" || neighbor.type === "start";
            const isValid = isValidType && neighbor.state === "unvisited";

            if(!isValid) continue;

            if(current.distance < neighbor.distance) {
                neighbor.distance = current.distance + 1;
                neighbor.previous = {...current};
            }

            await this.queue(queue, neighbor);
        }

        return null;
    }

    dequeue = async (queue: INode[]) => {
        const current = queue.sort(_ => _.fScore).pop();

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