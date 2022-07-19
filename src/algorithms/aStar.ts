import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class AStar {
    graph: INode[][];
    traverse: NodeType;
    totalIterations: number;
    boundaries: boolean;
    diagonalSearch: boolean;
    delay: number;
    path: INode[];
    visited?: (row: number, column: number) => void;
    dequeued?: (row: number, column: number) => void;
    queued?: (row: number, column: number) => void;
    pathUpdated?: (path: INode[]) => void;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean, diagonalSearch: boolean, delay: number = 0, ) {
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const aStarNode: INode = {
                    ...node,
                    state: "unvisited"
                };

                return aStarNode;
            })];
        })];
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.diagonalSearch = diagonalSearch;
        this.delay = delay;
        this.path = [];
    }

    search = async (startNode: INode, endNode: INode) => {
        const first = this.graph[startNode.row][startNode.column];
        first.gScore = 0;
        first.hScore = Math.abs(first.row - endNode.row) + Math.abs(first.column - endNode.column); 
        first.fScore = first.gScore + first.hScore;

        const queue = [first];

        while(queue.length) {
            queue.sort((a,b) => a.fScore - b.fScore);

            const curretNode = await this.dequeue(queue);

            if(!curretNode) continue;

            if(curretNode.type === "end") {
                this.drawPath(curretNode);
                break;
            };

            await this.visit(curretNode);
            await this.calculateScore(queue, curretNode, endNode);
        }

        return this.graph;
    };

    calculateScore = async (queue: INode[], currentNode: INode, endNode: INode) => {
        const neighbors = NeighborHelper.getNeighbors(this.graph, currentNode, this.boundaries, this.diagonalSearch); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.type === this.traverse || neighbor.type === "end" || neighbor.type === "start";

            if(!isValidType) continue;

            if(neighbor.state === "visited") continue;

            neighbor.gScore = currentNode.gScore + 1;
            neighbor.hScore = Math.abs(neighbor.row - endNode.row) + Math.abs(neighbor.column - endNode.column); 
            neighbor.fScore = neighbor.gScore + neighbor.hScore;
            neighbor.previous = currentNode;

            if(neighbor.state === "queued") continue;

            await this.queue(queue, neighbor);
        }
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited) {
            this.visited(node.row, node.column);
            await wait(this.delay);
        }
    }

    queue = async (queue: INode[], node: INode) => {
        node.state = "queued";

        queue.push(node);

        if(this.queued) {
            this.queued(node.row, node.column);
            await wait(this.delay);
        }
    }

    dequeue = async (queue: INode[]) => {
        const curretNode = queue.shift();

        if(curretNode && this.dequeued){
            this.dequeued(curretNode.row, curretNode.column);
            await wait(this.delay);
        }

        return curretNode;
    }

    drawPath = async (node: INode) => {
        if(!node) return;

        this.path.push(node);

        if(node.previous) this.drawPath(node.previous);

        if(this.pathUpdated) {
            this.pathUpdated([...this.path]);
            await wait(this.delay);
        } 
    }
}