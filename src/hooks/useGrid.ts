import { useEffect, useState } from "react";
import Grid from "../models/Grid";
import Node, { NodeType } from "../models/Node";
// import INode, { NodeType } from "../models/INode";

export const useGrid = () => {
    const [grid, setGrid] = useState<Grid>(new Grid(0, 0));

    const reset = () => {
        grid.resetAllNodes();
    };

    const create = (rows: number, columns: number) => {
        setGrid(new Grid(rows, columns));
    };

    const updateNode = (x: number, y: number, type: NodeType) => {
        grid.updateNode(x, y, type);
    };

    return {
        grid,
        create,
        updateNode,
        reset
    };
};