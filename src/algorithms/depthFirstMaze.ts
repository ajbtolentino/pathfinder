import { wait } from "@testing-library/user-event/dist/utils";
import Grid from "../models/Grid";
import Node, { NodeState, NodeType } from "../models/Node";

export class DepthFirstMaze {
    grid: Grid;

    constructor(grid: Grid){
        this.grid = grid;
    };

    run = async (delay: number) => {
        this.grid.resetAllNodes();
        this.grid.updateAllNodes(NodeType.Wall);
        this.grid.updateNode(1,1, NodeType.Start);

        const startNode = this.grid.getStartNode();

        if(!startNode) return;

        const stack: Node[] = [startNode];

        while(stack.length) {
            const current = stack.pop();

            if(!current) continue;
            
            const neighbors = this.grid.getNeighbors(current, true, false, 2);
            const unvisitedNeighbors = neighbors.filter(_ => _.getState() === NodeState.Unvisited);

            if(unvisitedNeighbors.length){
                current.pushIn(stack);

                current.setType(NodeType.Empty);

                const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length);
                const chosenNeighbor = unvisitedNeighbors[randomIndex];
                
                if(chosenNeighbor) {
                    this.grid.connect(current, chosenNeighbor);

                    chosenNeighbor.pushIn(stack);
                }
            }

            if(delay) await wait(delay);
        }
        this.grid.resetAllNodes();
        this.grid.randomizeStartNode();
        this.grid.randomizeEndNode();
    };
} 