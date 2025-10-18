import CCSegmentedButton from "CCKit2/CCSegmentedButton";
import CCView from "CCKit2/CCView";
import { CCColor, CCPoint, CCRect, CCRectIntersection } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A tab view allows switching between multiple tabbed views in a single parent
 * view, using a segmented button to select each tab.  
 * ![Example image](../../images/CCTabView.png)
 * 
 * @example Create a tab view with two text views inside.
 * ```ts
 * let tabView = new CCTabView({x: 1, y: 1, width: 30, height: 15}, ["First", "Second"]);
 * this.view.addSubview(tabView);
 * tabView.contentViewAt(0).addSubview(new CCTextView({x: 1, y: 1, width: 28, height: 13}, firstText));
 * tabView.contentViewAt(1).addSubview(new CCTextView({x: 1, y: 1, width: 28, height: 13}, secondText));
 * ```
 * ```lua
 * local tabView = LuaWrappers.new(CCTabView, {x = 1, y = 1, width = 30, height = 15}, {"First", "Second"})
 * self.view:addSubview(tabView)
 * tabView:contentViewAt(0):addSubview(LuaWrappers.new(CCTextView, {x = 1, y = 1, width = 28, height = 13}, firstText))
 * tabView:contentViewAt(1):addSubview(LuaWrappers.new(CCTextView, {x = 1, y = 1, width = 28, height = 13}, secondText))
 * ```
 * 
 * @category Views
 */
export default class CCTabView extends CCView {
    public get frame(): CCRect {return super.frame;}
    public set frame(value: CCRect) {
        super.frame = value;
        for (let v of this.contentViews) {
            v.frame = {x: 2, y: 2, width: value.width - 2, height: value.height - 2};
        }
        this.selector.frame.width = Math.min(this.selector.frame.width, value.width - 2);
        this.selector.frame.x = Math.floor((value.width - this.selector.frame.width) / 2) + 1;
        this.selector.setNeedsDisplay();
    }
    /** The index of the currently selected view. */
    public get selectedView(): number {return this._selectedView;}
    public set selectedView(value: number) {
        this.selector.selectedButton = value;
        this.selectView(value);
    }
    private _selectedView: number = 0;
    /** The color of the border. */
    public get borderColor(): CCColor {return this._borderColor;}
    public set borderColor(value: CCColor) {
        this._borderColor = value;
        this.setNeedsDisplay();
    }
    private _borderColor: CCColor = CCColor.lightGray;

    private contentViews: CCView[] = [];
    private selector: CCSegmentedButton;

    /**
     * Creates a new tab view.
     * @param frame The frame for the tab view
     * @param tabs The labels for each tab
     */
    public constructor(frame: CCRect, tabs: string[]) {
        super(frame);
        this.backgroundColor = CCColor.white;
        if (tabs.length === 0) throw "CCTabView needs at least one tab";
        let maxWidth = 0;
        for (let i = 0; i < tabs.length; i++) {
            maxWidth = Math.max(maxWidth, tabs[i].length + 3);
            this.contentViews[i] = new CCView({x: 2, y: 2, width: frame.width - 2, height: frame.height - 2});
            this.addSubview(this.contentViews[i]);
        }
        const width = Math.min(maxWidth * tabs.length - 1, frame.width - 2);
        this.selector = new CCSegmentedButton({x: Math.floor((this.frame.width - width) / 2) + 1, y: 1, width: width, height: 1}, tabs, (_, selected) => this.selectView(selected));
        this.addSubview(this.selector);
        this.subviews = [this.selector, this.contentViews[0]];
    }

    private selectView(index: number): void {
        this._selectedView = index;
        this.subviews = [this.selector, this.contentViews[index]];
        this.setNeedsDisplay();
    }

    /**
     * Returns the content view at the specified (0-based) index.
     * @param index The index to get
     * @returns The view for the index
     * @throws If the index is out of range
     */
    public contentViewAt(index: number): CCView {
        if (index < 0 || index >= this.contentViews.length) throw "Index out of range";
        return this.contentViews[index];
    }

    /**
     * Adds a new tab to the view.
     * @param label The label for the tab
     * @param index The index to insert the tab at (defaults to the end)
     */
    public addTab(label: string, index: number = this.selector.buttonCount - 1): void {
        this.selector.addButton(label, index);
        this.selector.frame.width = Math.min(this.selector.frame.width + label.length + 3, this.frame.width - 2);
        this.selector.frame.x = Math.floor((this.frame.width - this.selector.frame.width) / 2) + 1;
        this.contentViews.splice(index, 0, new CCView({x: 2, y: 2, width: this.frame.width - 2, height: this.frame.height - 2}));
        this.setNeedsDisplay();
    }

    public didMoveToSuperview(): void {
        super.didMoveToSuperview();
        for (let view of this.contentViews) {
            if (view.window !== this.window) {
                view.window = this.window;
                view.didMoveToSuperview();
            }
        }
    }

    public setNeedsLayout(sender: CCView, previous: CCView): void {
        super.setNeedsLayout(sender, previous);
        for (const subview of this.contentViews) {
            if (subview !== previous) {
                subview.setNeedsLayout(sender, this);
                if (this.needsLayout) subview.setNeedsLayout(this, this);
            }
        }
    }

    public draw(rect: CCRect): void {
        super.draw(rect);
        let ctx = CCGraphicsContext.current!;
        ctx.color = this._borderColor;
        ctx.drawText({x: 1, y: 1}, string.char(0x9C) + string.rep(string.char(0x8C), this.frame.width - 2));
        ctx.drawTextInverted({x: this.frame.width, y: 1}, string.char(0x93));
        ctx.drawText({x: 1, y: this.frame.height}, string.char(0x8D) + string.rep(string.char(0x8C), this.frame.width - 2) + string.char(0x8E));
        for (let y = 2; y < this.frame.height; y++) {
            ctx.drawText({x: 1, y: y}, string.char(0x95));
            ctx.drawTextInverted({x: this.frame.width, y: y}, string.char(0x95));
        }
    }
}
