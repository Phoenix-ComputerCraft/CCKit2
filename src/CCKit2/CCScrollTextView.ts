import CCScrollView from "CCKit2/CCScrollView";
import CCTextView from "CCKit2/CCTextView";
import { CCColor, CCRect } from "CCKit2/CCTypes";

/**
 * A scrolling text view displays long text in a vertically scrolling view.
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
    /** The number of lines visible in the current frame. */
    public get lineCount(): number {return this.textView.lineCount;}

    private textView: CCTextView

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

    private updateSize(): void {
        let height = this.textView.lineCount;
        if (height < 1) height = 1;
        this.resizeContentView({width: this.frame.width - 1, height});
        this.textView.frame = {x: 1, y: 1, width: this.frame.width - 1, height};
    }
}
