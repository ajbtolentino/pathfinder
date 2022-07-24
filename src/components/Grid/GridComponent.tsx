import { Button, ButtonGroup, FormGroup, Grid as MuiGrid } from "@mui/material";
import React from "react";
import NodeComponent from "../Node/NodeComponent";
import { DepthFirst } from "../../algorithms/depthFirst";
import { BreadthFirst } from "../../algorithms/breadthFirst";
import { Dijkstra } from "../../algorithms/dijkstra";
import { AStar } from "../../algorithms/aStar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DepthFirstMaze } from "../../algorithms/depthFirstMaze";
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

const GridComponent: React.FC<IPathfinderGridProps> = (props: IPathfinderGridProps) => {
    const [delay, setDelay] = React.useState<number>(props.delay);
    const [isRunning, setIsRunning] = React.useState<boolean>(false);
    const [isMouseDown, setIsMouseDown] = React.useState<boolean>(false);
    const [isShiftPressed, setIsShiftPressed] = React.useState<boolean>(false);

    React.useEffect(() => {
        setDelay(props.delay);
    }, [props.delay]);

    const runAlgorithm = async () => {
        props.grid.resetAllNodes();

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
    };

    const runDfsStack = async () => {
        const alg: DepthFirst = new DepthFirst(props.grid, props.traverse, props.boundaries);

        await alg.runStack(delay);
    };

    const runDfsRecursive = async () => {
        const alg: DepthFirst = new DepthFirst(props.grid, props.traverse, props.boundaries);

        await alg.runRecursive(delay);
    };

    const runBfs = async () => {
        const alg: BreadthFirst = new BreadthFirst(props.grid, props.traverse, props.boundaries, props.diagonalSearch);

        await alg.scan(delay);
    };

    const runDijkstra = async () => {
        const alg: Dijkstra = new Dijkstra(props.grid, props.traverse, props.boundaries, props.diagonalSearch);

        await alg.search(delay);

        drawPath(alg.path);
    };

    const runAStar = async () => {
        const alg: AStar = new AStar(props.grid, props.traverse, props.boundaries, props.diagonalSearch);

        await alg.search(delay);

        drawPath(alg.path);
    };

    const runDfsMaze = async () => {
        setIsRunning(true);

        const alg: DepthFirstMaze = new DepthFirstMaze(props.grid);

        await alg.run(delay);

        setIsRunning(false);
    }

    const runCountGroup = async () => {
        const dfs = new DepthFirst(props.grid, props.traverse, props.boundaries);
        let count = 0;

        for(let row = 0; row < props.grid.rows; row++){
            for(let column = 0; column < props.grid.columns; column++) {
                const node = props.grid.nodes[column][row];
                
                if(!node) continue;

                if(node.getType() !== props.traverse || node.getState() === NodeState.Visited) continue;
                
                await dfs.runRecursive(delay, node);

                if(dfs.totalIterations > 0) count++;
            }
        }

        console.log(count);

        // if(props.done) props.done();
    };

    const drawPath = (nodes: Node[]) : void => {
        const ids = nodes.map(n => `node-${n.x}-${n.y}`);

        document.querySelectorAll(".node-path").forEach(element => {
            if(!ids.includes(element.id)) {
                element.classList.remove("node-path");
            }
        });

        ids.forEach((id, i) => {
            const element = document.getElementById(id);
            if(element && !element.classList.contains("node-path")){
                element.classList.add("node-path");
                element.style.setProperty("--index", (ids.length-i).toString());
            }
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
                    <Button disabled={isRunning} onClick={() => props.grid.resetAllNodes()}>Reset</Button>
                    <Button disabled={isRunning} onClick={handleClear}>Clear</Button>
                </ButtonGroup>
            </FormGroup>
            <FormGroup>
                <ButtonGroup sx={{m: 1, justifyContent: "center"}}>
                    <Button disabled={isRunning} onClick={runDfsMaze}>Create Maze</Button>
                </ButtonGroup>
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
};

export default GridComponent;