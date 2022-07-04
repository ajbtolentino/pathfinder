export type NodeType = "start" | "wall" | "path"
export type NodeState = "visited" | "unvisited" | "pointed" | "queued";

export default interface INode {
    row: number;
    column: number;
    type: NodeType;
    state: NodeState;
};