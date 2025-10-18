import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";

// From CC: Tweaked ROM - cc.strings.wrap
// Copyright 2020 The CC: Tweaked Developers
// Licensed under MPL 2.0

function wrap(text: string, width: number): string[] {
    let lines: string[] = [], lines_n = 0, current_line = "";
    function push_line(): void {
        lines[lines_n] = current_line
        lines_n = lines_n + 1
        current_line = ""
    }

    let pos = 1, length = text.length;
    let sub = string.sub, match = string.match;
    while (pos <= length) {
        let head = sub(text, pos, pos)
        if (head === " " || head === "\t") {
            let whitespace = match(text, "^[ \t]+", pos)[0];
            current_line = current_line + whitespace;
            pos = pos + whitespace.length;
        } else if (head === "\n") {
            push_line();
            pos = pos + 1;
        } else {
            let word = match(text, "^[^ \t\n]+", pos)[0]
            pos = pos + word.length
            if (word.length > width) {
                // Print a multiline word
                while (word.length > 0) {
                    let space_remaining = width - current_line.length - 1;
                    if (space_remaining <= 0) {
                        push_line();
                        space_remaining = width;
                    }

                    current_line = current_line + sub(word, 1, space_remaining)
                    word = sub(word, space_remaining + 1)
                }
            } else {
                // Print a word normally
                if (width - current_line.length < word.length) push_line();
                current_line = current_line + word;
            }
        }
    }

    push_line();

    // Trim whitespace longer than width.
    return lines.map(line => line.substring(0, width));
}

/**
 * A text view displays multiple lines of text with wrapping.  
 * ![Example image](../../images/CCTextView.png)
 * 
 * @example Create a text view.
 * ```ts
 * let textView = new CCTextView({x: 1, y: 1, width: 30, height: 15}, "This is a very long string of text which will need to be wrapped in the view.");
 * this.view.addSubview(textView);
 * ```
 * ```lua
 * local textView = LuaWrappers.new(CCTextView, {x = 1, y = 1, width = 30, height = 15}, "This is a very long string of text which will need to be wrapped in the view.")
 * self.view:addSubview(textView)
 * ```
 * 
 * @category Views
 */
export class CCTextView extends CCView {
    public get frame(): CCRect {return super.frame;}
    public set frame(value: CCRect) {
        super.frame = value;
        this.updateLines();
    }
    /** The text for the view. */
    public get text(): string {return this._text;}
    public set text(value: string) {
        this._text = value;
        this.updateLines();
        this.setNeedsDisplay();
    }
    private _text: string = "";
    /** The color of the text. */
    public get textColor(): CCColor {return this._textColor;}
    public set textColor(value: CCColor) {
        this._textColor = value;
        this.setNeedsDisplay();
    }
    private _textColor: CCColor = CCColor.black;
    /** The wrapping mode for text. */
    public get wrapMode(): CCTextView.WrapMode {return this._wrapMode;}
    public set wrapMode(value: CCTextView.WrapMode) {
        this._wrapMode = value;
        this.updateLines();
        this.setNeedsDisplay();
    }
    private _wrapMode: CCTextView.WrapMode = CCTextView.WrapMode.ByWord;
    /** The alignment of text. */
    public get alignment(): CCTextView.Alignment {return this._alignment;}
    public set alignment(value: CCTextView.Alignment) {
        this._alignment = value;
        this.updateLines();
        this.setNeedsDisplay();
    }
    private _alignment: CCTextView.Alignment = CCTextView.Alignment.Left;
    /** The number of lines visible in the current width. */
    public get lineCount(): number {return this.lines.length;}
    /** Whether to automatically resize the height of the view via constraints. */
    public get autoResizing(): boolean {return this._autoResizing;}
    public set autoResizing(value: boolean) {
        if (value === this._autoResizing) return;
        this._autoResizing = value;
        if (value) {
            this.autoresizingConstraint = new CCLayoutConstraint(this, CCLayoutConstraint.Attribute.Height, CCLayoutConstraint.Relation.Equal, undefined, CCLayoutConstraint.Attribute.NotAnAttribute, 1, this.lines.length);
            this.addConstraint(this.autoresizingConstraint);
        } else {
            this.removeConstraint(this.autoresizingConstraint!);
            this.autoresizingConstraint = undefined;
        }
    }
    private _autoResizing: boolean = false;

    private lines: string[] = [];
    private autoresizingConstraint?: CCLayoutConstraint;

    /**
     * Create a new text view.
     * @param frame The frame for the view
     */
    constructor(frame: CCRect) {
        super(frame);
    }

    public draw(rect: CCRect): void {
        super.draw(rect);
        CCGraphicsContext.current!.color = this._textColor;
        for (let y = 1; y <= this.frame.height && y - 1 < this.lines.length; y++) {
            CCGraphicsContext.current!.drawText({x: 1, y: y}, this.lines[y-1]);
        }
    }

    private updateLines(): void {
        const width = this.frame.width;
        switch (this._wrapMode) {
            case CCTextView.WrapMode.Clip:
                this.lines = this._text.split("\n").map(value => value.substring(0, width));
                break;
            case CCTextView.WrapMode.ByCharacter:
                this.lines = this._text.split("\n").flatMap(value => {
                    let retval = [];
                    for (let x = 0; x < value.length; x += width)
                        retval.push(value.substring(x, x + width));
                    return retval;
                });
                break;
            case CCTextView.WrapMode.ByWord:
                this.lines = wrap(this._text, width);
                break;
        }
        for (let [i, l] of ipairs(this.lines)) {
            if (l.length < width) {
                switch (this._alignment) {
                    case CCTextView.Alignment.Center:
                        l = string.rep(" ", (width - l.length) / 2) + l;
                        break;
                    case CCTextView.Alignment.Right:
                        l = string.rep(" ", width - l.length) + l;
                        break;
                    case CCTextView.Alignment.Justified:
                        const count = string.gsub(l, " ", " ")[1];
                        const expand = (width - l.length) / count;
                        let n = 0;
                        l = string.gsub(l, " ", () => {
                            const nn = n + expand;
                            const c = math.floor(nn) - math.floor(n) + 1;
                            n = nn;
                            return string.rep(" ", c);
                        })[0];
                        break;
                }
                this.lines[i-1] = l;
            }
        }
        if (this.autoresizingConstraint !== undefined && this.autoresizingConstraint.constant !== this.lines.length) {
            this.autoresizingConstraint.constant = this.lines.length;
            this.setNeedsLayout(this, this);
        }
    }
}

/**
 * @category Views
 */
export namespace CCTextView {
    /** The way to wrap text in a text view. */
    export enum WrapMode {
        /** Do not automatically wrap - clip text instead, but respect newlines. */
        Clip,
        /** Wrap automatically by character. */
        ByCharacter,
        /** Wrap automatically by word. */
        ByWord
    };

    /** The way to align text in a text view. */
    export enum Alignment {
        /** Align text to the left edge (default). */
        Left,
        /** Align text in the center. */
        Center,
        /** Align text to the right edge. */
        Right,
        /** Justify text to the left and right edges. */
        Justified
    }
}

export default CCTextView;
