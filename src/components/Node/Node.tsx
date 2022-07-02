import { Grid, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import INode, { NodeType } from "../../models/INode";

export interface INodeProps {
    node: INode;
    size: number;
    onClick: () => void;
}

export const Node: React.FC<INodeProps> = (props) => {
    const [type, setType] = useState<NodeType>(props.node.type);

    useEffect(() => {
        setType(props.node.type);
    }, [props.node]);

    const getStyle = () => {
        let bgColor = "";

        if(type === "end") bgColor = "red";
        if(type === "start") bgColor = "green";

        return {
            width: props.size, 
            height: props.size, 
            border: "2px solid black", 
            margin: 1, 
            backgroundColor: bgColor
        };
    };

    return (
        <Grid item onClick={() => props.onClick()}>
            <div style={getStyle()}>
            </div>
        </Grid>
    )
};

export default Node;