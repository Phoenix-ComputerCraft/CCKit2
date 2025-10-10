import CCView from "CCKit2/CCView";
import { CCColor, CCKey, CCPoint, CCRect, CCSize } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCEvent from "CCKit2/CCEvent";

class InnerView extends CCView {
    private scrollPos: CCPoint;
    public constructor(frame: CCRect, scrollPos: CCPoint) {
        super(frame);
        this.scrollPos = scrollPos;
    }
    public convertToWindowSpace(point: CCPoint): CCPoint {
        if (this.superview === undefined) return point;
        return this.superview.convertToWindowSpace({x: this.frame.x + point.x - 1, y: this.frame.y + point.y - this.scrollPos.y - 1});
    }
}

/**
 * A scroll view displays larger content inside a smaller view, which can be
 * scrolled to see the whole content.  
 * ![Example image](../../images/CCScrollView.png)
 * @category Views
 */
export default class CCScrollView extends CCView {
    /** The view that holds the scroll view content. */
    public get contentView(): CCView {return this.subviews[0];}
    /** Whether to show the vertical scrollbar. */
    public get showVerticalScrollBar(): boolean {return this._showVerticalScrollBar;}
    public set showVerticalScrollBar(value: boolean) {
        this._showVerticalScrollBar = value;
        this.setNeedsDisplay();
        // TODO: update content view frame
    }
    private _showVerticalScrollBar: boolean;
    /** Whether to show the horizontal scrollbar. */
    public get showHorizontalScrollBar(): boolean {return this._showHorizontalScrollBar;}
    public set showHorizontalScrollBar(value: boolean) {
        this._showHorizontalScrollBar = value;
        this.setNeedsDisplay();
    }
    private _showHorizontalScrollBar: boolean;
    /** The current position of scrolling. */
    public get scrollPosition(): CCPoint {
        return {x: 1 + this.scrollPos.x, y: 1 + this.scrollPos.y};
    }
    public set scrollPosition(value: CCPoint) {
        this.scrollPos.x = Math.min(Math.max(value.x - 1, 0), Math.max(this.subviews[0].frame.width - this.frame.width - 1, 0));
        this.scrollPos.y = Math.min(Math.max(value.y - 1, 0), Math.max(this.subviews[0].frame.height - this.frame.height - 1, 0));
        this.setNeedsDisplay();
    }

    private scrollPos: CCPoint = {x: 0, y: 0};
    private horizontalClicked = false;
    private verticalClicked = false;

    /**
     * Creates a new scroll view.
     * @param frame The frame for the scroll view
     * @param innerSize The size of the inner view
     */
    constructor(frame: CCRect, innerSize: CCSize) {
        super(frame);
        let inner = new InnerView({x: 1, y: 1, width: Math.max(innerSize.width, frame.width), height: Math.max(innerSize.height, frame.height)}, this.scrollPos);
        inner.backgroundColor = CCColor.white;
        super.addSubview(inner);
        this._showVerticalScrollBar = innerSize.height > frame.height;
        this._showHorizontalScrollBar = innerSize.width > frame.width;
    }

    /**
     * Resizes the content view to the specified size.
     * @param innerSize The new size of the inner view
     */
    public resizeContentView(innerSize: CCSize): void {
        this.subviews[0].frame = {x: 1, y: 1, width: Math.max(innerSize.width, this.frame.width), height: Math.max(innerSize.height, this.frame.height)};
        this.scrollPos.x = Math.min(this.scrollPos.x, Math.max(this.subviews[0].frame.width - this.frame.width - 1, 0));
        this.scrollPos.y = Math.min(this.scrollPos.y, Math.max(this.subviews[0].frame.height - this.frame.height - 1, 0));
        this._showVerticalScrollBar = innerSize.height > this.frame.height;
        this._showHorizontalScrollBar = innerSize.width > this.frame.width;
        this.setNeedsDisplay();
    }

    public addSubview(view: CCView): void {
        this.subviews[0].addSubview(view);
    }

    /**
     * Draws the scroll bars.
     */
    private drawScrollBars(): void {
        let ctx = CCGraphicsContext.current!;
        if (this._showVerticalScrollBar) {
            const height = this._showHorizontalScrollBar ? this.frame.height - 1 : this.frame.height;
            ctx.color = CCColor.lightGray;
            ctx.drawLine({x: this.frame.width, y: 1}, {x: this.frame.width, y: height});
            ctx.color = CCColor.gray;
            ctx.drawLine({x: this.frame.width, y: Math.floor(this.scrollPos.y / this.subviews[0].frame.height * height) + 1}, {x: this.frame.width, y: Math.ceil((this.scrollPos.y + this.frame.height) / this.subviews[0].frame.height * height)});
        }
        if (this._showHorizontalScrollBar) {
            const width = this._showVerticalScrollBar ? this.frame.width - 1 : this.frame.width;
            ctx.color = CCColor.lightGray;
            ctx.drawLine({x: 1, y: this.frame.height}, {x: width + 1, y: this.frame.height});
            ctx.color = CCColor.gray;
            ctx.drawLine({x: Math.floor(this.scrollPos.x / this.subviews[0].frame.width * width + 0.5) + 1, y: this.frame.height}, {x: Math.floor((this.scrollPos.x + this.frame.width) / this.subviews[0].frame.width * width + 0.5) + 1, y: this.frame.height});
        }
    }

    public display(rect: CCRect): void {
        let ctx = CCGraphicsContext.current!;
        ctx.pushState();
        if (this._showVerticalScrollBar) ctx.setSize({width: ctx.size.width - 1, height: ctx.size.height});
        if (this._showHorizontalScrollBar) ctx.setSize({width: ctx.size.width, height: ctx.size.height - 1});
        ctx.pushState();
        ctx.setVirtualOrigin({x: -this.scrollPos.x, y: -this.scrollPos.y});
        if (this.needsDraw) {
            this.needsDraw = false;
            for (let view of this.subviews) view.needsDraw = true;
        }
        this.subviews[0].display({x: rect.x + this.scrollPos.x, y: rect.y + this.scrollPos.y, width: rect.width - (this._showVerticalScrollBar ? 1 : 0), height: rect.height - (this._showHorizontalScrollBar ? 1 : 0)});
        ctx.popState();
        if (this.subviews.length > 1) {
            ctx.setVirtualOrigin({x: -this.scrollPos.x, y: 0});
            for (let i = 1; i < this.subviews.length; i++) this.subviews[i].display({x: rect.x + this.scrollPos.x, y: rect.y, width: rect.width - (this._showVerticalScrollBar ? 1 : 0), height: rect.height - (this._showHorizontalScrollBar ? 1 : 0)});
        }
        ctx.popState();
        this.drawScrollBars();
    }

    public convertToWindowSpace(point: CCPoint): CCPoint {
        if (this.superview === undefined) return point;
        return this.superview.convertToWindowSpace({x: this.frame.x + point.x - this.scrollPos.x - 1, y: this.frame.y + point.y - 1});
    }

    public hitTest(point: CCPoint): CCView | undefined {
        if (!(point.x >= this.frame.x && point.y >= this.frame.y && point.x < this.frame.x + this.frame.width && point.y < this.frame.y + this.frame.height))
            return undefined;
        if ((this._showVerticalScrollBar && point.x === this.frame.x + this.frame.width - 1) || (this._showHorizontalScrollBar && point.y === this.frame.y + this.frame.height - 1))
            return this;
        for (let i = this.subviews.length - 1; i > 0; i--) {
            let v = this.subviews[i].hitTest({x: point.x - this.frame.x + this.scrollPos.x + 1, y: point.y - this.frame.y + 1});
            if (v !== undefined) return v;
        }
        return this.subviews[0].hitTest({x: point.x - this.frame.x + this.scrollPos.x + 1, y: point.y - this.frame.y + this.scrollPos.y + 1});
    }

    public scrollWheel(event: CCEvent): void {
        this.scrollPos.y = Math.min(Math.max(this.scrollPos.y + event.scrollDirection!, 0), Math.max(this.subviews[0].frame.height - this.frame.height + (this._showHorizontalScrollBar ? 1 : 0), 0));
        this.setNeedsDisplay();
    }

    public horizontalScrollWheel(event: CCEvent): void {
        this.scrollPos.x = Math.min(Math.max(this.scrollPos.x + event.scrollDirection!, 0), Math.max(this.subviews[0].frame.width - this.frame.width + (this._showVerticalScrollBar ? 1 : 0), 0));
        this.setNeedsDisplay();
    }
}
