import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState } from "../models/INode";

export type Direction = "top" | "right" | "bottom" | "left";

export class DepthFirst {
    graph: INode[][];
    totalIterations: number;
    stateChanged?: (row: number, column: number, state: NodeState) => Promise<any>;
    done?: (graph: INode[][]) => void;

    constructor(graph: INode[][], startNode: INode){
        this.totalIterations = 0;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                return {...node};
            })];
        })];
    };
    
    stack = async (node: INode) => {
        const stack: INode[] = [node];

        while(stack.length > 0) {
            this.totalIterations++;

            const current = stack.shift();

            if(!current) continue;

            if(this.stateChanged) await this.stateChanged(current.row, current.column, "pointed");

            if(this.graph[current.row][current.column].state === "visited") {
                if(this.stateChanged) await this.stateChanged(current.row, current.column, "visited");
                return;
            };

            this.graph[current.row][current.column].state = "visited";
            if(this.stateChanged) await this.stateChanged(current.row, current.column, "visited");

            const neighbors = NeighborHelper.getNeighbors(this.graph, current); 

            for(let neighbor of neighbors) {
                if(neighbor.state === "visited" || neighbor.type !== "empty") continue;
                if(this.stateChanged) await this.stateChanged(neighbor.row, neighbor.column, "queued");
                
                stack.unshift(neighbor);
            }
        }

        if(this.done) this.done(this.graph);
    };

    recursive = async (node: INode) => {
        this.totalIterations++;

        if(!node) return;

        if(this.stateChanged) await this.stateChanged(node.row, node.column, "pointed");

        if(this.graph[node.row][node.column].state === "visited") {
            if(this.stateChanged) await this.stateChanged(node.row, node.column, "visited");
            return;
        };

        this.graph[node.row][node.column].state = "visited";
        if(this.stateChanged) await this.stateChanged(node.row, node.column, "visited");

        const neighbors = NeighborHelper.getNeighbors(this.graph, node); 

        for(let neighbor of neighbors) {
            if(neighbor.state === "visited" || neighbor.type !== "empty") continue;
            await this.recursive(neighbor);
        }
    }
} 