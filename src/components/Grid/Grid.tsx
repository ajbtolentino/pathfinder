import { Button, ButtonGroup, FormControlLabel, FormGroup, Grid as MuiGrid, Radio, RadioGroup, TextField } from "@mui/material";
import { useEffect, useState } from "react";
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

    const { grid, startNode, clear, setNodeType } = useGrid(rows, columns);
    const [currentGrid, setCurrentGrid] = useState([...grid]);
    const [selectedType, setSelectedType] = useState<NodeType>("start");
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

    useEffect(() => {
         setCurrentGrid(grid);
    }, [grid]);

    const handleNodeHovered = (node: INode) => {
        if(isMouseDown) setNodeType(node, selectedType);
    };

    const renderColumns = (columns: INode[]) => {
        return columns.map((node, i) => <Node key={`node-${node.row}-${node.column}-${i}`}
                                            size={props.nodeSize} 
                                            onClick={() => setNodeType(node, selectedType)}
                                            hovered={handleNodeHovered}
                                            node={node}/>);  
    };

    const handleDfsStack = async () => {
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, {...startNode});
            alg.stateChanged = stateChanged;
            alg.done = done;

            await alg.stack(startNode);

            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleDfsRecursive = async () => {
        if(startNode){
            const alg: DepthFirst = new DepthFirst(grid, {...startNode});
            alg.stateChanged = stateChanged;
            alg.done = done;
            
            await alg.recursive(startNode);
            
            console.log(`Done in ${alg.totalIterations} iterations!`);
        }
    };

    const handleBreadthFirst = async () => {
        if(startNode){
            const alg: BreadthFirst = new BreadthFirst(grid);
            alg.stateChanged = stateChanged;
            alg.done = done;

            await alg.scan(startNode);

            console.log(`Done in ${alg.iteration} iterations!`);
        }
    };

    const done = (graph: INode[][]) => {
        const temp = graph.map(rowNodes => {
            return rowNodes.map(n => {
                return {...n};
            });
        });

        setCurrentGrid(temp);
    };

    const stateChanged = async (row: number, column: number, state: NodeState): Promise<any> => {
        return new Promise(resolve =>{
            setTimeout(() => {
                currentGrid[row][column] = {...currentGrid[row][column], state: state};

                const newGrid = currentGrid.map(rows => [...rows.map(n => {
                    return {...n};
                })]);

                setCurrentGrid([...newGrid]);
                resolve(true);
            }, delay);
        },);
    };

    return(
    <>
        <FormGroup row>
            <FormControlLabel label={"Rows"}control={<TextField type={"number"} value={rows} onChange={e => setRows(+e.target.value)}/>} />
            <FormControlLabel label={"Columns"}control={<TextField type={"number"} value={columns} onChange={e => setColumns(+e.target.value)}/>} />
        </FormGroup>
        <FormControlLabel label={"Delay (ms)"}control={<TextField type={"number"} value={delay} onChange={e => setDelay(+e.target.value)}/>} />
        <ButtonGroup>
            <Button onClick={() => handleDfsStack()}>Depth First - Stack</Button>
            <Button onClick={() => handleDfsRecursive()}>Depth First - Recursive</Button>
            <Button onClick={() => handleBreadthFirst()}>Breadth First</Button>
            <Button onClick={() => setCurrentGrid(grid)}>Reset</Button>
        </ButtonGroup>
        <RadioGroup row>
            <FormControlLabel value="start" control={<Radio />} label="Start" onClick={() => setSelectedType("start")} checked={selectedType == "start"}/>
            <FormControlLabel value="wall" control={<Radio />} label="Wall"  onClick={() => setSelectedType("wall")} checked={selectedType == "wall"}/>
            <FormControlLabel value="empty" control={<Radio />} label="Empty"  onClick={() => setSelectedType("empty")} checked={selectedType == "empty"}/>
            <Button variant="outlined" onClick={clear}>Clear</Button>
        </RadioGroup>
        <MuiGrid container overflow={"auto"} onMouseDown={() => setIsMouseDown(true)} onMouseUp={() => setIsMouseDown(false)}>
            {
                currentGrid.map((row, x) => 
                <MuiGrid key={`row-${x}`} container flexWrap={"nowrap"} justifyContent={"center"}>
                    {renderColumns(row)}
                </MuiGrid>)
            }
        </MuiGrid>
    </>
    );
};

export default Grid;