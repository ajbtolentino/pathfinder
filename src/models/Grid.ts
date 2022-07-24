import Node, { NodeType } from "./Node";

export default class Grid {
    nodes: Node[][];
    rows: number;
    columns: number;

    constructor(rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;
        this.nodes = [];

        this.populate();
    };

    private populate = () => {
        this.nodes = [];

        if(!this.rows || !this.columns) return;

        for(let x = 0; x < this.columns; x++) {
            const rowNodes: Node[] = [];

            for(let y = 0; y < this.rows; y++) {
                rowNodes.push(new Node(x, y));
            }

            this.nodes.push(rowNodes);
        }

        this.nodes[0][0].setType(NodeType.Start);
        this.nodes[this.columns - 1][this.rows - 1].setType(NodeType.Goal);
    };

    randomizeStartNode = () => {
        const emptyNodes = this.getAllNodesByType(NodeType.Empty);
        const randomIndex = Math.floor(Math.random() * emptyNodes.length);
        const chosenNode = emptyNodes[randomIndex];

        this.updateNode(chosenNode.x, chosenNode.y, NodeType.Start);
    };

    randomizeEndNode = () => {
        const emptyNodes = this.getAllNodesByType(NodeType.Empty);
        const randomIndex = Math.floor(Math.random() * emptyNodes.length);
        const chosenNode = emptyNodes[randomIndex];

        this.updateNode(chosenNode.x, chosenNode.y, NodeType.Goal);
    };

    getAllNodesByType = (type: NodeType) => {
        const collection: Node[] = [];

        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                const node = this.nodes[x][y];
                if(node && node.getType() === type)
                    collection.push(node);
            }
        }

        return collection;
    };

    resetAllNodes = () => {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                this.nodes[x][y].reset();
            }
        }
    };

    updateAllNodes = (type: NodeType) => {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                this.nodes[x][y].setType(type);
            }
        }
    };

    updateNode = (x: number, y: number, type: NodeType) => {
        const node = this.nodes[x][y];
        
        if(!node) return;

        if(type === NodeType.Start) {
            const startNode = this.getStartNode();

            if(startNode) startNode.setType(NodeType.Empty);
        }

        if(type === NodeType.Goal) {
            const endNode = this.getEndNode();

            if(endNode) endNode.setType(NodeType.Empty);
        }

        node.setType(type);
    };

    getStartNode = () => {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                const node = this.nodes[x][y];
                
                if(node && node.getType() === NodeType.Start)
                    return node;
            }
        }
    };

    getEndNode = () => {
        for(let x = 0; x < this.columns; x++) {
            for(let y = 0; y < this.rows; y++) {
                const node = this.nodes[x][y];
                
                if(node && node.getType() === NodeType.Goal)
                    return node;
            }
        }
    };

    getNeighbors = (node: Node, hasBorders: boolean = true, includeDiagonal: boolean = false, jump: number = 1) : Node[] => {
        const neighbors: Node[] = [];

        const top = this.getNeighbor(node.x, node.y - jump, hasBorders);
        const topRight = this.getNeighbor(node.x + jump, node.y - jump, hasBorders);
        const right = this.getNeighbor(node.x + jump, node.y, hasBorders);
        const bottomRight = this.getNeighbor(node.x + jump, node.y + jump, hasBorders);
        const bottom = this.getNeighbor(node.x, node.y + jump, hasBorders);
        const bottomLeft = this.getNeighbor(node.x - jump, node.y + jump, hasBorders);
        const left = this.getNeighbor(node.x - jump, node.y, hasBorders);
        const topLeft = this.getNeighbor(node.x - jump, node.y - jump, hasBorders);

        if(top) neighbors.push(top);
        if(topRight && includeDiagonal) neighbors.push(topRight);
        if(right) neighbors.push(right);
        if(bottomRight && includeDiagonal) neighbors.push(bottomRight);
        if(bottom) neighbors.push(bottom);
        if(bottomLeft && includeDiagonal) neighbors.push(bottomLeft);
        if(left) neighbors.push(left);
        if(topLeft && includeDiagonal) neighbors.push(topLeft);

        return neighbors;
    };

    getNeighbor = (x: number, y: number, hasBorders: boolean = true): Node | null => {
        if(hasBorders){
            const rowInbouds = 0 <= x && x < this.nodes.length;
            const columnInbounds = 0 <= y && this.nodes[0].length;

            if(!rowInbouds || !columnInbounds) return null;
        }
        else {
            x = ((x % this.nodes.length) + this.nodes.length) % this.nodes.length;
            y = ((y % this.nodes[0].length) + this.nodes[0].length) % this.nodes[0].length;
        }

        return this.nodes[x][y];
    };

    connect = (source: Node, neighbor: Node) => {
        const connectorRowDiff = neighbor.x === source.x ? 0 : neighbor.x - source.x;
        const connectorColumnDiff = neighbor.y === source.y ? 0 : neighbor.y - source.y;

        let connectorRow = 0;
        let connectorColumn = 0;

        if(connectorRowDiff > 0) {
            connectorRow = 1;
        }

        if(connectorRowDiff < 0) {
            connectorRow = -1;
        }

        if(connectorColumnDiff > 0) {
            connectorColumn = 1;
        }

        if(connectorColumnDiff < 0) {
            connectorColumn = -1;
        }

        const path = this.nodes[source.x + connectorRow][source.y + connectorColumn];

        if(path.getType() === NodeType.Wall) {
            path.visit();
            path.setType(NodeType.Empty);
        }
    };

    getDirection = (source: Node, destination: Node) : Direction | undefined => {
        if(source.x === destination.x && source.y < destination.y) return Direction.North;
        if(source.x > destination.x && source.y === destination.y) return Direction.East;
        if(source.x === destination.x && source.y > destination.y) return Direction.South;
        if(source.x < destination.x && source.y === destination.y) return Direction.West;

        if(source.x > destination.x && source.y < destination.y) return Direction.NorthEast;
        if(source.x < destination.x && source.y < destination.y) return Direction.NorthWest;
        if(source.x > destination.x && source.y > destination.y) return Direction.SouthEast;
        if(source.x < destination.x && source.y > destination.y) return Direction.SouthWest;

        return undefined;
    };
}

export enum Direction {
    North = "north",
    NorthEast = "northeast",
    NorthWest = "northwest",
    East = "east",
    South = "south",
    SouthEast = "southeast",
    SouthWest = "southwest",
    West = "west"
}