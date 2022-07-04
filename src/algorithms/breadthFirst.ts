import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState } from "../models/INode";

export class BreadthFirst {
    graph: INode[][];
    iteration: number;
    done?: (graph: INode[][]) => void;
    stateChanged?: (row: number, column: number, state: NodeState) => Promise<any>;

    constructor(graph: INode[][]) {
        this.iteration = 0;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                return {...node};
            })];
        })];
    }

    scan = async (startNode: INode) => {
        const queue = [startNode];

        while(queue.length > 0) {
            this.iteration++;

            const current = queue.pop();

            if(!current) break;

            //Mark the current pointer
            if(this.stateChanged) 
                await this.stateChanged(current.row, current.column, "pointed");

            //Revert to visited
            if(this.graph[current.row][current.column].state === "visited") {
                if(this.stateChanged) 
                    await this.stateChanged(current.row, current.column, "visited");
                    
                continue;
            };

            //Mark as visited
            this.graph[current.row][current.column].state = "visited";
            if(this.stateChanged) 
                await this.stateChanged(current.row, current.column, "visited");

            const neighbors = NeighborHelper.getNeighbors(this.graph, current); 

            for(let neighbor of neighbors) {
                if(neighbor.state === "visited" || neighbor.type !== "empty") continue;
                if(this.stateChanged) await this.stateChanged(neighbor.row, neighbor.column, "queued");
                
                queue.unshift(neighbor);
            }
        }

        if(this.done) this.done(this.graph);
    };
}