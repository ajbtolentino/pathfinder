import { Button, ButtonGroup, FormGroup, Grid as MuiGrid } from "@mui/material";
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
import { wait } from "@testing-library/user-event/dist/utils";
import { DepthFirstMaze } from "../../algorithms/depthFirstMaze";
import { clear } from "console";
import { NodeStart } from "../Node/NodeStart";
import { NodeEnd } from "../Node/NodeEnd";

export type GridAlgorithm = "dfs-maze" | "dfs-stack" | "dfs-recursive" | "bfs" | "dijkstra" | "astar" | "count";

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
    const { grid, startNode, endNode, updateGrid, initialize, setNodeType } = useGrid(props.rows, props.columns);
    const [delay, setDelay] = useState<number>(props.delay);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

    useEffect(() => {
        reset();
        setDelay(() => props.delay);
    }, [props]);

    const runAlgorithm = async () => {
        reset();
        setIsRunning(true);

        switch(props.algorithm) {
            case "bfs":
                await runBfs();
                break;
            case "count":
                await runCountGroup();
                break;
            case "dfs-recursive":
                await runDfsRecursive();
                break;
            case "dfs-stack":
                await runDfsStack();
                break;
            case "dijkstra":
                await runDijkstra();
                break;
            case "astar":
                await runAStar();
                break;
            case "dfs-maze":
                await runDfsMaze();
                break;
            default:
                console.log("Invalid algorithm!");
        }

        setIsRunning(false);
    };

    const handleClear = () => {
        reset();
        initialize();
    };

    const reset = () => {
        document.querySelectorAll(".node").forEach(node => {
            node.classList.remove("node-state-visited", "node-path", "node-state-queued", "node-state-stacked", "node-current");
        })
    };

    const runDfsStack = async () => {
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries);
            
            if(props.animate){
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
            }

            await alg.runStack(startNode.row, startNode.column);
        }
    };

    const runDfsRecursive = async () => {
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.diagonalSearch);
            if(props.animate){
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
            }

            await alg.runRecursive(startNode.row, startNode.column);
        }
    };

    const runBfs = async () => {
        if(startNode){
            const alg: BreadthFirst = new BreadthFirst(grid, props.traverse, props.boundaries, props.diagonalSearch);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
            }

            await alg.scan(startNode);
        }
    };

    const runDijkstra = async () => {
        if(startNode && endNode){
            const alg: Dijkstra = new Dijkstra(grid, props.traverse, props.boundaries, props.diagonalSearch);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                alg.dequeued = nodePointed;
            }

            await alg.search(startNode);

            await pathUpdated(alg.path);
        }
    };

    const runAStar = async () => {
        if(startNode && endNode){
            const alg: AStar = new AStar(grid, props.traverse, props.boundaries, props.diagonalSearch);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                alg.dequeued = nodePointed;
                // alg.pathUpdated = pathUpdated;
            }

            await alg.search(startNode, endNode);

            await pathUpdated(alg.path);
        }
    };

    const runDfsMaze = async () => {
        setIsRunning(true);
        reset();
        
        grid.forEach(rowNodes => {
            rowNodes.forEach(node => {
                const element = document.getElementById(`node-${node.row}-${node.column}`);

                if(element){
                    element.classList.remove("node-type-start");
                    element.classList.remove("node-type-end");
                    element.classList.remove("node-type-empty");
                    element.classList.add(`node-type-wall`);
                }
            });
        });

        const alg: DepthFirstMaze = new DepthFirstMaze(grid);

        alg.nodeUpdated = async(r, c, u) => {
            const element = document.getElementById(`node-${r}-${c}`);
            if(element){
                element.classList.remove("node-type-wall");
                element.classList.add(`node-type-${u}`);
            }

            await wait(props.delay);
        };

        const updated = await alg.run(startNode?.row ?? 0, startNode?.column ?? 0);

        updateGrid(updated);
        setIsRunning(false);
    }

    const pathUpdated = async (nodes: INode[]) : Promise<void> => {
        const ids = nodes.map(n => `node-${n.row}-${n.column}`);

        const collection =  document.getElementsByClassName("node-path");

        for (let i = 0; i < collection.length; i++) {
            const element = collection[i];

            if(element && !ids.includes(element.id)) element.classList.remove("node-path");
        }

        ids.forEach(id => {
            const element = document.getElementById(id);
            if(element && !element.classList.contains("node-path"))
                element.classList.add("node-path")
        });

        if(delay) await wait(delay);
    };

    const nodePointed = async (row: number, column: number) : Promise<void> => {
        const currentPointed = document.getElementsByClassName("node-current");

        if(currentPointed && currentPointed.length > 0) currentPointed.item(0)?.classList.remove("node-current");

        const newCurrent = document.getElementById(`node-${row}-${column}`);

        if(newCurrent) newCurrent.classList.add("node-current");

        if(delay) await wait(delay);
    };

    const nodeStateChanged = async (row: number, column: number, state: NodeState) : Promise<void> => {
        const element = document.getElementById(`node-${row}-${column}`);

        if(!element) return;

        switch(state) {
            case "queued":
                element.classList.remove("node-state-unvisited");
                element.classList.add("node-state-queued");
                break;
            case "visited":
                element.classList.remove("node-state-queued");
                element.classList.add("node-state-visited");
                break;
        }

        if(delay) await wait(delay);
    };

    const runCountGroup = async () => {
        const dfs = new DepthFirst(grid, props.traverse, props.boundaries);
        let count = 0;

        dfs.pointed = nodePointed;
        dfs.stacked = (r,c) => nodeStateChanged(r,c, "queued");
        dfs.visited = (r,c) => nodeStateChanged(r,c, "visited");
        
        for(let row = 0; row < grid.length; row++){
            for(let column = 0; column < grid[row].length; column++) {
                if(dfs.graph[row][column].type !== props.traverse || dfs.graph[row][column].state === "visited") continue;
                
                await dfs.runRecursive(row, column);

                if(dfs.totalIterations > 0) count++;
            }
        }

        if(props.done) props.done();
    };

    const onToggleEmpty = async (node: INode) => {
        reset();
        setNodeType(node, isShiftPressed ? "empty" : "wall");
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const onTypeDropped = (node: INode, type: NodeType) => {
        reset();
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
        <DndProvider backend={HTML5Backend}>
            <FormGroup>
                <ButtonGroup sx={{m: 1, justifyContent: "center"}}>
                    <Button disabled={isRunning} onClick={runAlgorithm}>Start</Button>
                    <Button disabled={isRunning} onClick={reset}>Reset</Button>
                    <Button disabled={isRunning} onClick={handleClear}>Clear</Button>
                </ButtonGroup>
            </FormGroup>
            <FormGroup>
                <ButtonGroup sx={{m: 1, justifyContent: "center"}}>
                    <Button disabled={isRunning} onClick={runDfsMaze}>Create Maze</Button>
                </ButtonGroup>
            </FormGroup>
            <FormGroup style={{display: "flex", flexDirection: "row", justifyContent: "start"}}>
                <NodeStart size={props.nodeSize}/>
                <NodeEnd size={props.nodeSize}/>
            </FormGroup>
            <MuiGrid tabIndex={0} container overflow={"visible"} width={"auto"} 
                        onKeyDown={(e) => setIsShiftPressed(e.key === "Shift")}
                        onKeyUp={() => setIsShiftPressed(false)}
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