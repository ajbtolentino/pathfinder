import React from "react";
import Grid from "../models/Grid";
import { NodeType } from "../models/Node";

export const useGrid = () => {
    const [grid, setGrid] = React.useState<Grid>(new Grid(0, 0));

    const reset = () => {
        grid.resetAllNodes();
    };

    const create = (rows: number, columns: number) => {
        if(rows && columns) setGrid(new Grid(rows, columns));
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