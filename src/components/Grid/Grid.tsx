import { Button, ButtonGroup, FormControl, FormControlLabel, FormGroup, FormLabel, Grid as MuiGrid, Radio, RadioGroup } from "@mui/material";
import React, { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";
import Node from "../Node/Node";
import { useGrid } from "../../hooks/useGrid";
import { DepthFirst } from "../../algorithms/depthFirst";
import { BreadthFirst } from "../../algorithms/breadthFirst";
import { Dijkstra } from "../../algorithms/dijkstra";
import { AStar } from "../../algorithms/aStar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export type GridAlgorithm = "dfs-stack" | "dfs-recursive" | "bfs" | "dijkstra" | "astar" | "count";

export interface IPathfinderGridProps {
    columns: number;
    rows: number;
    nodeSize: number;
    delay: number;
    boundaries: boolean;
    diagonalSearch: boolean;
    animate: boolean;
    traverse: NodeType;
    algorithm: GridAlgorithm;
    done?: () => void;
}

export const Grid: React.FC<IPathfinderGridProps> = (props) => {
    const { grid, startNode, endNode, initialize, setNodeType } = useGrid(props.rows, props.columns);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

    const handleStart = () => {
        switch(props.algorithm) {
            case "bfs":
                handleBreadthFirst();
                break;
            case "count":
                handleCountGroup();
                break;
            case "dfs-recursive":
                handleDfsRecursive();
                break;
            case "dfs-stack":
                handleDfsStack();
                break;
            case "dijkstra":
                handleDijkstra();
                break;
            case "astar":
                handleAStar();
                break;
            default:
                console.log("Invalid algorithm!");
        }
    };

    const handleClear = () => {
        handleReset();
        initialize();
    };

    const handleReset = () => {
        document.querySelectorAll(".node").forEach(node => {
            node.classList.remove("node-state-visited", "node-path", "node-state-queued", "node-state-stacked", "node-current");
        })
    };

    const handleDfsStack = async () => {
        handleReset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
            
            if(props.animate){
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
            }

            await alg.runStack(startNode.row, startNode.column);
        }
    };

    const handleDfsRecursive = async () => {
        handleReset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
            if(props.animate){
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
            }

            await alg.runRecursive(startNode.row, startNode.column);
        }
    };

    const handleBreadthFirst = async () => {
        handleReset();
        if(startNode){
            const alg: BreadthFirst = new BreadthFirst(grid, props.traverse, props.boundaries, props.delay);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
            }

            await alg.scan(startNode);
        }
    };

    const handleDijkstra = async () => {
        handleReset();
        if(startNode && endNode){
            const alg: Dijkstra = new Dijkstra(grid, props.traverse, props.boundaries, props.diagonalSearch, props.delay);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                alg.dequeued = nodePointed;
                alg.pathUpdated = pathUpdated;
            }

            await alg.search(startNode);

            pathUpdated(alg.path);
        }
    };

    const handleAStar = async () => {
        handleReset();
        if(startNode && endNode){
            const alg: AStar = new AStar(grid, props.traverse, props.boundaries, props.diagonalSearch, props.delay);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                alg.dequeued = nodePointed;
                alg.pathUpdated = pathUpdated;
            }

            await alg.search(startNode, endNode);

            pathUpdated(alg.path);
        }
    };

    const pathUpdated = async (nodes: INode[]) : Promise<any> => {
        const ids = nodes.map(n => `node-${n.row}-${n.column}`);

        document.querySelectorAll(".node.node-path").forEach(item => {
            item.classList.add("node-state-visited");
            item.classList.remove("node-path");
        });

        document.querySelectorAll(".node.node-state-visited").forEach(item => {
            if(ids.includes(item.id) && !item.classList.contains("node-path")) {
                item.classList.remove("node-state-visited");
                item.classList.add("node-path");
            }
        });
    };

    const nodePointed = (row: number, column: number) => {
        document.querySelectorAll(".node").forEach(item => {
            item.classList.remove("node-current");   
        });

        document.getElementById(`node-${row}-${column}`)?.classList.add("node-current");
    };

    const nodeStateChanged = (row: number, column: number, state: NodeState) => {
        switch(state) {
            case "queued":
                document.getElementById(`node-${row}-${column}`)?.classList.add("node-state-queued");
                break;
            case "visited":
                document.getElementById(`node-${row}-${column}`)?.classList.add("node-state-visited");
                break;
        }
    };

    const handleCountGroup = async () => {
        const dfs = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
        let count = 0;

        dfs.pointed = nodePointed;
        dfs.stacked = (r,c) => nodeStateChanged(r,c, "queued");
        dfs.visited = (r,c) => nodeStateChanged(r,c, "visited");
        
        for(let row = 0; row < grid.length; row++){
            for(let column = 0; column < grid[row].length; column++) {
                if(grid[row][column].type !== props.traverse || grid[row][column].state === "visited") continue;
                
                await dfs.runRecursive(row, column);

                if(dfs.totalIterations > 0) count++;
            }
        }

        if(props.done) props.done();
    };

    const onToggleEmpty = async (node: INode) => {
        setNodeType(node, isShiftPressed ? "empty" : "wall");
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const onTypeDropped = (node: INode, type: NodeType) => {
        setNodeType(node, type);
        setIsMouseDown(false);
    };

    const renderColumns = (columns: INode[]) => {
        return columns.map((node, i) => <Node key={`node-${node.row}-${node.column}-${i}`}
                                              node={node}
                                              size={props.nodeSize} 
                                              isMouseDown={isMouseDown}
                                              onToggleEmpty={() => onToggleEmpty(node)}
                                              onTypeDropped={(type) => onTypeDropped(node, type)}
                                              />);  
    };

    return(
    <>
        <FormGroup>
            <ButtonGroup sx={{m: 1, justifyContent: "center"}}>
                <Button onClick={handleStart}>Start</Button>
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={handleClear}>Clear</Button>
            </ButtonGroup>
        </FormGroup>
        <DndProvider backend={HTML5Backend}>
            <MuiGrid tabIndex={0} container overflow={"visible"} width={"auto"} 
                     onKeyDown={(e) => setIsShiftPressed(e.key === "Shift")}
                     onKeyUp={(e) => setIsShiftPressed(false)}
                     onMouseDown={handleMouseDown} 
                     onMouseUp={() => setIsMouseDown(false)}>
                {
                    grid.map((row, x) => 
                    <MuiGrid key={`row-${x}`} container flexWrap={"nowrap"} justifyContent={"center"}>
                        {renderColumns(row)}
                    </MuiGrid>)
                }
            </MuiGrid>
        </DndProvider>
    </>
    );
};

export default Grid;