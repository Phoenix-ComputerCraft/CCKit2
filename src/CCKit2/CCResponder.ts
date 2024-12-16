import CCEvent from "CCKit2/CCEvent";

/**
 * The CCResponder class handles receiving events from the application. Any
 * object that wants to receive events must extend from CCResponder.
 */
export default class CCResponder {
    /** Whether the object can become the first responder. */
    public acceptsFirstResponder: boolean = true;
    /** The next responder in the responder chain. */
    public nextResponder?: CCResponder;

    /**
     * Notifies the object that it's about to become the first responder.
     * @returns Whether to accept the first responder status
     */
    public becomeFirstResponder(): boolean {return true;}

    /**
     * Notifies the object that it's about to no longer be the first responder.
     * @returns Whether to resign first responder status
     */
    public resignFirstResponder(): boolean {return true;}

    /**
     * Checks whether the passed object can become the first responder from the
     * specified event.
     * @param object The object to check
     * @param event The event that was sent
     * @returns Whether the object is allowed to be the first responder
     * @typecheck
     */
    public validateProposedFirstResponder(object: CCResponder, event: CCEvent): boolean {
        if (this.nextResponder) return this.nextResponder.validateProposedFirstResponder(object, event);
        else return true;
    }

    /**
     * Sends a list of key input events to the input manager, which will send
     * back text input events through `insertText(text: string)`.
     * @param events The input events to send
     * @typecheck
     */
    public interpretKeyEvents(events: CCEvent[]) {
        throw "Not implemented";
    }

    /**
     * Attempts to call the specified method on the object, passing the call on
     * to the next responder if this object doesn't implement it.
     * @param method The name of the method to call
     * @param param Any parameters to pass to the method
     * @returns Whether a responder was able to respond to the method
     */
    public tryToCall(method: string, ...args: any[]): boolean {
        // @ts-ignore
        if (typeof this[method] === "function") {
            // @ts-ignore
            this[method](...args);
            return true;
        } else if (this.nextResponder) {
            return this.nextResponder.tryToCall(method, ...args);
        } else {
            this.noResponder(method);
            return false;
        }
    }

    /**
     * Handles when a method action fails to find a responder.
     * @param method The method that was attempted
     */
    public noResponder(method: string): void {
        if (method === "keyDown") {
            // TODO: play sound
        }
    }

    // The following methods are all receivers for certain event types. These
    // can be implemented separately to only catch specific events. If the event
    // method isn't specified, it gets passed to the next responder.

    public mouseDown(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseDown(event);}
    public mouseDragged(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseDragged(event);}
    public mouseUp(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseUp(event);}
    public mouseMoved(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseMoved(event);}
    public mouseEntered(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseEntered(event);}
    public mouseExited(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.mouseExited(event);}
    public rightMouseDown(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.rightMouseDown(event);}
    public rightMouseDragged(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.rightMouseDragged(event);}
    public rightMouseUp(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.rightMouseUp(event);}
    public otherMouseDown(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.otherMouseDown(event);}
    public otherMouseDragged(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.otherMouseDragged(event);}
    public otherMouseUp(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.otherMouseUp(event);}
    public keyDown(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.keyDown(event);}
    public keyUp(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.keyUp(event);}
    public scrollWheel(event: CCEvent): void {if (this.nextResponder) return this.nextResponder.scrollWheel(event);}
}