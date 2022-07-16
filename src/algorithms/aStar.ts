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
        first.hScore = Math.sqrt(Math.pow(first.row - endNode.row, 2) + Math.pow(first.column - endNode.column, 2)); 
        first.fScore = first.gScore + first.hScore;

        const queue = [first];

        while(queue.length) {
            this.totalIterations++;

            const current = await this.dequeue(queue);

            if(!current) continue;
            if(current.type === "end") break;
            if(current.state === "visited") continue;

            await this.visit(current);
            await this.calculateScores(queue, current, endNode);   
        }

        return this.graph;
    };

    calculateScores = async (queue: INode[], currentNode: INode, endNode: INode) => {
        const neighbors = NeighborHelper.getNeighbors(this.graph, currentNode, this.boundaries, this.diagonalSearch); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.type === this.traverse || neighbor.type === "end" || neighbor.type === "start";

            if(!isValidType) continue;
            if(neighbor.state === "visited") continue;

            neighbor.gScore = currentNode.gScore + 1;
            neighbor.hScore = Math.sqrt(Math.pow(neighbor.row - endNode.row, 2) + Math.pow(neighbor.column - endNode.column, 2)); 
            neighbor.fScore = neighbor.gScore + neighbor.hScore;

            if(currentNode.gScore < neighbor.gScore){
                neighbor.previous = currentNode;
                this.path = [];
                this.drawPath(neighbor);
            }

            if(neighbor.gScore < currentNode.gScore){
                currentNode.previous = neighbor.previous;
                this.path = [];
                this.drawPath(currentNode);
            }

            this.queue(queue, neighbor);

            if(neighbor.type === "end") {
                neighbor.previous = currentNode;
                break;
            }
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
        queue.push(node);

        if(this.queued) {
            this.queued(node.row, node.column);
            await wait(this.delay);
        }
    }

    dequeue = async (queue: INode[]) => {
        queue.sort((a,b) => a.hScore - b.hScore);
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