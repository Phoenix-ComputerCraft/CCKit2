import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCButton from "CCKit2/CCButton";
import { JSX } from "CCKit2/CCJSX";
import CCView from "CCKit2/CCView";

/**
 * A checkbox is a type of button that is either on or off.  
 * ![Example image](../../images/CCCheckbox.png)
 * 
 * @example Create a checkbox that runs a function when clicked.
 * ```ts
 * let checkbox = new CCCheckbox({x: 5, y: 3}, "Enabled");
 * checkbox.onStateChange = (_, state) => this.setStatus(state);
 * this.view.addSubview(checkbox);
 * ```
 * ```lua
 * local checkbox = LuaWrappers.new(CCCheckbox, {x = 5, y = 3}, "Enabled")
 * checkbox.onStateChange = function(_, state) self:setStatus(state) end
 * self.view:addSubview(checkbox)
 * ```
 * 
 * @category Views
 */
export default class CCCheckbox extends CCButton {
    /** Whether the checkbox is currently checked. */
    public get checked(): boolean {return this._checked;}
    public set checked(value: boolean) {
        this._checked = value;
        this.setNeedsDisplay();
    }
    private _checked: boolean = false;
    /** The function called when the state changes. */
    public onStateChange?: (this: void, sender: CCCheckbox, state: boolean) => void;

    /**
     * Create a new checkbox.
     * @param position The position of the checkbox
     * @param text The text for the button
     */
    constructor(position: CCPoint, text: string) {
        super(position, text!, () => {});
        let self = this;
        this.action = () => self.onClick();
    }

    public loadJSXAttributes(attrs: JSX.AttributesFor<CCCheckbox, {pos: JSX.AttributeValues<CCPoint>, onStateChange?: CCCheckbox["onStateChange"]}>): void {
        super.loadJSXAttributes(attrs);
        if (attrs.checked !== undefined) this._checked = attrs.checked === "true" || attrs.checked === true;
        if (attrs.onStateChange !== undefined) this.onStateChange = attrs.onStateChange;
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        if (rect.x === 1) {
            let bgColor = (this._checked ? this.buttonDefaultColor : (this.isPressed ? this.buttonActiveColor : this.buttonColor));
            context.color = this._checked ? CCColor.white : CCColor.black;
            context.drawTextWithBackground({x: 1, y: 1}, this._checked ? "x" : " ", bgColor);
        }
        context.color = (this.isEnabled ? this.textColor : this.textDisabledColor);
        const str = " " + this.text;
        context.drawText({x: Math.max(rect.x, 2), y: rect.y}, str.substring(Math.max(rect.x - 2, 0), rect.x + rect.width - 1));
    }

    private onClick(): void {
        this.checked = !this.checked;
        if (this.onStateChange) this.onStateChange(this, this.checked);
    }
}

/**
 * JSX constructor.
 * @param attrs The attributes for the element
 * @param text The text inside the element
 */
export function JSX(attrs: JSX.AttributesFor<CCCheckbox, {pos: JSX.AttributeValues<CCPoint>, onStateChange?: CCCheckbox["onStateChange"]}>, text: string | undefined): CCView {
    const pos: number[] = attrs.pos.split(" ").map(n => tonumber(n)) as number[];
    if (pos.length < 2) throw "Bad pos attribute in JSX code";
    let retval = new CCCheckbox({x: pos[0], y: pos[1]}, text ?? "");
    retval.loadJSXAttributes(attrs);
    return retval;
}
