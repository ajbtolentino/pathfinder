export type NodeType = "start" | "wall" | "empty" | "end";
export type NodeState = "visited" | "unvisited" | "queued";

export default interface INode {
    row: number;
    column: number;
    type: NodeType;
    state: NodeState;
    distance: number;
    previous?: INode;
};