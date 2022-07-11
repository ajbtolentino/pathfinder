import { Grid, Paper } from "@mui/material";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";

export interface INodeProps {
    node: INode;
    size: number;
    onClick: () => void;
    hovered?: (node: INode) => void;
}

export const Node = React.memo((props: INodeProps) => {
    const [node, setNode] = useState<INode>({...props.node});

    useEffect(() => {
        setNode({...props.node});
    }, [props.node]);


    const getTypeStyle = () => {
        return `node-type-${node.type}`;
    };

    const getClassName = () => {
        return `node node-state-transition ${getTypeStyle()}`;
    };

    const handleMouseEnter = () => {
        if(props.hovered) props.hovered(props.node);
    };

    return (
        <Grid id={`node-${node.row}-${node.column}`}
              item width={props.size} height={props.size} 
              onClick={() => props.onClick()} 
              onMouseEnter={handleMouseEnter} 
              className={getClassName()}>
        </Grid>
    )
});

export default Node;