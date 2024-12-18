import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

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
 */
class CCTextView extends CCView {
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

    private lines: string[] = [];

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
    }
}

namespace CCTextView {
    /** The way to wrap text in a text view. */
    export enum WrapMode {
        /** Do not automatically wrap - clip text instead, but respect newlines. */
        Clip,
        /** Wrap automatically by character. */
        ByCharacter,
        /** Wrap automatically by word. */
        ByWord
    };
}

export default CCTextView;
