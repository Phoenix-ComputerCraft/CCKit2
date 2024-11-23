import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCEvent from "CCKit2/CCEvent";

export default class CCControl extends CCView {
    /** Whether the control is in default state. */
    public get isDefault(): boolean {return this._isDefault;}
    public set isDefault(value: boolean) {
        this._isDefault = value;
        if (value && this.window) this.window.makeFirstResponder(this);
        this.setNeedsDisplay();
    }
    protected _isDefault: boolean = false;
    /** Whether the control is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        this.setNeedsDisplay();
    }
    protected _isEnabled: boolean = true;
    /** The function to call when the control is pressed. */
    public action: (this: void, sender: CCView) => void;

    /**
     * Create a new button.
     * @param position The position of the button
     * @param text The text for the button
     * @param action The function to call when the button is pressed
     */
    constructor(frame: CCRect, action: (this: void, sender: CCView) => void) {
        super(frame);
        this.action = action;
    }

    protected isPressed: boolean = false;

    public mouseDown(event: CCEvent): void {
        if (!this.isEnabled) return;
        this.isPressed = true;
        this.setNeedsDisplay();
    }

    public mouseUp(event: CCEvent): void {
        if (!this.isEnabled) return;
        this.isPressed = false;
        this.setNeedsDisplay();
        const start = this.convertToWindowSpace({x: 1, y: 1});
        if (event.locationInWindow.x < start.x || event.locationInWindow.y < start.y || event.locationInWindow.x >= start.x + this.frame.width || event.locationInWindow.y >= start.y + this.frame.height)
            return;
        this.action(this);
    }

    public keyDown(event: CCEvent): void {
        if (!this.isEnabled || !this.isDefault) return; // TODO: keycodes
        this.isPressed = true;
        this.setNeedsDisplay();
    }

    public keyUp(event: CCEvent): void {
        if (!this.isEnabled || !this.isDefault) return;
        this.isPressed = false;
        this.setNeedsDisplay();
        this.action(this);
    }
}
