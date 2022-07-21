import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import INode, { NodeState, NodeType } from "../../models/INode";
import { NodeEnd } from "./NodeEnd";
import { NodeStart } from "./NodeStart";

export interface INodeProps {
    node: INode;
    size: number;
    isMouseDown: boolean;
    onToggleEmpty: () => void;
    onTypeDropped: (type: NodeType) => void;
};

export const Node = React.memo((props: INodeProps) => {
    const [node, setNode] = useState<INode>({...props.node});

    useEffect(() => {
        setNode({...props.node});
    }, [props.node]);

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "node",
        drop: (item: {type: string}) => typeDropped(item.type),
        canDrop: () => props.node.type === "empty",
        collect: monitor => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop()
        }),
      }), [props]);

    const typeDropped = (type: string) => {
        props.onTypeDropped(type === "start" ? "start" : "end")
    };

    const onMouseEnter = () => {
        if(props.isMouseDown && (props.node.type === "empty" || props.node.type === "wall")) props.onToggleEmpty();
    };

    return (
        <div ref={drop} style={{
            backgroundColor: "white",
            position: "relative",
            outline: "thin solid hsl(50, 100%, 0%)"
          }}>
            <Grid item
                id={`node-${node.row}-${node.column}`}
                className={`node node-type-${node.type}`}
                height={props.size}     
                width={props.size}          
                onClick={() => props.onToggleEmpty()} 
                onMouseEnter={onMouseEnter} >
                {
                    node.type === "start" && <NodeStart size={props.size}/>
                }
                {
                    node.type === "end" && <NodeEnd size={props.size} />
                }
                {!isOver && canDrop && (
                    <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        zIndex: 1,
                        opacity: 0.5,
                        backgroundColor: 'yellow',
                    }}
                    />
                )}
                {isOver && canDrop && (
                    <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        zIndex: 1,
                        opacity: 0.5,
                        backgroundColor: 'green',
                    }}
                    />
                )}
                {isOver && !canDrop && (
                    <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        zIndex: 1,
                        opacity: 0.5,
                        backgroundColor: 'red',
                    }}
                    />
                )}
            </Grid>
        </div>
    )
});

export default Node;