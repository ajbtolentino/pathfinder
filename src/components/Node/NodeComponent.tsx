import { Grid } from "@mui/material";
import React, { memo } from "react";
import { useDrop } from "react-dnd";
import Node, { NodeState, NodeType } from "../../models/Node";
import { NodeEnd } from "./NodeEnd";
import { NodeStart } from "./NodeStart";

export interface INodeProps {
    node: Node;
    size: number;
    isMouseDown: boolean;
    delay: number;
    onToggleEmpty: () => void;
    onTypeDropped: (type: NodeType) => void;
};

const NodeComponent: React.FC<INodeProps> = (props: INodeProps) => {
    const [currentState, setCurrentState] = React.useState<NodeState>(props.node.getState());
    const [currentType, setCurrentType] = React.useState<NodeType>(NodeType.Empty);

    React.useEffect(() => {
        setCurrentState(props.node.getState());
        setCurrentType(props.node.getType());
        console.log(props.node.previous);
    }, [props.node]);

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: "node",
        drop: (item: {type: NodeType}) => props.onTypeDropped(item.type),
        canDrop: () => currentType === NodeType.Empty,
        collect: monitor => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop()
        }),
      }), [currentType]);

    props.node.stateUpdated = (state: NodeState) => {
        setCurrentState(state);
    };

    props.node.typeUpdated = (type: NodeType) => {
        setCurrentType(type);
    };

    const onMouseEnter = () => {
        if(props.isMouseDown && (currentType === NodeType.Empty || currentType === NodeType.Wall)) 
            props.onToggleEmpty();
    };

    const getNodeStateClass = () => {
        return `node-state-${currentState}`;
    };

    const getNodeTypeClass = () => {
        return `node-type-${currentType}`;
    };

    const renderOverlay = () => {
        if(!isOver) return;

        const backgroundColor = canDrop ? "green" : "red";

        return (
            <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    opacity: 0.5,
                    backgroundColor: backgroundColor,
                }}
            />
        );
    };

    return (
        <div ref={drop} style={{
            position: "relative"
          }}>
            <Grid item
                id={`node-${props.node.x}-${props.node.y}`}
                className={`node ${getNodeTypeClass()} ${getNodeStateClass()}`}
                height={props.size}     
                width={props.size}          
                onClick={() => props.onToggleEmpty()} 
                style={{"--animation-duration": props.delay} as React.CSSProperties}
                onMouseEnter={onMouseEnter} >
                {
                    currentType === NodeType.Start && <NodeStart size={props.size}/>
                }
                {
                    currentType === NodeType.Goal && <NodeEnd size={props.size} />
                }
                {renderOverlay()}
            </Grid>
        </div>
    );
};

export default memo(NodeComponent);