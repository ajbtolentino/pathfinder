export type NodeType = "start" | "end" | "empty" | "path"

export default interface INode {
    x: number;
    y: number;
    type: NodeType;
};