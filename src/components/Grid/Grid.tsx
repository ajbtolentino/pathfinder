import { Box, FormControlLabel, Grid as MuiGrid, Radio, RadioGroup } from "@mui/material";
import { useEffect, useState } from "react";
import ITable from "../../models/ITable";
import INode, { NodeType } from "../../models/INode";
import Node from "../Node/Node";
import { useGrid } from "../../hooks/useGrid";

export interface IPathfinderGridProps {
    columns: number;
    rows: number;
    nodeSize: number;
}

export const Grid: React.FC<IPathfinderGridProps> = (props) => {
    const { table, setNodeType } = useGrid(props.rows, props.columns);
    const [grid, setGrid] = useState(table?.grid);
    const [selectedType, setSelectedType] = useState<NodeType>("start");

    useEffect(() => {
        if(table?.grid) setGrid([...table.grid]);
    }, [table?.grid]);

    const renderRows = (rows: INode[][]) => {
        return rows.map((row, x) => 
            <MuiGrid key={x} container flexWrap={"nowrap"} justifyContent={"center"}>
                {renderColumns(row)}
            </MuiGrid>
        );
    };

    const renderColumns = (columns: INode[]) => {
        return columns.map((node) => <Node key={node.y} 
                                            size={props.nodeSize} 
                                            onClick={() => setNodeType(node, selectedType)}
                                            node={node}/>);  
    };

    return(
    <>
        <RadioGroup row>
            <FormControlLabel value="start" control={<Radio />} label="Start" onClick={() => setSelectedType("start")} />
            <FormControlLabel value="end" control={<Radio />} label="End"  onClick={() => setSelectedType("end")}/>
            <FormControlLabel value="empty" control={<Radio />} label="Empty"  onClick={() => setSelectedType("empty")}/>
        </RadioGroup>
        <MuiGrid container>
            {grid && renderRows(grid)}
        </MuiGrid>
    </>
    );
};

export default Grid;