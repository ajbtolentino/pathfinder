export type NodeType = "start" | "wall" | "empty" | "end";
export type NodeState = "visited" | "unvisited" | "queued";

export default interface INode {
    row: number;
    column: number;
    type: NodeType;
    state: NodeState;
    //Dijkstra Score
    distance: number;
    //A* Score
    fScore: number; // Total Cost
    gScore: number; // Distance between current node and start node
    hScore: number; // Heuristic: Distance from current node  to the end node
    //Path
    previous?: INode;
};