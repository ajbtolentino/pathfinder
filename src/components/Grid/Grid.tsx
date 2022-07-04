import { Button, ButtonGroup, FormControlLabel, FormGroup, FormLabel, Grid as MuiGrid, Radio, RadioGroup, StepLabel, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";
import Node from "../Node/Node";
import { useGrid } from "../../hooks/useGrid";
import { DepthFirst } from "../../algorithms/depthFirst";
import { BreadthFirst } from "../../algorithms/breadthFirst";

export interface IPathfinderGridProps {
    columns: number;
    rows: number;
    nodeSize: number;
    delay: number;
}

export const Grid: React.FC<IPathfinderGridProps> = (props) => {
    const [rows, setRows] = useState<number>(props.rows);
    const [columns, setColumns] = useState<number>(props.columns);
    const [delay, setDelay] = useState<number>(props.delay);
    const [traverse, setTraverse] = useState<NodeType>("path");

    const { grid, startNode, initialize, reset, setNodeType } = useGrid(rows, columns);
    const [currentGrid, setCurrentGrid] = useState([...grid]);
    const [selectedType, setSelectedType] = useState<NodeType>("start");
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    useEffect(() => {
         setCurrentGrid(grid);
    }, [grid]);

    const handleNodeHovered = (node: INode) => {
        if(isMouseDown) setNodeType(node, selectedType);
    };

    const handleDfsStack = async () => {
        reset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, traverse);
            alg.nodeStateChanged = nodeStateChanged;
            alg.completed = completed;

            await alg.stack(startNode);

            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleDfsRecursive = async () => {
        reset();
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, traverse);
            alg.nodeStateChanged = nodeStateChanged;
            alg.completed = completed;

            await alg.recursive(startNode);
            
            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleBreadthFirst = async () => {
        reset();
        if(startNode){
            const alg: BreadthFirst = new BreadthFirst(grid, traverse);
            alg.stateChanged = nodeStateChanged;
            alg.done = completed;

            await alg.scan(startNode);

            console.log(`Done in ${alg.iteration} iterations!`);
        }
    };

    const completed = (graph: INode[][]) => {
        const temp = graph.map(rowNodes => {
            return rowNodes.map(n => {
                return {...n};
            });
        });

        setCurrentGrid(temp);
    };

    const nodeStateChanged = async (row: number, column: number, state: NodeState): Promise<any> => {
        return new Promise(resolve =>{
            setTimeout(() => {
                currentGrid[row][column] = {...currentGrid[row][column], state: state};

                const newGrid = currentGrid.map(rows => [...rows.map(n => {
                    return {...n};
                })]);

                setCurrentGrid(() => [...newGrid]);
                resolve(true);
            }, delay);
        },);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if(e.button === 0) setIsMouseDown(true);
    };

    const handleFindWallGroup = async () => {
        const dfs = new DepthFirst(grid, "wall");
        let count = 0;

        // dfs.nodeStateChanged = nodeStateChanged;
        dfs.completed = completed;
        
        for(let row = 0; row < grid.length; row++){
            for(let column = 0; column < grid[row].length; column++) {
                
                if(grid[row][column].type !== "wall" || 
                    grid[row][column].state === "visited") continue;
                
                await dfs.stack(grid[row][column]);

                if(dfs.totalIterations > 0) count++;
            }
        }
        console.log(`Total island: ${count}`);
    };

    const renderColumns = (columns: INode[]) => {
        return columns.map((node, i) => <Node key={`node-${node.row}-${node.column}-${i}`}
                                              size={props.nodeSize} 
                                              onClick={() => setNodeType(node, selectedType)}
                                              hovered={handleNodeHovered}
                                              node={node}/>);  
    };

    return(
    <>
        <FormGroup>
            <FormControlLabel label="Algorithm" labelPlacement="start"
                control={
                    <ButtonGroup>
                        <Button onClick={handleDfsStack}>Depth First - Stack</Button>
                        <Button onClick={handleDfsRecursive}>Depth First - Recursive</Button>
                        <Button onClick={handleBreadthFirst}>Breadth First</Button> 
                        <Button onClick={handleFindWallGroup}>Find Wall Group</Button>
                    </ButtonGroup>
            } />
        </FormGroup>
        <FormGroup row>
            <FormControlLabel label="Draw" labelPlacement="start"
                control={
                    <ButtonGroup>
                        <FormControlLabel value="start" control={<Radio />} label="Start" onClick={() => setSelectedType("start")} checked={selectedType === "start"}/>
                        <FormControlLabel value="wall" control={<Radio />} label="Wall"  onClick={() => setSelectedType("wall")} checked={selectedType === "wall"}/>
                        <FormControlLabel value="path" control={<Radio />} label="Path"  onClick={() => setSelectedType("path")} checked={selectedType === "path"}/>
                    </ButtonGroup>
                }/>
        </FormGroup>
        <FormGroup row>
            <FormControlLabel label="Traverse" labelPlacement="start"
                control={
                    <FormGroup row>
                        <FormControlLabel value="path" control={<Radio />} label="Path"  onClick={() => setTraverse("path")} checked={traverse === "path"}/>
                        <FormControlLabel value="wall" control={<Radio />} label="Wall"  onClick={() => setTraverse("wall")} checked={traverse === "wall"}/>
                    </FormGroup>
                }/>
        </FormGroup>
        <MuiGrid container overflow={"auto"} onMouseDown={handleMouseDown} onMouseUp={() => setIsMouseDown(false)}>
            {
                currentGrid.map((row, x) => 
                <MuiGrid key={`row-${x}`} container flexWrap={"nowrap"} justifyContent={"center"}>
                    {renderColumns(row)}
                </MuiGrid>)
            }
        </MuiGrid>
        <FormGroup row style={{margin: 10}}>
            <FormGroup row>
                <FormControlLabel label={"Rows"}control={<TextField size="small" type={"number"} value={rows} onChange={e => setRows(+e.target.value)}/>} />
                <FormControlLabel label={"Columns"}control={<TextField size="small" type={"number"} value={columns} onChange={e => setColumns(+e.target.value)}/>} />
                <FormControlLabel label={"Delay (ms)"}control={<TextField size="small" type={"number"} value={delay} onChange={e => setDelay(+e.target.value)}/>} />
            </FormGroup>
            <ButtonGroup>
                <Button onClick={initialize}>Clear</Button>
                <Button onClick={reset}>Reset</Button>
            </ButtonGroup>
        </FormGroup>
    </>
    );
};

export default Grid;