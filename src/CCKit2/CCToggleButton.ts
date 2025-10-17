import CCButton from "CCKit2/CCButton";
import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "./CCGraphicsContext";

/**
 * A toggle button is a version of a regular button which toggles between on and
 * off when clicked.
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
