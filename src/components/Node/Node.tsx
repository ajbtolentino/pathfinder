import { Grid, Paper } from "@mui/material";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import INode, { NodeState, NodeType } from "../../models/INode";

export interface INodeProps {
    node: INode;
    size: number;
    isCurrent: boolean;
    isPath: boolean;
    isQueued: boolean;
    isVisited: boolean;
    onClick: () => void;
    hovered?: (node: INode) => void;
}

export const Node = React.memo((props: INodeProps) => {
    const [node, setNode] = useState<INode>({...props.node});
    const [isCurrent, setIsCurrent] = useState<boolean>(props.isCurrent);

    useEffect(() => {
        setNode({...props.node});
        setIsCurrent(props.isCurrent);
    }, [props.node, props.isCurrent]);

    const getPointedStyle = () => {
        if(isCurrent) return "node-current";

        return ""; 
    };

    const getQueuedStyle = () => {
        if(props.isQueued) return "node-state-queued node-state-stacked";

        return "";
    };

    const getStateStyle = () => {
        return `node-state-${props.isVisited ? "visited" : "unvisited"}`;
    };

    const getTypeStyle = () => {
        if(props.isPath && (node.type === "wall" || node.type === "empty")) return "node-path";

        return `node-type-${node.type}`;
    };

    const getClassName = () => {

        return `node node-state-transition ${getStateStyle()} ${getTypeStyle()} ${getPointedStyle()} ${getQueuedStyle()}`;
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
});

export default Node;