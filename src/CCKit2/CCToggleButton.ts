import CCButton from "CCKit2/CCButton";
import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
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

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        const bgColor = (this.isPressed ? this.buttonActiveColor : (this._state ? this.buttonDefaultColor : this.buttonColor));
        context.color = (this.isEnabled ? (this._state ? CCColor.white : this.textColor) : this.textDisabledColor);
        const str = " " + this.text + " ";
        context.drawTextWithBackground(rect, str.substring(rect.x - 1, rect.x - 1 + rect.width), bgColor);
    }
}
