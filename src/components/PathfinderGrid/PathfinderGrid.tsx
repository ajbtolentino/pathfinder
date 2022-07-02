import { Grid } from "@mui/material";
import Node from "../Node/Node";

export interface IPathfinderGrid {
    rows: number;
    columns: number;
    nodeSize: number;
}

export const PathfinderGrid: React.FC<IPathfinderGrid> = (props) => {
    return(
        <Grid container>
            {
                Array.apply(null, Array(props.rows)).map((tx, x) => 
                    <Grid key={x} container flexWrap={"nowrap"} justifyContent={"center"}>
                    {
                        Array.apply(null, Array(props.columns)).map((ty, y) => 
                            <Node key={y} x={x} y={y} size={props.nodeSize} />)    
                    }
                    </Grid>
                )
            }
        </Grid>
    );
};

export default PathfinderGrid;