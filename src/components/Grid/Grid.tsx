import { Button, ButtonGroup, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid as MuiGrid, Radio, RadioGroup, StepLabel, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";
import Node from "../Node/Node";
import { useGrid } from "../../hooks/useGrid";
import { DepthFirst } from "../../algorithms/depthFirst";
import { BreadthFirst } from "../../algorithms/breadthFirst";
import { Dijkstra } from "../../algorithms/dijkstra";
import { AStar } from "../../algorithms/aStar";

export type GridAlgorithm = "dfs-stack" | "dfs-recursive" | "bfs" | "dijkstra" | "astar" | "count";
export type GridAction = "start" | "reset" | "clear" | "none" | "restart";

export interface IPathfinderGridProps {
    columns: number;
    rows: number;
    nodeSize: number;
    delay: number;
    boundaries: boolean;
    animate: boolean;
    traverse: NodeType;
    algorithm: GridAlgorithm;
    action?: GridAction;
    done?: () => void;
}

export const Grid: React.FC<IPathfinderGridProps> = (props) => {
    const { grid, startNode, endNode, initialize, update, setNodeType } = useGrid(props.rows, props.columns);
    const [selectedType, setSelectedType] = useState<NodeType>("start");
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const handleNodeHovered = (node: INode) => {
        if(isMouseDown) setNodeType(node, selectedType);
    };

    useEffect(() => {
        switch(props.action) {
            case "start":
                start();
                break;
            case "reset":
                handleReset();
                break;
            case "clear":
                handleReset();
                initialize();
                break;
        }
    }, [props.action]);

    const start = () => {
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
    }

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
            const alg: Dijkstra = new Dijkstra(grid, props.traverse, props.boundaries, props.delay);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                // alg.pathUpdated = pathUpdated;
            }

            await alg.search(startNode);

            pathUpdated(alg.path);
        }
    };

    const handleAStar = async () => {
        handleReset();
        if(startNode && endNode){
            const alg: AStar = new AStar(grid, props.traverse, props.boundaries, props.delay);

            if(props.animate)
            {
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
            }

            const endNode = await alg.search();

            console.log(endNode);
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

    const completed = (graph: INode[][]) => {
        update(graph);
        const tempVisited: INode[] = [];
        const tempQueued: INode[] = [];

        graph.forEach(rowNodes => {
            rowNodes.forEach(node => {
                if(node.state === "visited")
                    tempVisited.push({...node});
                if(node.state === "queued")
                    tempQueued.push({...node});
            });
        });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const handleReset = () => {
        document.querySelectorAll(".node").forEach(node => {
            node.classList.remove("node-state-visited", "node-path", "node-state-queued", "node-state-stacked");
        })
    }

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

    const handleSetNodeType = async (node: INode) => {
        setNodeType(node, selectedType);
    }

    const renderColumns = (columns: INode[]) => {
        return columns.map((node, i) => <Node key={`node-${node.row}-${node.column}-${i}`}
                                              node={node}
                                              size={props.nodeSize} 
                                              onClick={() => handleSetNodeType(node)}
                                              hovered={handleNodeHovered}
                                              />);  
    };

    return(
    <>
        <FormControl>
            <FormLabel>Draw</FormLabel>
            <RadioGroup row>
            <FormControlLabel value="start" control={<Radio />} label="Start" onClick={() => setSelectedType("start")} checked={selectedType === "start"}/>
            <FormControlLabel value="wall" control={<Radio />} label="Wall"  onClick={() => setSelectedType("wall")} checked={selectedType === "wall"}/>
            <FormControlLabel value="empty" control={<Radio />} label="Empty"  onClick={() => setSelectedType("empty")} checked={selectedType === "empty"}/>
            {
                (props.algorithm === "dijkstra" || props.algorithm === "astar") &&
                <FormControlLabel value="end" control={<Radio />} label="End"  onClick={() => setSelectedType("end")} checked={selectedType === "end"}/>
            }
            </RadioGroup>
        </FormControl>
        <MuiGrid container overflow={"visible"} width={"auto"} onMouseDown={handleMouseDown} onMouseUp={() => setIsMouseDown(false)}>
            {
                grid.map((row, x) => 
                <MuiGrid key={`row-${x}`} container flexWrap={"nowrap"} justifyContent={"center"}>
                    {renderColumns(row)}
                </MuiGrid>)
            }
        </MuiGrid>
    </>
    );
};

export default Grid;