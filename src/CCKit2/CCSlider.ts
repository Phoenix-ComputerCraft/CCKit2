import CCView from "CCKit2/CCView";
import { CCColor, CCKey, CCRect } from "CCKit2/CCTypes";
import CCEvent from "CCKit2/CCEvent";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A slider allows input of a progressive value.  
 * ![Example image](../../images/CCSlider.png)
 * 
 * @example Create a slider and calls an action when changed.
 * ```ts
 * let slider = new CCSlider({x: 5, y: 3, width: 10, height: 1});
 * slider.position = 0.5;
 * slider.action = (_, value) => this.setSlider(value);
 * this.view.addSubview(slider);
 * ```
 * ```lua
 * local slider = LuaWrappers.new(CCSlider, {x = 5, y = 3, width = 10, height = 1})
 * slider.position = 0.5
 * slider.action = function(_, value) self:setSlider(value) end
 * self.view:addSubview(slider)
 * ```
 * 
 * @category Views
 */
export default class CCSlider extends CCView {
    /** Whether the control is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        this.setNeedsDisplay();
    }
    protected _isEnabled: boolean = true;
    /** The function to call when the slider moves. */
    public action?: (this: void, sender: CCView, position: number) => void;
    /** The position of the slider, from 0.0 to 1.0. */
    public get position(): number {
        return this._position * this.frame.width / (this.frame.width - 1);
    }
    public set position(value: number) {
        this._position = Math.min(Math.max(value, 0), 1 - 1 / this.frame.width);
        this.setNeedsDisplay();
    }
    private _position: number = 0;
    /** The color of the active part of the slider. */
    public get activeColor(): CCColor {return this._activeColor;}
    public set activeColor(value: CCColor) {
        this._activeColor = value;
        this.setNeedsDisplay();
    }
    private _activeColor: CCColor = CCColor.blue;
    /** The color of the inactive part of the slider. */
    public get inactiveColor(): CCColor {return this._inactiveColor;}
    public set inactiveColor(value: CCColor) {
        this._inactiveColor = value;
        this.setNeedsDisplay();
    }
    private _inactiveColor: CCColor = CCColor.lightGray;

    /**
     * Create a new slider.
     * @param frame The frame of the slider
     */
    constructor(frame: CCRect) {
        super(frame);
    }

    protected isPressed: boolean = false;

    public draw(frame: CCRect): void {
        // TODO: dirty rect
        const context = CCGraphicsContext.current!;
        let width = Math.floor(this._position * this.frame.width + 0.00001);
        context.color = this._activeColor;
        context.drawTextWithBackground({x: 1, y: 1}, string.rep(string.char(0x8C), width), this.backgroundColor ?? CCColor.white);
        context.drawTextWithBackground({x: width + 1, y: 1}, " ", this.isPressed ? CCColor.gray : this._inactiveColor);
        context.color = this._inactiveColor;
        context.drawTextWithBackground({x: width + 2, y: 1}, string.rep(string.char(0x8C), this.frame.width - width - 1), this.backgroundColor ?? CCColor.white);
    }

    public mouseDown(event: CCEvent): void {
        if (!this.isEnabled) return;
        this.isPressed = true;
        const start = this.convertToWindowSpace({x: 1, y: 1});
        this._position = Math.min(Math.max((event.locationInWindow!.x - start.x) / this.frame.width, 0.0), 1.0 - 1 / this.frame.width);
        this.setNeedsDisplay();
        if (this.action) this.action(this, this.position);
    }

    public mouseDragged(event: CCEvent): void {
        if (!this.isEnabled || !this.isPressed) return;
        const start = this.convertToWindowSpace({x: 1, y: 1});
        this._position = Math.min(Math.max((event.locationInWindow!.x - start.x) / this.frame.width, 0.0), 1.0 - 1 / this.frame.width);
        this.setNeedsDisplay();
        if (this.action) this.action(this, this.position);
    }

    public mouseUp(event: CCEvent): void {
        if (!this.isEnabled) return;
        this.isPressed = false;
        this.setNeedsDisplay();
    }

    public keyDown(event: CCEvent): void {
        if (!this.isEnabled) return;
        if (event.keyCode === CCKey.Left) {
            this.position = Math.max(this._position - 1 / this.frame.width, 0);
            if (this.action) this.action(this, this.position);
        } else if (event.keyCode === CCKey.Right) {
            this.position = Math.min(this._position + 1 / this.frame.width, 1 - 1 / this.frame.width);
            if (this.action) this.action(this, this.position);
        }
    }
}
