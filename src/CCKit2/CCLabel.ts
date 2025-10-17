import { CCColor, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A label displays a single line of text without wrapping.  
 * ![Example image](../../images/CCLabel.png)
 * 
 * @example Create a label that shows text.
 * ```ts
 * let label = new CCLabel({x: 5, y: 3}, "Hello World!");
 * this.view.addSubview(label);
 * ```
 * ```lua
 * local label = LuaWrappers.new(CCLabel, {x = 5, y = 3}, "Hello World!")
 * self.view:addSubview(label)
 * ```
 * 
 * @category Views
 */
export default class CCLabel extends CCView {
    /** The text for the label. */
    public get text(): string {return this._text;}
    public set text(value: string) {
        this._text = value;
        if (value.length < this.frame.width) this.superview?.setNeedsDisplay();
        this.frame = {x: this.frame.x, y: this.frame.y, width: value.length, height: 1};
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

    /**
     * Create a new label.
     * @param position The position of the label
     * @param text The text to show in the label
     */
    constructor(position: CCPoint, text: string) {
        super({x: position.x, y: position.y, width: text.length, height: 1})
        this._text = text;
    }

    public draw(rect: CCRect): void {
        super.draw(rect);
        CCGraphicsContext.current!.color = this._textColor;
        CCGraphicsContext.current!.drawText({x: 1, y: 1}, this._text);
    }
}
