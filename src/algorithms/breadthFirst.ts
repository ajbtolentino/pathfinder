import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class BreadthFirst {
    traverse: NodeType;
    graph: INode[][];
    iteration: number;
    done?: (graph: INode[][]) => void;
    stateChanged?: (row: number, column: number, state: NodeState) => Promise<any>;

    constructor(graph: INode[][], traverse: NodeType) {
        this.traverse = traverse;
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
                if(this.stateChanged) await this.stateChanged(current.row, current.column, "visited");

                continue;
            };

            //Mark as visited
            this.graph[current.row][current.column].state = "visited";
            if(this.stateChanged) 
                await this.stateChanged(current.row, current.column, "visited");

            const neighbors = NeighborHelper.getNeighbors(this.graph, current); 

            for(let neighbor of neighbors) {
                if(neighbor.state === "queued" || neighbor.state === "visited" || neighbor.type !== this.traverse) continue;
                
                this.graph[neighbor.row][neighbor.column].state = "queued";                
                
                queue.unshift(neighbor);

                if(this.stateChanged) await this.stateChanged(neighbor.row, neighbor.column, "queued");
            }
        }

        if(this.done) this.done(this.graph);
    };
}