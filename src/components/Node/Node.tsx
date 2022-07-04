import { Grid, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";

export interface INodeProps {
    node: INode;
    size: number;
    onClick: () => void;
    hovered?: (node: INode) => void;
}

export const Node: React.FC<INodeProps> = (props) => {
    const [node, setNode] = useState<INode>({...props.node});

    useEffect(() => {
        setNode({...props.node});
    }, [props.node]);

    const getStateStyle = () => {
        return `node-state-${node.state}`;
    };

    const getTypeStyle = () => {
        return `node-type-${node.type}`;
    };

    const getClassName = () => {
        return `node node-state-transition ${getStateStyle()} ${getTypeStyle()}`;
    };

    const handleMouseEnter = () => {
        if(props.hovered) props.hovered(props.node);
    };

    return (
        <Grid item width={props.size} height={props.size} 
              onClick={() => props.onClick()} 
              onMouseEnter={handleMouseEnter} 
              className={getClassName()}>
        </Grid>
    )
};

export default Node;