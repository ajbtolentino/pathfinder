export enum NodeType {
    Wall = "wall",
    Empty = "empty",
    Start = "start",
    Goal = "goal"
};

export enum NodeState {
    Unvisited = "unvisited",
    Visited = "visited",
    Queued = "queued"
};

export default class Node {
    x: number;
    y: number;
    gScore: number;
    hScore: number;
    fScore: number;
    previous: Node | undefined;

    stateUpdated?: (state: NodeState) => void;
    typeUpdated?: (type: NodeType) => void;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.gScore = Infinity;
        this.hScore = Infinity;
        this.fScore = Infinity;
        this.type = NodeType.Empty;
        this.state = NodeState.Unvisited;
    };

    reset = () : void => {
        this.gScore = Infinity;
        this.hScore = Infinity;
        this.fScore = Infinity;
        this.previous = undefined;
        this.setState(NodeState.Unvisited);
    }

    private state: NodeState;
    getState = () : NodeState => this.state;
    setState = (state: NodeState) : void => {
        this.state = state;
        
        if(this.stateUpdated) this.stateUpdated(state);
    };

    private type: NodeType;
    getType = () : NodeType => this.type;
    setType = (type: NodeType) : void => {
        this.type = type;

        if(this.typeUpdated) this.typeUpdated(type);
    };

    visit = () : void => {
        this.setState(NodeState.Visited);
    };

    pushIn = (array: Node[]) : void => {
        array.push(this);

        this.setState(NodeState.Queued);
    };

    unshiftIn = (array: Node[]) : void => {
        array.unshift(this);

        this.setState(NodeState.Queued);
    };
}