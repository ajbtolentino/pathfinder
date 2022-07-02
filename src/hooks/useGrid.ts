import { useEffect, useState } from "react";
import INode, { NodeType } from "../models/INode";
import ITable from "../models/ITable"

export const useGrid = (rows: number, columns: number) => {
    const [table, setTable] = useState<ITable>();
    const [startNode, setStartNode] = useState<INode>();

    useEffect(() => {
        const tempGrid: INode[][] = [];

        for(let x = 0; x < rows; x++){
            const currentRow: INode[] = [];

            for(let y = 0; y < columns; y++){
                currentRow.push({
                    x: x,
                    y: y,
                    type: "empty"
                });
            }

            tempGrid.push(currentRow);
        };

        setTable({
            columns: columns,
            rows: rows,
            grid: [...tempGrid]
        });
    }, []);

    const setNodeType = (node: INode, type: NodeType) => {
        const tempGrid = table!.grid; 

        if(type === "start") { 
            setStartNode(node);

            if(startNode && startNode.type === "start") 
                tempGrid[startNode.x][startNode.y] = {...startNode, type: "empty"};
        }

        tempGrid[node.x][node.y] = {...node, type: type};

        if(table) setTable({...table, grid: tempGrid});
    };

    return {
        table,
        setNodeType
    };
};