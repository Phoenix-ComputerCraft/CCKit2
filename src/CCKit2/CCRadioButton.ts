import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCButton from "CCKit2/CCButton";

/**
 * A radio button is a type of button that can only have one button active in
 * a group. Groups are established when radio buttons share superviews and 
 * state change actions.  
 * ![Example image](../../images/CCRadioButton.png)
 * @category Views
 */
export default class CCRadioButton extends CCButton {
    /** Whether the radio button is currently selected. */
    public get checked(): boolean {return this._checked;}
    public set checked(value: boolean) {
        this._checked = value;
        if (value && this.superview)
            for (let view of this.superview.subviews)
                if (view !== this && view instanceof CCRadioButton && view.onStateChange === this.onStateChange)
                    view.checked = false;
        this.setNeedsDisplay();
    }
    private _checked: boolean = false;
    /** The function called when a button is clicked. */
    public onStateChange?: (this: void, sender: CCRadioButton) => void;

    /**
     * Create a new radio button.
     * @param position The position of the button
     * @param text The text for the button
     */
    constructor(position: CCPoint, text: string) {
        super(position, text, () => {});
        let self = this;
        this.action = () => self.onClick();
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        if (rect.x === 1) {
            let bgColor = (this._checked ? this.buttonDefaultColor : (this.isPressed ? this.buttonActiveColor : this.buttonColor));
            context.color = this._checked ? CCColor.white : CCColor.black;
            context.drawTextWithBackground({x: 1, y: 1}, this._checked ? "\x07" : string.char(0xBA), bgColor);
        }
        context.color = (this.isEnabled ? this.textColor : this.textDisabledColor);
        const str = " " + this.text;
        context.drawText({x: Math.max(rect.x, 2), y: rect.y}, str.substring(Math.max(rect.x - 2, 0), rect.x + rect.width - 1));
    }

    private onClick(): void {
        this.checked = true;
        if (this.superview)
            for (let view of this.superview.subviews)
                if (view !== this && view instanceof CCRadioButton && view.onStateChange === this.onStateChange)
                    view.checked = false;
        if (this.onStateChange) this.onStateChange(this);
    }
}
