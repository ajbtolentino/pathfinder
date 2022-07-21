import { useEffect, useState } from "react";
import INode, { NodeType } from "../models/INode";

export const useGrid = (rows: number, columns: number) => {
    const [grid, setGrid] = useState<INode[][]>([]);
    const [startNode, setStartNode] = useState<INode>();
    const [endNode, setEndNode] = useState<INode>();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        initialize();
    }, [rows, columns]);

    const initialize = () => {
        const tempGrid: INode[][] = [];

        for(let x = 0; x < rows; x++){
            const currentRow: INode[] = [];

            for(let y = 0; y < columns; y++){
                const node: INode = {
                    row: x,
                    column: y,
                    type: "empty",
                    state: "unvisited",
                    fScore: Infinity,
                    gScore: Infinity,
                    hScore: Infinity,
                    distance: Infinity
                };

                currentRow.push(node);
            }

            tempGrid.push(currentRow);
        };

        if(rows > 1 && columns > 1)
        {
            tempGrid[0][0].type = "start";
            tempGrid[rows - 1][columns - 1].type = "end";
            setStartNode(tempGrid[0][0]);
            setEndNode(tempGrid[rows - 1][columns - 1]);
            setGrid(tempGrid);
        }
    };

    const setNodeType = (node: INode, type: NodeType) => {
        grid[node.row][node.column] = {...node, type: type};

        if(type === "start" && startNode){
            if(grid[startNode.row][startNode.column].type === "start") 
                grid[startNode.row][startNode.column] = {...startNode, type: "empty"};
            setStartNode({...node});
        }

        if(type === "end" && endNode){
            if(grid[endNode.row][endNode.column].type === "end") 
                grid[endNode.row][endNode.column] = {...endNode, type: "empty"};
            setEndNode({...node});
        }

        setGrid(() => [...grid]);
    };

    const updateGrid = (newGrid: INode[][]) => {
        const temp = newGrid.map(rowNodes => {
            return rowNodes.map((node: INode) => {
                return {...node};
            });
        });

        setGrid(() => [...temp]);
    };

    return {
        grid,
        startNode,
        endNode,
        updateGrid,
        setNodeType,
        initialize
    };
};