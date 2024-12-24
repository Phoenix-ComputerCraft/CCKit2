import CCView from "CCKit2/CCView";
import { CCColor, CCKey, CCRect } from "CCKit2/CCTypes";
import CCEvent from "CCKit2/CCEvent";

/**
 * CCControl is the base class for many selectable input items.
 * @category Views
 */
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
     * Create a new control.
     * @param frame The position of the control
     * @param action The function to call when the control is pressed
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
        if (event.locationInWindow!.x < start.x || event.locationInWindow!.y < start.y || event.locationInWindow!.x >= start.x + this.frame.width || event.locationInWindow!.y >= start.y + this.frame.height)
            return;
        this.action(this);
    }

    public keyDown(event: CCEvent): void {
        if (!this.isEnabled || !this.isDefault || (event.keyCode !== CCKey.Enter && event.keyCode !== CCKey.NumPadEnter)) return;
        this.isPressed = true;
        this.setNeedsDisplay();
    }

    public keyUp(event: CCEvent): void {
        if (!this.isEnabled || !this.isDefault || (event.keyCode !== CCKey.Enter && event.keyCode !== CCKey.NumPadEnter)) return;
        this.isPressed = false;
        this.setNeedsDisplay();
        this.action(this);
    }
}
