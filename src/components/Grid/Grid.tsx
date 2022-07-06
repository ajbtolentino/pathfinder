import { Button, ButtonGroup, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid as MuiGrid, Radio, RadioGroup, StepLabel, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";
import Node from "../Node/Node";
import { useGrid } from "../../hooks/useGrid";
import { DepthFirst } from "../../algorithms/depthFirst";
import { BreadthFirst } from "../../algorithms/breadthFirst";
import { Dijkstra } from "../../algorithms/dijkstra";

export type GridAlgorithm = "dfs-stack" | "dfs-recursive" | "bfs" | "dijkstra" | "count";
export type GridAction = "start" | "reset" | "clear" | "none";

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
}

export const Grid: React.FC<IPathfinderGridProps> = (props) => {
    const { grid, startNode, endNode, initialize, update, setNodeType } = useGrid(props.rows, props.columns);

    const [selectedType, setSelectedType] = useState<NodeType>("start");
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    const [current, setCurrent] = useState<INode>();
    const [path, setPath] = useState<INode[]>([]);
    const [visited, setVisited] = useState<INode[]>([]);
    const [queued, setQueued] = useState<INode[]>([]);

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
            default:
                console.log("Invalid algorithm!");
        }
    }

    const handleDfsStack = async () => {
        handleReset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
            
            if(props.animate){
                alg.pointed = nodePointed;
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.stacked = (r,c) => nodeStateChanged(r,c, "queued");
            }

            alg.completed = completed;

            await alg.runStack(startNode.row, startNode.column);

            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleDfsRecursive = async () => {
        handleReset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
            if(props.animate){
                alg.pointed = nodePointed;
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.stacked = (r,c) => nodeStateChanged(r,c, "queued");
            }

            alg.completed = completed;

            await alg.runRecursive(startNode.row, startNode.column);
            
            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleBreadthFirst = async () => {
        handleReset();
        if(startNode){
            const alg: BreadthFirst = new BreadthFirst(grid, props.traverse, props.boundaries, props.delay);

            if(props.animate)
            {
                alg.dequeued = nodePointed;
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
            }

            alg.completed = completed;

            await alg.scan(startNode);

            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleDijkstra = async () => {
        handleReset();
        if(startNode && endNode){
            const alg: Dijkstra = new Dijkstra(grid, props.traverse, props.boundaries, props.delay);

            if(props.animate)
            {
                alg.dequeued = nodePointed;
                alg.visited = (r,c) => nodeStateChanged(r,c, "visited");
                alg.queued = (r,c) => nodeStateChanged(r,c, "queued");
                alg.pathUpdated = pathUpdated;
            }

            alg.completed = completed;

            await alg.search(startNode);

            setPath([...alg.path]);

            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const pathUpdated = async (node: INode[]) : Promise<any> => {
        setPath([...node]);
    }

    const nodePointed = (row: number, column: number) => {
        setCurrent({...grid[row][column]});
    };

    const nodeStateChanged = (row: number, column: number, state: NodeState) => {
        switch(state) {
            case "queued":
                setQueued(prev => [...prev, {...grid[row][column]}]);
                break;
            case "visited":
                setVisited(prev => [...prev, {...grid[row][column]}]);
                break;
        }
    };

    const completed = (graph: INode[][]) => {
        update(graph);
        graph.forEach(rowNodes => {
            rowNodes.forEach(node => {
                setVisited(prev => [...prev, {...node}]);
            });
        });
        setCurrent(undefined);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const handleReset = () => {
        setCurrent(undefined);
        setPath(() => []);
        setVisited(() => []);
        setQueued(() => []);
    }

    const handleCountGroup = async () => {
        const dfs = new DepthFirst(grid, props.traverse, props.boundaries, props.delay);
        let count = 0;

        dfs.pointed = nodePointed;
        dfs.stacked = (r,c) => nodeStateChanged(r,c, "queued");
        dfs.visited = (r,c) => nodeStateChanged(r,c, "visited");
        dfs.completed = completed;
        
        for(let row = 0; row < grid.length; row++){
            for(let column = 0; column < grid[row].length; column++) {
                if(grid[row][column].type !== props.traverse || grid[row][column].state === "visited") continue;
                
                await dfs.runRecursive(row, column);

                if(dfs.totalIterations > 0) count++;
            }
        }

        console.log(`Total island: ${count}`);
    };

    const getIsNodePath = (node: INode) => {
        return path.filter(n => n.row === node.row && n.column === node.column).length > 0;
    }

    const getIsNodeVisited = (node: INode) => {
        return visited.filter(n => n.row === node.row && n.column === node.column).length > 0;
    }

    const getIsNodeQueued = (node: INode) => {
        return queued.filter(n => n.row === node.row && n.column === node.column).length > 0;
    }

    const getIsNodeCurrent = (node: INode) => {
        if(!current) return false;

        return node.row === current.row && node.column === current.column;
    }

    const handleSetNodeType = (node: INode) => {
        // setNodeType(node, selectedType);

        // if(startNode && selectedType === "end"){
        //     handleReset();
        //     const alg = new Dijkstra(grid, props.traverse, props.boundaries);
        //     alg.completed = completed;

        //     alg.search(startNode).then(() => setPath([...alg.path]));
        // }
    }

    const renderColumns = (columns: INode[]) => {
        return columns.map((node, i) => <Node key={`node-${node.row}-${node.column}-${i}`}
                                              node={node}
                                              size={props.nodeSize} 
                                              onClick={() => handleSetNodeType(node)}
                                              hovered={handleNodeHovered}
                                              isPath={getIsNodePath(node)}
                                              isQueued={getIsNodeQueued(node)}
                                              isVisited={getIsNodeVisited(node)}
                                              isCurrent={getIsNodeCurrent(node)}
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
            <FormControlLabel value="end" control={<Radio />} label="End"  onClick={() => setSelectedType("end")} checked={selectedType === "end"}/>
            </RadioGroup>
        </FormControl>
        <MuiGrid container overflow={"auto"} width={"auto"} onMouseDown={handleMouseDown} onMouseUp={() => setIsMouseDown(false)}>
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