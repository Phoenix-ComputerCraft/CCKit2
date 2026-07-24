import CCScrollView from "CCKit2/CCScrollView";
import CCTextView from "CCKit2/CCTextView";
import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import { JSX } from "CCKit2/CCJSX";

/**
 * A scrolling text view displays long text in a vertically scrolling view.
 * 
 * @example Create a scrolling text view.
 * ```ts
 * let textView = new CCScrollTextView({x: 1, y: 1, width: 30, height: 15}, "This is a very long string of text which will need to be wrapped in the view.");
 * this.view.addSubview(textView);
 * ```
 * ```lua
 * local textView = LuaWrappers.new(CCScrollTextView, {x = 1, y = 1, width = 30, height = 15}, "This is a very long string of text which will need to be wrapped in the view.")
 * self.view:addSubview(textView)
 * ```
 * 
 * @category Views
 */
export default class CCScrollTextView extends CCScrollView {
    public get frame(): CCRect {return super.frame;}
    public set frame(value: CCRect) {
        super.frame = value;
        this.textView.frame = {x: 1, y: 1, width: value.width - 1, height: 1};
        this.updateSize();
    }
    /** The text for the view. */
    public get text(): string {return this.textView.text;}
    public set text(value: string) {
        this.textView.text = value;
        this.updateSize();
    }
    /** The color of the text. */
    public get textColor(): CCColor {return this.textView.textColor;}
    public set textColor(value: CCColor) {
        this.textView.textColor = value;
    }
    /** The wrapping mode for text. */
    public get wrapMode(): CCTextView.WrapMode {return this.textView.wrapMode;}
    public set wrapMode(value: CCTextView.WrapMode) {
        this.textView.wrapMode = value;
        this.updateSize();
    }
    /** The alignment of text. */
    public get alignment(): CCTextView.Alignment {return this.textView.alignment;}
    public set alignment(value: CCTextView.Alignment) {
        this.textView.alignment = value;
    }
    /** The number of lines visible in the current frame. */
    public get lineCount(): number {return this.textView.lineCount;}

    private textView: CCTextView;

    /**
     * Creates a new scrolling text view.
     * @param frame The frame for the view
     * @param text The initial text for the view, if desired (defaults to empty)
     */
    public constructor(frame: CCRect, text?: string) {
        super(frame, {width: frame.width - 1, height: 1});
        this.textView = new CCTextView({x: 1, y: 1, width: frame.width - 1, height: 1});
        if (text !== undefined) this.textView.text = text;
        this.addSubview(this.textView);
        this.updateSize();
    }

    public loadJSXAttributes(attrs: JSX.AttributesFor<CCScrollTextView, {frame: JSX.AttributeValues<CCRect>, wrapMode?: keyof typeof CCTextView.WrapMode, alignment?: keyof typeof CCTextView.Alignment}>): void {
        super.loadJSXAttributes(attrs);
        if (attrs.textColor !== undefined) this.textView.textColor = typeof attrs.textColor === "number" ? attrs.textColor : CCColor[attrs.textColor];
        if (attrs.wrapMode !== undefined) this.textView.wrapMode = CCTextView.WrapMode[attrs.wrapMode];
        if (attrs.alignment !== undefined) this.textView.alignment = CCTextView.Alignment[attrs.alignment];
        this.updateSize();
    }

    private updateSize(): void {
        let height = this.textView.lineCount;
        if (height < 1) height = 1;
        this.resizeContentView({width: this.frame.width - 1, height});
        this.textView.frame = {x: 1, y: 1, width: this.frame.width - 1, height};
    }
}

/**
 * Creates a new JSX element.
 * @param attrs The attributes for the element
 * @returns The new element
 */
export function JSX(attrs: JSX.AttributesFor<CCScrollTextView, {frame: JSX.AttributeValues<CCRect>, wrapMode?: keyof typeof CCTextView.WrapMode, alignment?: keyof typeof CCTextView.Alignment}>, text: string | undefined, parameters: JSX.ParameterElements[]): CCView {
    const f: number[] = attrs.frame.split(" ").map(n => tonumber(n)) as number[];
    if (f.length < 4) throw "Bad frame attribute in JSX code";
    let retval = new CCScrollTextView({x: f[0], y: f[1], width: f[2], height: f[3]}, text);
    retval.loadJSXAttributes(attrs);
    return retval;
}
