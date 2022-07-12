import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class AStar {
    graph: INode[][];
    startNode: INode | undefined;
    endNode: INode | undefined;
    traverse: NodeType;
    totalIterations: number;
    boundaries: boolean;
    delay: number;
    visited?: (row: number, column: number) => void;
    dequeued?: (row: number, column: number) => void;
    queued?: (row: number, column: number) => void;

    constructor(graph: INode[][], traverse: NodeType, boundaries: boolean, delay: number = 0) {
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const aStarNode: INode = {
                    ...node,
                    state: "unvisited"
                };

                if(aStarNode.type === "start") {
                    aStarNode.gScore = 0;
                    this.startNode = aStarNode;
                }

                if(aStarNode.type === "end"){
                    this.endNode = aStarNode;
                }

                return aStarNode;
            })];
        })];
        this.traverse = traverse;
        this.totalIterations = 0;
        this.boundaries = boundaries;
        this.delay = delay;
        
    }

    search = async () => {
        if(!this.startNode || !this.endNode) return;

        const first = this.graph[this.startNode.row][this.startNode.column];
        let queue = [first];

        while(queue.length > 0) {
            this.totalIterations++;

            const current = await this.dequeue(queue);

            if(!current) continue;
            if(current.type === "end") return current;
            if(current.state === "visited") continue;

            await this.visit(current);
            await this.calculate(queue, current);        
            queue = queue.sort(_ => _.fScore);    
        }
    };

    calculate = async (queue: INode[], currentNode: INode) => {
        if(!this.startNode || !this.endNode) return;

        const neighbors = NeighborHelper.getNeighbors(this.graph, currentNode, this.boundaries); 

        for(let neighbor of neighbors) {
            const isValidType = neighbor.type === this.traverse || neighbor.type === "end" || neighbor.type === "start";
            const isUnvisited = isValidType && neighbor.state === "unvisited";

            if(!isUnvisited) continue;

            if(currentNode.gScore < neighbor.gScore) {
                neighbor.gScore = currentNode.gScore + 1;
            }

            neighbor.hScore = (neighbor.row + this.endNode.row) + (neighbor.column + this.endNode.column); //Calculate Manhattan distance
            neighbor.fScore = neighbor.gScore + neighbor.hScore;

            if(!queue.some(_ => neighbor.hScore < _.hScore))
                this.queue(queue, neighbor);
        }

        return null;
    }

    dequeue = async (queue: INode[]) => {
        const curretNode = queue.pop();

        if(curretNode && this.dequeued){
            this.dequeued(curretNode.row, curretNode.column);
            await wait(this.delay);
        }

        return curretNode;
    }

    visit = async (node: INode) => {
        node.state = "visited";

        if(this.visited) {
            this.visited(node.row, node.column);
            await wait(this.delay);
        }
    }

    queue = async (queue: INode[], node: INode) => {
        queue.unshift(node);

        if(this.queued) {
            this.queued(node.row, node.column);
            await wait(this.delay);
        }
    }
}