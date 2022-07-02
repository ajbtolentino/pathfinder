import { Grid, Paper } from "@mui/material";

export interface INode {
    x: number;
    y: number;
}

export interface INodeProps extends INode {
    size: number;
}

export const Node: React.FC<INodeProps> = (props) => {
    return (
        <Grid item>
            <div style={{width: props.size, height: props.size, border: "2px solid black", margin: 1}}>
            </div>
        </Grid>
    )
};

export default Node;