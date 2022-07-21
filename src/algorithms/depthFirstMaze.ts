import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class DepthFirstMaze {
    graph: INode[][];
    totalIterations: number;
    nodeUpdated?: (row: number, column: number, type: NodeType) => Promise<void>;

    constructor(graph: INode[][]){
        this.totalIterations = 0;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {...node, state: "unvisited"};

                if(newNode.type === "wall") newNode.type = "empty";

                return newNode;
            })];
        })];
    };

    run = async (row: number, column: number) => {
        this.totalIterations++;

        const stack = [this.graph[row][column]];

        while(stack.length) {
            const current = stack.pop();

            if(!current) continue;

            await this.visit(current);

            const neighbors = NeighborHelper.getNeighbors(this.graph, current);
            const unvisitedNeighbors = neighbors.filter(_ => _.state === "unvisited" && _.type !== "end");

            if(unvisitedNeighbors.length){
                const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
                const chosenNeighbor = unvisitedNeighbors[randomIndex];
                
                if(chosenNeighbor){
                    chosenNeighbor.type = "wall";
                    if(this.nodeUpdated) await this.nodeUpdated(chosenNeighbor.row, chosenNeighbor.column, "wall");
                }

                for(const n of unvisitedNeighbors) {
                    if(n.type === "wall") continue;

                    await this.stack(stack, n);
                }
            }

            console.log("!");
        }

        return this.graph;
    };

    visit = async (node: INode) => {
        node.state = "visited";
    };

    stack = async (stack: INode[], node: INode) => {
        stack.push(node);
    };
} 