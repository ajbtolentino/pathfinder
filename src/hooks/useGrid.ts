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
                    state: "unvisited",
                    distance: Infinity
                });
            }

            tempGrid.push(currentRow);
        };

        setGrid([...tempGrid]);
    };

    const update = (graph: INode[][]) => {
        const temp = graph.map(rowNodes => {
            return rowNodes.map(node => {return{...node}});
        })

        setGrid(() => [...temp]);
    };

    const reset = () => {
        const tempGrid: INode[][] = grid.map(rowNodes => {
            return [...rowNodes.map(node => {
                const newNode: INode = {
                    ...node,
                    state: "unvisited"
                }

                return newNode;
            })];
        });

        setGrid(() => [...tempGrid]);
    };

    const setNodeType = (node: INode, type: NodeType) => {

        if(startNode && type === "start") 
            grid[startNode.row][startNode.column] = {...startNode, type: "empty"};

        if(endNode && type === "end")
            grid[endNode.row][endNode.column] = {...endNode, type: "empty"};

        if(type === "start") setStartNode(node);
        if(type === "end") setEndNode(node);

        grid[node.row][node.column] = {...node, type: type};

        setGrid(() => [...grid]);
    };

    return {
        grid,
        startNode,
        endNode,
        update,
        setNodeType,
        reset,
        initialize
    };
};