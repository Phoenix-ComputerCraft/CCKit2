import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCControl from "CCKit2/CCControl";
import CCWindow from "CCKit2/CCWindow";
import CCButton from "CCKit2/CCButton";
import CCView from "CCKit2/CCView";

/**
 * A combo box allows selection from multiple items in a compact button view.
 * @category Views
 */
export default class CCComboBox extends CCControl {
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
    /** The color of the arrow of the button. */
    public get buttonDefaultColor(): CCColor {return this._buttonDefaultColor;}
    public set buttonDefaultColor(value: CCColor) {
        this._buttonDefaultColor = value;
        this.setNeedsDisplay();
    }
    private _buttonDefaultColor: CCColor = CCColor.blue;
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
    /** The possible selections in the list. */
    public get selections(): string[] {return this._selections;}
    public set selections(value: string[]) {
        if (value.length === 0) throw "Selections list must have at least one entry";
        this._selections = value;
        if (this._selectedIndex >= value.length) this._selectedIndex = 0;
        this.setNeedsDisplay();
    }
    private _selections: string[];
    /** The currently selected index. */
    public get selectedIndex(): number {return this._selectedIndex;}
    public set selectedIndex(value: number) {
        this._selectedIndex = Math.min(Math.max(Math.floor(value), 0), this._selections.length - 1);
        this.setNeedsDisplay();
    }
    private _selectedIndex: number = 0;
    /** The currently selected value. */
    public get selectedValue(): string {return this._selections[this._selectedIndex];}
    /** The function to call when the value changes. */
    public onChange?: (this: void, sender: CCView) => void;

    /**
     * Create a new combo box.
     * @param rect The frame of the button
     * @param selections The list of selections for the button
     */
    constructor(rect: CCRect, selections: string[]) {
        if (selections.length === 0) throw "Selections list must have at least one entry";
        super(rect, () => this.open());
        this._selections = selections;
    }

    private open(): void {
        // TODO: screen geometry
        let start = this.convertToWindowSpace({x: 1, y: 1})
        let winpos = this.window!.position;
        let rect: CCRect = {x: winpos.x + start.x, y: winpos.y + start.y - this._selectedIndex, width: 0, height: this._selections.length};
        for (let s of this._selections) rect.width = Math.max(rect.width, s.length + 2);
        let win = new CCWindow(rect, CCWindow.StyleMask.Borderless | CCWindow.StyleMask.AboveOthers, false, this.window!.screen);
        let view = win.contentView!
        for (let i = 0; i < this._selections.length; i++) {
            let i2 = i;
            let button = new CCButton({x: 1, y: i + 1}, this._selections[i].padEnd(rect.width - 2), () => {
                this.selectedIndex = i2;
                if (this.onChange) this.onChange(this);
                win.close();
                this.window!.display();
                this.window!.makeKeyAndOrderFront();
            });
            view.addSubview(button);
        }
        win.display();
        win.makeKey();
    }

    public draw(rect: CCRect): void {
        if (this.window === undefined) return;
        const context = CCGraphicsContext.current!;
        const bgColor = (this.isPressed ? this._buttonActiveColor : (this.isDefault ? this._buttonDefaultColor : this._buttonColor));
        context.color = (this.isEnabled ? (this.isDefault ? CCColor.white : this._textColor) : this._textDisabledColor);
        const selected = this._selections[this._selectedIndex];
        const str = " " + (selected.length > this.frame.width - 3 ? selected.substring(0, this.frame.width - 6) + "..." : selected.padEnd(this.frame.width - 3)) + " ";
        context.drawTextWithBackground(rect, str.substring(rect.x - 1, rect.x - 1 + rect.width), bgColor);
        if (this.frame.width < rect.x + rect.width) {
            context.color = CCColor.white;
            context.drawTextWithBackground({x: this.frame.width, y: 1}, string.char(0x1F), this._buttonDefaultColor);
        }
    }
}
