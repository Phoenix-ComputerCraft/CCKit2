import CCView from "CCKit2/CCView";
import { CCColor, CCKey, CCPoint, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCEvent from "CCKit2/CCEvent";
import CCMenu from "CCKit2/CCMenu";
import CCMenuItem from "CCKit2/CCMenuItem";

/**
 * A text field allows inputting text in a single line.
 * @category Views
 */
export default class CCTextField extends CCView {
    /** The text currently in the field. */
    public get text(): string {return this._text;}
    public set text(value: string) {
        this._text = value;
        this.setNeedsDisplay();
    }
    private _text: string = "";
    /** Text to display if nothing is input. */
    public get placeholderText(): string {return this._placeholderText;}
    public set placeholderText(value: string) {
        this._placeholderText = value;
        if (this._text === "") this.setNeedsDisplay();
    }
    private _placeholderText: string = "";
    /** The color of the text. */
    public get textColor(): CCColor {return this._textColor;}
    public set textColor(value: CCColor) {
        this._textColor = value;
        this.setNeedsDisplay();
    }
    private _textColor: CCColor = CCColor.black;
    /** The color of the text when disabled. */
    public get disabledTextColor(): CCColor {return this._disabledTextColor;}
    public set disabledTextColor(value: CCColor) {
        this._disabledTextColor = value;
        this.setNeedsDisplay();
    }
    private _disabledTextColor: CCColor = CCColor.gray;
    /** Whether the text field is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (!value && this.window && this.isActive)
            this.window.makeFirstResponder(undefined);
        this.setNeedsDisplay();
    }
    private _isEnabled: boolean = true;
    /** Whether the text is displayed as a password. */
    public get isSecureTextEntry(): boolean {return this._isSecureTextEntry;}
    public set isSecureTextEntry(value: boolean) {
        this._isSecureTextEntry = value;
        this.setNeedsDisplay();
    }
    private _isSecureTextEntry: boolean = false;

    private isActive: boolean = false;
    private _cursorPos: number = 0;
    private scrollPos: number = 0;

    /**
     * Create a new text field.
     * @param frame The frame of the text field
     */
    constructor(frame: CCRect) {
        super(frame);
        this.backgroundColor = CCColor.lightGray;
    }

    public becomeFirstResponder(): boolean {
        if (!this._isEnabled) return false;
        this.isActive = true;
        this.setNeedsDisplay();
        return true;
    }
    
    public resignFirstResponder(): boolean {
        this.isActive = false;
        this.setNeedsDisplay();
        return true;
    }

    public draw(rect: CCRect): void {
        super.draw(rect);
        CCGraphicsContext.current!.color = (this._isEnabled && !(this._text === "" && !this.isActive)) ? this._textColor : this._disabledTextColor;
        CCGraphicsContext.current!.drawText({x: 1, y: 1}, (this._text === "" && !this.isActive) ? this._placeholderText : (this._isSecureTextEntry ? "\u0007".repeat(Math.min(this._text.length - this.scrollPos, this.frame.width)) : this._text.substring(this.scrollPos, this.scrollPos + this.frame.width)));
    }

    public cursorPos(): [CCPoint, CCColor] | undefined {
        if (!this.isActive) return undefined;
        return [this.convertToWindowSpace({x: this._cursorPos - this.scrollPos + 1, y: 1}), this._textColor];
    }

    public menuForEvent(event: CCEvent): CCMenu | undefined {
        if (event.type !== CCEvent.Type.RightMouseDown) return undefined;
        let menu = new CCMenu();
        let cut = new CCMenuItem("Cut", () => {});
        cut.isEnabled = false;
        menu.addItem(cut);
        let copy = new CCMenuItem("Copy", () => {});
        copy.isEnabled = false;
        menu.addItem(copy);
        menu.addItem("Paste", () => {});
        menu.addSpacer();
        menu.addItem("Spellcheck", () => {}, undefined, false);
        return menu;
    }

    public mouseDown(event: CCEvent): void {
        const start = this.convertToWindowSpace({x: 1, y: 1});
        this._cursorPos = Math.min(this.scrollPos + event.locationInWindow!.x - start.x, this._text.length);
        this.setNeedsDisplay();
    }

    public keyDown(event: CCEvent): void {
        if (!this.isActive) return;
        if (event.keyCode === CCKey.Left && this._cursorPos > 0) {
            this._cursorPos--;
            if (this.scrollPos > this._cursorPos - 1 && this.scrollPos > 0) this.scrollPos--;
            this.setNeedsDisplay();
        } else if (event.keyCode === CCKey.Right && this._cursorPos < this._text.length) {
            this._cursorPos++;
            if (this._cursorPos - this.scrollPos >= this.frame.width) this.scrollPos++;
            this.setNeedsDisplay();
        } else if (event.keyCode === CCKey.Home) {
            this._cursorPos = 0;
            this.scrollPos = 0;
            this.setNeedsDisplay();
        } else if (event.keyCode === CCKey.End) {
            this._cursorPos = this._text.length;
            this.scrollPos = Math.max(this._text.length - this.frame.width + 1, 0);
            this.setNeedsDisplay();
        } else if (event.keyCode === CCKey.Backspace && this._cursorPos > 0) {
            this._text = this._text.substring(0, this._cursorPos - 1) + this._text.substring(this._cursorPos);
            this._cursorPos--;
            if (this.scrollPos > this._cursorPos - 1 && this.scrollPos > 0) this.scrollPos--;
            this.setNeedsDisplay();
        } else if (event.keyCode === CCKey.Delete) {
            this._text = this._text.substring(0, this._cursorPos) + this._text.substring(this._cursorPos + 1);
            this.setNeedsDisplay();
        }
    }

    public textInput(event: CCEvent): void {
        let text = event.characters!;
        this._text = this._text.substring(0, this._cursorPos) + text + this._text.substring(this._cursorPos);
        this._cursorPos += text.length;
        if (this._cursorPos - this.scrollPos >= this.frame.width) {
            let overflow = this._cursorPos - this.scrollPos - this.frame.width + 1;
            this.scrollPos += overflow;
        }
        this.setNeedsDisplay();
    }
}
