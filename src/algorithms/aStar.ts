import { wait } from "@testing-library/user-event/dist/utils";
import NeighborHelper from "../helpers/NeighborHelper";
import Grid from "../models/Grid";
import Node, { NodeState, NodeType } from "../models/Node";

export class AStar {
    grid: Grid;
    traverse: NodeType;
    hasBorders: boolean;
    includeDiagonal: boolean;
    path: Node[];

    constructor(grid: Grid, traverse: NodeType, boundaries: boolean, diagonalSearch: boolean) {
        this.grid = grid;
        this.traverse = traverse;
        this.hasBorders = boundaries;
        this.includeDiagonal = diagonalSearch;
        this.path = [];
    }

    search = async (delay: number) : Promise<void> => {
        this.grid.reset();

        const startNode = this.grid.getStartNode();
        const endNode = this.grid.getEndNode();

        if(!startNode || !endNode) return;

        startNode.gScore = 0;
        startNode.hScore = Math.abs(startNode.x - endNode.x) + Math.abs(startNode.y - endNode.y); 
        startNode.fScore = startNode.gScore + startNode.hScore;

        const queue = [startNode];

        while(queue.length) {
            queue.sort((a,b) => a.fScore - b.fScore);

            const curretNode = queue.shift();

            if(!curretNode) continue;

            if(curretNode.getType() === NodeType.Goal) {
                this.drawPath(curretNode);
                break;
            }

            curretNode.visit();

            this.calculateScore(queue, curretNode, endNode);

            if(delay) await wait(delay);
        }
    };

    calculateScore = (queue: Node[], currentNode: Node, endNode: Node) => {
        const neighbors = this.grid.getNeighbors(currentNode, this.hasBorders, this.includeDiagonal);

        for(let neighbor of neighbors) {
            const isValidType = neighbor.getType() === this.traverse || 
                                neighbor.getType() === NodeType.Goal || 
                                neighbor.getType() === NodeType.Start;

            if(!isValidType) continue;

            const tentativeGScore = currentNode.gScore + ((neighbor.x - currentNode.x === 0 || neighbor.y - currentNode.y === 0) ? 1 : Math.SQRT2);
            // const tentativeGScore = currentNode.gScore + 1;

            if(neighbor.getState() === NodeState.Unvisited || tentativeGScore < neighbor.gScore) {
                neighbor.gScore = tentativeGScore;
                neighbor.hScore = this.includeDiagonal ? 
                                    Math.sqrt(Math.pow(neighbor.x - endNode.x, 2) + Math.pow(neighbor.y - endNode.y, 2)) : 
                                    Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.y - endNode.y); 
                neighbor.fScore = neighbor.gScore + neighbor.hScore;
                neighbor.previous = currentNode;
            }

            if(neighbor.getState() === NodeState.Unvisited) 
                neighbor.pushIn(queue);
        }
    }

    queue = async (queue: Node[], node: Node) => {
        queue.push(node);

        node.setState(NodeState.Queued);
    };

    drawPath = (node: Node) => {
        if(!node) return;

        this.path.push(node);

        if(node.previous) this.drawPath(node.previous);
    };
}