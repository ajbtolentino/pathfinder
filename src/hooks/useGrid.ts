import { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../models/INode";

export const useGrid = (rows: number, columns: number) => {
    const [grid, setGrid] = useState<INode[][]>([]);
    const [startNode, setStartNode] = useState<INode>();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        initialize();
    }, [rows,columns]);

    const initialize = () => {
        const tempGrid: INode[][] = [];

        for(let x = 0; x < rows; x++){
            const currentRow: INode[] = [];

            for(let y = 0; y < columns; y++){
                currentRow.push({
                    row: x,
                    column: y,
                    type: "empty",
                    state: "unvisited"
                });
            }

            tempGrid.push(currentRow);
        };

        setGrid([...tempGrid]);
    };

    const setNodeType = (node: INode, type: NodeType) => {
        const tempGrid = [...grid]; 

        if(startNode && type === "start") 
            tempGrid[startNode.row][startNode.column] = {...startNode, type: "empty"};

        if(type === "start") setStartNode(node);

        tempGrid[node.row][node.column] = {...node, type: type};

        setGrid(() => [...tempGrid]);
    };

    return {
        grid,
        startNode,
        setNodeType,
        clear: initialize
    };
};