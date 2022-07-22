import { Button, ButtonGroup, FormGroup, Grid as MuiGrid } from "@mui/material";
import React, { useEffect, useState, memo } from "react";
import {NodeComponent as NodeComponent} from "../Node/NodeComponent";
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
import Node, { NodeState, NodeType } from "../../models/Node";
import Grid from "../../models/Grid";

export type GridAlgorithm = "dfs-maze" | "dfs-stack" | "dfs-recursive" | "bfs" | "dijkstra" | "astar" | "count";

export interface IPathfinderGridProps {
    grid: Grid;
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
    reset?: () => void;
}

export const GridComponent = memo((props: IPathfinderGridProps) => {
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

    useEffect(() => {
        console.log("grid rerendered")
    });

    const runAlgorithm = async () => {
        // reset();
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
        if(props.reset) props.reset();
        // initialize();
    };

    const runDfsStack = async () => {
        // if(startNode){
        //     const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries);
            
        //     if(props.animate){
        //         alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
        //     }

        //     await alg.runStack(startNode.row, startNode.column);
        // }
    };

    const runDfsRecursive = async () => {
        // if(startNode){
        //     const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.diagonalSearch);
        //     if(props.animate){
        //         alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
        //     }

        //     await alg.runRecursive(startNode.row, startNode.column);
        // }
    };

    const runBfs = async () => {
        const alg: BreadthFirst = new BreadthFirst(props.grid, props.traverse, props.boundaries, props.diagonalSearch);

        await alg.scan(props.delay);
    };

    const runDijkstra = async () => {
        //     const alg: Dijkstra = new Dijkstra(grid, props.traverse, props.boundaries, props.diagonalSearch);

        //     await alg.search(startNode);
    };

    const runAStar = async () => {
        const alg: AStar = new AStar(props.grid, props.traverse, props.boundaries, props.diagonalSearch);

        await alg.search(props.delay);

        pathUpdated(alg.path);
    };

    const runDfsMaze = async () => {
        setIsRunning(true);

        const alg: DepthFirstMaze = new DepthFirstMaze(props.grid);

        await alg.run(props.delay);

        setIsRunning(false);
    }

    const runCountGroup = async () => {
        // const dfs = new DepthFirst(grid, props.traverse, props.boundaries);
        // let count = 0;

        // for(let row = 0; row < grid.length; row++){
        //     for(let column = 0; column < grid[row].length; column++) {
        //         if(dfs.graph[row][column].type !== props.traverse || dfs.graph[row][column].state === "visited") continue;
                
        //         await dfs.runRecursive(row, column);

        //         if(dfs.totalIterations > 0) count++;
        //     }
        // }

        // if(props.done) props.done();
    };

    const pathUpdated = (nodes: Node[]) : void => {
        const ids = nodes.map(n => `node-${n.x}-${n.y}`);

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
    };

    const onToggleEmpty = async (node: Node) => {
        props.grid.updateNode(node.x, node.y, isShiftPressed ? NodeType.Empty : NodeType.Wall);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const onTypeDropped = (node: Node, type: NodeType) => {
        props.grid.updateNode(node.x, node.y, type);
        setIsMouseDown(false);
    };

    const renderNode = (node: Node) => {
        if(!node) return;

        return <NodeComponent key={`node-${node.x}-${node.y}`}
                node={node}
                size={props.nodeSize} 
                isMouseDown={isMouseDown}
                onToggleEmpty={() => onToggleEmpty(node)}
                onTypeDropped={(type) => onTypeDropped(node, type)}
        />
    };

    return(
    <>
        <DndProvider backend={HTML5Backend}>
            <FormGroup>
                <ButtonGroup sx={{m: 1, justifyContent: "center"}}>
                    <Button disabled={isRunning} onClick={runAlgorithm}>Start</Button>
                    <Button disabled={isRunning} onClick={() => props.grid.reset()}>Reset</Button>
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
                Array.from(Array(props.grid.columns).keys()).map(y =>
                    <MuiGrid key={`row-${y}`} container flexWrap={"nowrap"} justifyContent={"center"}>
                        {
                            Array.from(Array(props.grid.columns).keys()).map(x => renderNode(props.grid.nodes[x][y]))
                        }
                    </MuiGrid>)
            }
            </MuiGrid>
        </DndProvider>
    </>
    );
});

export default GridComponent;