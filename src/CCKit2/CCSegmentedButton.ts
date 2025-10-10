import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCEvent from "CCKit2/CCEvent";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A segmented button displays multiple buttons in a single view, with only one
 * selected at a time.  
 * ![Example image](../../images/CCSegmentedButton.png)
 * @category Views
 */
export default class CCSegmentedButton extends CCView {
    public get frame(): CCRect {return super.frame;}
    public set frame(value: CCRect) {
        super.frame = value;
        this.calculateButtons();
    }
    /** Whether the control is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        this.setNeedsDisplay();
    }
    protected _isEnabled: boolean = true;
    /** The function to call when the selection changes. */
    public action: (this: void, sender: CCSegmentedButton, selection: number) => void;
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
    public get buttonSelectedColor(): CCColor {return this._buttonSelectedColor;}
    public set buttonSelectedColor(value: CCColor) {
        this._buttonSelectedColor = value;
        this.setNeedsDisplay();
    }
    private _buttonSelectedColor: CCColor = CCColor.blue;
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
    /** The color of the text when selected. */
    public get textSelectedColor(): CCColor {return this._textSelectedColor;}
    public set textSelectedColor(value: CCColor) {
        this._textSelectedColor = value;
        this.setNeedsDisplay();
    }
    private _textSelectedColor: CCColor = CCColor.white;
    /** The currently selected button. */
    public get selectedButton(): number {return this._selectedButton;}
    public set selectedButton(value: number) {
        value = Math.floor(value);
        if (value < 0 || value >= this._buttonCount) throw "Button out of range";
        this._selectedButton = value;
        this.setNeedsDisplay();
    }
    private _selectedButton: number = 0;
    /** The number of buttons in the segmented button. */
    public get buttonCount(): number {return this._buttonCount;}
    private _buttonCount: number;

    private buttonText: string[];
    private pressedButton: number | undefined;
    private buttonBounds: number[] = [];

    /**
     * Creates a new segmented button.
     * @param frame The frame for the button. This should have a height of 1.
     * @param buttons The text for each button. This must have at least one button.
     * @param action The action to call when a selection changes
     * @throws If the button text list is empty
     */
    public constructor(frame: CCRect, buttons: string[], action: (this: void, sender: CCSegmentedButton, selection: number) => void) {
        super(frame);
        if (buttons.length === 0) throw "CCSegmentedButton needs at least one button text";
        this.buttonText = buttons;
        this._buttonCount = buttons.length;
        this.action = action;
        this.calculateButtons();
    }

    /**
     * Returns the text for a button by index.
     * @param index The index to get
     * @returns The text for the button, or undefined if out of range
     */
    public getButton(index: number): string | undefined {
        return this.buttonText[index];
    }

    /**
     * Adds a new button to the list of buttons.
     * @param text The text for the button
     * @param index The index to place the number after (defaults to the end)
     */
    public addButton(text: string, index: number = this._buttonCount - 1): void {
        this.buttonText.splice(index, 0, text);
        this.calculateButtons();
        this.setNeedsDisplay();
    }

    /**
     * Removes a button from the list.
     * @param text The text for the button to remove
     * @throws If this would remove the last remaining button
     */
    public removeButton(text: string): void;
    /**
     * Removes a button from the list.
     * @param index The index of the button to remove
     * @throws If the index is out of range, or this would remove the last remaining button
     */
    public removeButton(index: number): void;
    public removeButton(textOrIndex: string | number): void {
        if (this._buttonCount === 1) throw "Cannot remove last remaining button";
        if (typeof textOrIndex === "string") {
            for (let i = 0; i < this._buttonCount; i++) {
                if (this.buttonText[i] === textOrIndex) {
                    this.buttonText.splice(i, 1);
                    this._buttonCount--;
                    this.calculateButtons();
                    this.setNeedsDisplay();
                    return;
                }
            }
        } else {
            if (textOrIndex < 0 || textOrIndex >= this._buttonCount) throw "Index out of range";
            this.buttonText.splice(textOrIndex, 1);
            this._buttonCount--;
            this.calculateButtons();
            this.setNeedsDisplay();
        }
    }

    /**
     * Calculates the positions for each button.
     */
    private calculateButtons(): void {
        let largestButton = this.buttonText[0].length + 2;
        let totalWidth = largestButton;
        for (let i = 1; i < this._buttonCount; i++) {
            largestButton = Math.max(largestButton, this.buttonText[i].length + 3);
            totalWidth += this.buttonText[i].length + 3;
        }
        if (this.frame.width >= largestButton * this._buttonCount - 1) {
            // Enough length to fit all buttons equally
            const size = (this.frame.width + 1) / this._buttonCount;
            for (let i = 0; i < this._buttonCount; i++)
                this.buttonBounds[i] = Math.floor(i * size);
        } else if (this.frame.width >= totalWidth) {
            // Enough length to show all buttons unequally
            const size = this.frame.width / this._buttonCount;
            let extra = this.frame.width - totalWidth;
            let needsExtra = 0;
            for (let i = 0; i < this._buttonCount; i++)
                if (this.buttonText[i].length + 3 < size) needsExtra++;
            let start = 0;
            for (let i = 0; i < this._buttonCount; i++) {
                this.buttonBounds[i] = start;
                if (this.buttonText[i].length + 3 >= size) {
                    start += this.buttonText[i].length + 3;
                } else {
                    let target = Math.floor((i + 1) * size);
                    const next = start + this.buttonText[i].length + 3;
                    if (next < target) {
                        start = next + Math.min(target - next, Math.floor(extra / needsExtra));
                        extra -= start - next;
                    } else {
                        start = next;
                    }
                    needsExtra--;
                }
            }
        } else {
            // Not enough length for all buttons, cut some off
            // TODO: be smarter about this?
            const size = this.frame.width / this._buttonCount;
            for (let i = 0; i < this._buttonCount; i++)
                this.buttonBounds[i] = Math.floor(i * size);
        }
        this.buttonBounds[this._buttonCount] = this.frame.width;
    }

    public draw(rect: CCRect): void {
        let ctx = CCGraphicsContext.current!;
        for (let i = 0; i < this._buttonCount; i++) {
            const width = this.buttonBounds[i+1] - this.buttonBounds[i];
            ctx.color = this._selectedButton === i ? this._buttonSelectedColor : (this.pressedButton === i ? this._buttonActiveColor : this._buttonColor);
            ctx.drawFilledRectangle({x: this.buttonBounds[i] + 1, y: 1, width: width - (i === this._buttonCount - 1 ? 0 : 1), height: 1});
            ctx.color = this._selectedButton === i ? this._textSelectedColor : (this._isEnabled ? this._textColor : this._textDisabledColor);
            ctx.drawText({x: this.buttonBounds[i] + Math.ceil((width - 1 - this.buttonText[i].length) / 2) + 1, y: 1}, this.buttonText[i]);
            ctx.color = this._isEnabled ? this._textColor : this._textDisabledColor;
            if (i < this._buttonCount - 1) ctx.drawTextWithBackground({x: this.buttonBounds[i+1], y: 1}, "|", this._buttonColor);
        }
    }

    public mouseDown(event: CCEvent): void {
        if (!this.isEnabled) return;
        const start = this.convertToWindowSpace({x: 1, y: 1});
        const pos = event.locationInWindow!.x - start.x;
        for (let i = 0; i < this._buttonCount; i++) {
            if (pos >= this.buttonBounds[i] && pos < this.buttonBounds[i+1]) {
                this.pressedButton = i;
                break;
            }
        }
        this.setNeedsDisplay();
    }

    public mouseUp(event: CCEvent): void {
        if (!this.isEnabled || this.pressedButton === undefined) return;
        const start = this.convertToWindowSpace({x: this.buttonBounds[this.pressedButton] + 1, y: 1});
        const end = this.convertToWindowSpace({x: this.buttonBounds[this.pressedButton+1] + 1, y: 1});
        if (event.locationInWindow!.x < start.x || event.locationInWindow!.y < start.y || event.locationInWindow!.x >= end.x || event.locationInWindow!.y > end.y) {
            this.pressedButton = undefined;
            this.setNeedsDisplay();
            return;
        }
        this._selectedButton = this.pressedButton;
        this.pressedButton = undefined;
        this.setNeedsDisplay();
        this.action(this, this._selectedButton);
    }
}
