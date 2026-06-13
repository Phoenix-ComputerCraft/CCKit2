import CCButton from "CCKit2/CCButton";
import CCView from "CCKit2/CCView";
import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import { JSX } from "CCKit2/CCJSX";
import CCGraphicsContext from "./CCGraphicsContext";

/**
 * A toggle button is a version of a regular button which toggles between on and
 * off when clicked.
 * 
 * @example Create a toggle button that shows an alert when clicked on.
 * ```ts
 * let button = new CCToggleButton({x: 5, y: 3}, "Hello!", (_, state) => {if (state) CCDialog.messageWithOneButton(this.view.window, "Hello!", "Hello World!");});
 * this.view.addSubview(button);
 * ```
 * ```lua
 * local button = LuaWrappers.new(CCToggleButton, {x = 5, y = 3}, "Hello!", function(_ state) if state then CCDialog:messageWithOneButton(self.view.window, "Hello!", "Hello World!") end end)
 * self.view:addSubview(button)
 * ```
 * 
 * @see CCCheckbox For an alternate toggling control which is more explicitly boolean
 * @category Views
 */
export default class CCToggleButton extends CCButton {
    /** The current state of the button. */
    public get state(): boolean {return this._state;}
    public set state(value: boolean) {
        this._state = value;
        this.setNeedsDisplay();
    }
    private _state: boolean = false;

    constructor(position: CCPoint, text: string, action: (this: void, button: CCToggleButton, state: boolean) => void) {
        super(position, text, button => {
            this.state = !this._state;
            action(this, this._state);
        });
    }

    public loadJSXAttributes(attrs: JSX.AttributesFor<CCToggleButton, {pos: JSX.AttributeValues<CCPoint>}>): void {
        super.loadJSXAttributes(attrs);
        if (attrs.state !== undefined) this._state = attrs.state === "true" || attrs.state === true;
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        const bgColor = (this.isPressed ? this.buttonActiveColor : (this._state ? this.buttonDefaultColor : this.buttonColor));
        context.color = (this.isEnabled ? (this._state ? CCColor.white : this.textColor) : this.textDisabledColor);
        const str = " " + this.text + " ";
        context.drawTextWithBackground(rect, str.substring(rect.x - 1, rect.x - 1 + rect.width), bgColor);
    }
}

/**
 * Creates a new JSX element.
 * @param attrs The attributes for the element
 * @returns The new element
 */
export function JSX(attrs: JSX.AttributesFor<CCToggleButton, {pos: JSX.AttributeValues<CCPoint>, action: CCToggleButton["action"]}>, text: string | undefined, parameters: JSX.ParameterElements[]): CCView {
    const pos: number[] = attrs.pos.split(" ").map(n => tonumber(n)) as number[];
    if (pos.length < 2) throw "Bad pos attribute in JSX code";
    let retval = new CCToggleButton({x: pos[0], y: pos[1]}, text ?? "", attrs.action);
    retval.loadJSXAttributes(attrs);
    return retval;
}
