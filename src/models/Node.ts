export default class Node {
    x: number;
    y: number;
    stateUpdated?: () => void;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getState = () => {
        
    }

    setState = () => {
        if(this.stateUpdated) this.stateUpdated();
    }
}