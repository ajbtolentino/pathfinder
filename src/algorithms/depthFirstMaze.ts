import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class DepthFirstMaze {
    grid: INode[][];
    totalIterations: number;
    nodeUpdated?: (row: number, column: number, type: NodeType) => Promise<void>;

    constructor(graph: INode[][]){
        this.totalIterations = 0;
        this.grid = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {...node, type: node.type === "empty" ? "wall" : node.type, state: "unvisited"};

                return newNode;
            })];
        })];
    };

    run = async (row: number, column: number) => {
        this.totalIterations++;

        // this.grid[row][column].state = "visited";

        const stack = [this.grid[row][row]];

        while(stack.length) {
            const current = stack.pop();

            if(!current) continue;
            
            const neighbors = NeighborHelper.getNeighbors(this.grid, current, true, false, 2);
            const unvisitedNeighbors = neighbors.filter(_ => _.state === "unvisited");

            if(unvisitedNeighbors.length){
                this.stack(stack, current);

                current.type = "empty";
                if(this.nodeUpdated) await this.nodeUpdated(current.row, current.column, "empty");

                const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
                const chosenNeighbor = unvisitedNeighbors[randomIndex];
                
                //Connect the neighbor
                if(chosenNeighbor) {
                    const connectorRowDiff = chosenNeighbor.row === current.row ? 0 : chosenNeighbor.row - current.row;
                    const connectorColumnDiff = chosenNeighbor.column === current.column ? 0 : chosenNeighbor.column - current.column;

                    let connectorRow = 0;
                    let connectorColumn = 0;

                    if(connectorRowDiff > 0) {
                        connectorRow = 1;
                    }

                    if(connectorRowDiff < 0) {
                        connectorRow = -1;
                    }

                    if(connectorColumnDiff > 0) {
                        connectorColumn = 1;
                    }

                    if(connectorColumnDiff < 0) {
                        connectorColumn = -1;
                    }

                    const path = this.grid[current.row + connectorRow][current.column + connectorColumn];

                    if(path.type === "wall") {
                        path.state = "visited";
                        path.type = "empty";

                        if(this.nodeUpdated) await this.nodeUpdated(path.row, path.column, "empty");
                    }
                    this.visit(chosenNeighbor);

                    this.stack(stack, chosenNeighbor);
                }
            }

            console.log("!");
        }

        return this.grid;
    };

    visit = async (node: INode) => {
        node.state = "visited";
    };

    stack = async (stack: INode[], node: INode) => {
        stack.push(node);
    };
} 