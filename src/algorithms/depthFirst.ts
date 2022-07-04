import NeighborHelper from "../helpers/NeighborHelper";
import INode, { NodeState, NodeType } from "../models/INode";

export class DepthFirst {
    traverse: NodeType;
    graph: INode[][];
    totalIterations: number;
    nodeStateChanged?: (row: number, column: number, state: NodeState) => Promise<any>;
    completed?: (graph: INode[][]) => void;

    constructor(graph: INode[][], traverse: NodeType){
        this.traverse = traverse;
        this.totalIterations = 0;
        this.graph = [...graph.map(rowNodes => {
            return [...rowNodes.map(node => {
                return {...node};
            })];
        })];
    };
    
    stack = async (startNode: INode) => {
        this.totalIterations = 0;

        const stack: INode[] = [startNode];

        while(stack.length > 0) {
            const current = stack.shift();

            if(!current) continue;

            await this.movePointer(current);

            if(await this.isVisited(current)) continue;

            this.updateNodeState(current, "visited");

            const neighbors = NeighborHelper.getNeighbors(this.graph, current); 

            for(let neighbor of neighbors) {
                if(await this.isVisited(neighbor) || neighbor.type !== this.traverse) continue;
                
                stack.unshift(neighbor);

                await this.queued(neighbor);
            }

            this.totalIterations++;
        }

        if(this.completed) this.completed(this.graph);
    };

    recursive = async (node: INode) => {
        if(!node) return;
        
        await this.movePointer(node);

        if(await this.isVisited(node)) return;

        this.updateNodeState(node, "visited");

        const neighbors = NeighborHelper.getNeighbors(this.graph, node); 

        for(let neighbor of neighbors) {
            const isVisited = await this.isVisited(neighbor);

            if(isVisited || neighbor.type !== this.traverse) continue;

            await this.recursive(neighbor);
        }

        this.totalIterations++;
    };

    movePointer = async (node: INode) => {
        const tempState = node.state;
        if(this.nodeStateChanged) await this.nodeStateChanged(node.row, node.column, "pointed");

        if(node.state === "visited"){
            if(this.nodeStateChanged) await this.nodeStateChanged(node.row, node.column, "visited");
        }
        else {
            if(this.nodeStateChanged) await this.nodeStateChanged(node.row, node.column, tempState);
        }
    };

    updateNodeState = async (node: INode, state: NodeState) => {
        this.graph[node.row][node.column].state = state;

        if(this.nodeStateChanged) await this.nodeStateChanged(node.row, node.column, state);
    }

    queued = async (node: INode) => {
        if(this.nodeStateChanged) await this.nodeStateChanged(node.row, node.column, "queued");
    }

    isVisited = async (node: INode): Promise<boolean> => {
        if(this.graph[node.row][node.column].state === "visited") return true;

        return false;
    }
} 