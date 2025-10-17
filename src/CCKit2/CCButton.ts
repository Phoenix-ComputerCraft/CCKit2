import CCView from "CCKit2/CCView";
import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCControl from "CCKit2/CCControl";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A button implements a simple clickable region with text, which triggers a
 * function when clicked.  
 * ![Example image](../../images/CCButton.png)
 * 
 * @example Create a button that shows an alert when clicked.
 * ```ts
 * let button = new CCButton({x: 5, y: 3}, "Hello!", () => CCDialog.messageWithOneButton(this.view.window, "Hello!", "Hello World!"));
 * this.view.addSubview(button);
 * ```
 * ```lua
 * local button = LuaWrappers.new(CCButton, {x = 5, y = 3}, "Hello!", function() CCDialog:messageWithOneButton(self.view.window, "Hello!", "Hello World!") end)
 * self.view:addSubview(button)
 * ```
 * 
 * @category Views
 */
export default class CCButton extends CCControl {
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

    /**
     * Create a new button.
     * @param position The position of the button
     * @param text The text for the button
     * @param action The function to call when the button is pressed
     */
    constructor(position: CCPoint, text: string, action: (this: void, button: CCView) => void) {
        super({x: position.x, y: position.y, width: text.length + 2, height: 1}, action);
        this._text = text;
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        const bgColor = (this.isPressed ? this._buttonActiveColor : (this.isDefault ? this._buttonDefaultColor : this._buttonColor));
        context.color = (this.isEnabled ? (this.isDefault ? CCColor.white : this._textColor) : this._textDisabledColor);
        const str = " " + this._text + " ";
        context.drawTextWithBackground(rect, str.substring(rect.x - 1, rect.x - 1 + rect.width), bgColor);
    }
}
