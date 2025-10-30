import { EventEmitter } from "events";

class SpinalEventEmitter extends EventEmitter {
    constructor() {
        super();
    }
}

export const spinalEventEmitter = new SpinalEventEmitter();