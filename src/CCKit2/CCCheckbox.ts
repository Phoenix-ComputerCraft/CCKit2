import CCView from "CCKit2/CCView";
import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCControl from "CCKit2/CCControl";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

export default class CCCheckbox extends CCControl {
    /** The color of the button. */
    public get buttonColor(): CCColor {return this._buttonColor;}
    public set buttonColor(value: CCColor) {
        this._buttonColor = value;
        this.setNeedsDisplay();
    }
    private _buttonColor: CCColor = CCColor.lightGray;
    /** The color of the button when clicked. */
    public get buttonActiveColor(): CCColor {return this._buttonActiveColor;}
    public set buttonActiveColor(value: CCColor) {
        this._buttonActiveColor = value;
        this.setNeedsDisplay();
    }
    private _buttonActiveColor: CCColor = CCColor.gray;
    /** The color of the button when in default state. */
    public get buttonDefaultColor(): CCColor {return this._buttonDefaultColor;}
    public set buttonDefaultColor(value: CCColor) {
        this._buttonDefaultColor = value;
        this.setNeedsDisplay();
    }
    private _buttonDefaultColor: CCColor = CCColor.blue;
    /** The text for the button. */
    public get text(): string {return this._text;}
    public set text(value: string) {
        this._text = value;
        this.frame = {x: this.frame.x, y: this.frame.y, width: value.length + 2, height: 1};
        this.setNeedsDisplay();
    }
    private _text: string;
    /** The color of the text. */
    public get textColor(): CCColor {return this._textColor;}
    public set textColor(value: CCColor) {
        this._textColor = value;
        this.setNeedsDisplay();
    }
    private _textColor: CCColor = CCColor.black;
    /** The color of the text when disabled. */
    public get textDisabledColor(): CCColor {return this._textDisabledColor;}
    public set textDisabledColor(value: CCColor) {
        this._textDisabledColor = value;
        this.setNeedsDisplay();
    }
    private _textDisabledColor: CCColor = CCColor.gray;
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
        super({x: position.x, y: position.y, width: text.length + 2, height: 1}, undefined);
        this._text = text;
        let self = this;
        this.action = () => self.onClick();
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current;
        if (rect.x === 1) {
            let bgColor = (this._checked ? this._buttonDefaultColor : (this.isPressed ? this._buttonActiveColor : this._buttonColor));
            context.color = this._checked ? CCColor.white : CCColor.black;
            context.drawTextWithBackground({x: 1, y: 1}, this._checked ? "x" : " ", bgColor);
        }
        context.color = (this.isEnabled ? this._textColor : this._textDisabledColor) as Color;
        const str = " " + this._text;
        context.drawText({x: Math.max(rect.x, 2), y: rect.y}, str.substring(Math.max(rect.x - 2, 0), rect.x + rect.width - 1));
    }

    private onClick(): void {
        this.checked = !this.checked;
        if (this.onStateChange) this.onStateChange(this, this.checked);
    }
}
