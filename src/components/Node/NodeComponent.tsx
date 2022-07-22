import { Grid } from "@mui/material";
import React, { memo } from "react";
import { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import Node, { NodeState, NodeType } from "../../models/Node";
import { NodeEnd } from "./NodeEnd";
import { NodeStart } from "./NodeStart";

export interface INodeProps {
    node: Node;
    size: number;
    isMouseDown: boolean;
    onToggleEmpty: () => void;
    onTypeDropped: (type: NodeType) => void;
};

export const NodeComponent = memo((props: INodeProps) => {
    const [currentState, setCurrentState] = useState<NodeState>(props.node.getState());
    const [currentType, setCurrentType] = useState<NodeType>(props.node.getType())

    useEffect(() => {
        console.log("node initialized");
    });

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "node",
        drop: (item: {type: NodeType}) => props.onTypeDropped(item.type),
        canDrop: () => currentType === NodeType.Empty,
        collect: monitor => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop()
        }),
      }), [props]);

    props.node.stateUpdated = (state: NodeState) => {
        setCurrentState(state);
    };

    props.node.typeUpdated = (type: NodeType) => {
        setCurrentType(type);
    };

    useEffect(() => {
        setCurrentState(props.node.getState());
        setCurrentType(props.node.getType());
    }, [props.node]);

    const onMouseEnter = () => {
        if(props.isMouseDown && (currentType === NodeType.Empty || currentType === NodeType.Wall)) props.onToggleEmpty();
    };

    const getNodeStateClass = () => {
        return `node-state-${currentState}`;
    }

    const getNodeTypeClass = () => {
        return `node-type-${currentType}`;
    }

    return (
        <div ref={drop} style={{
            backgroundColor: "white",
            position: "relative",
            outline: "thin solid hsl(50, 100%, 0%)"
          }}>
            <Grid item
                id={`node-${props.node.x}-${props.node.y}`}
                className={`node ${getNodeTypeClass()} ${getNodeStateClass()}`}
                height={props.size}     
                width={props.size}          
                onClick={() => props.onToggleEmpty()} 
                onMouseEnter={onMouseEnter} >
                {
                    currentType === NodeType.Start && <NodeStart size={props.size}/>
                }
                {
                    currentType === NodeType.Goal && <NodeEnd size={props.size} />
                }
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

export default NodeComponent;