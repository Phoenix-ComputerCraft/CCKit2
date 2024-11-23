import CCResponder from "CCKit2/CCResponder";
import { CCColor, CCPoint, CCRect, CCRectIntersection } from "CCKit2/CCTypes";
import CCWindow from "CCKit2/CCWindow";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * The CCView class is the base for all displayable objects on screen. It
 * handles rendering the element, resizing subviews, and user interaction.
 * Subclasses can override the default behavior to provide custom elements.
 */
export default class CCView extends CCResponder {
    /** The background color of the view. */
    public get backgroundColor(): CCColor|undefined {return this._backgroundColor;}
    public set backgroundColor(value: CCColor|undefined) {
        this._backgroundColor = value;
        this.setNeedsDisplay();
    }
    private _backgroundColor: CCColor|undefined = undefined;
    /** Whether the view is hidden. */
    public isHidden: boolean = false;
    /** Whether user interaction is enabled for this view. */
    public userInteractionEnabled: boolean = true;
    /** The position and size of the view. */
    public get frame(): CCRect {return this._frame;}
    public set frame(rect: CCRect) {
        if ((rect.width < this._frame.width || rect.height < this._frame.height) && this.superview)
            this.superview.setNeedsDisplay();
        this._frame = rect;
        this.setNeedsDisplay();
        // TODO: update window on screen
    }
    private _frame: CCRect;
    /** The view that contains this view, if it exists. */
    public superview?: CCView;
    /** The list of subviews inside this view. */
    public subviews: CCView[] = [];
    /** The window this view is located inside. */
    public window?: CCWindow;
    /** Whether the view is currently focused. */
    public isFocused: boolean = false;
    /** Whether the view needs to be redrawn. */
    public needsDraw: boolean = true;

    /**
     * Creates a new view with the specified frame rect.
     * @param frame The view rectangle for the frame
     * @typecheck
     */
    public constructor(frame: CCRect) {
        super();
        this._frame = frame;
    }

    /**
     * Adds a subview to this view.
     * @param view The view to add
     */
    public addSubview(view: CCView): void {
        this.subviews.push(view);
        view.superview = this;
        view.window = this.window;
        view.needsDraw = true;
        this.needsDraw = true;
        this.didAddSubview(view);
        view.didMoveToSuperview();
    }

    /**
     * Moves a subview so it appears on top of its sibling views.
     * @param view The view to move
     */
    public bringSubviewToFront(view: CCView): void {
        throw "Not implemented";
    }

    /**
     * Moves a subview so it appears under its sibling views.
     * @param view The view to move
     */
    public sendSubviewToBack(view: CCView): void {
        throw "Not implemented";
    }

    // TODO: add rest

    /**
     * Called when a subview was added to this view.
     * @param view The new view that was added
     */
    public didAddSubview(view: CCView): void {

    }

    /**
     * Called when the superview of this view changes.
     */
    public didMoveToSuperview(): void {
        for (let view of this.subviews) {
            if (view.window !== this.window) {
                view.window = this.window;
                view.didMoveToSuperview();
            }
        }
    }

    // TODO: add rest

    // TODO: constraints

    /**
     * Draws the view inside the specified rectangle. Override this function to
     * provide custom view types.
     * @param rect The rectangle to draw inside
     */
    public draw(rect: CCRect): void {
        if (this.backgroundColor === undefined || this.window === undefined) return;
        CCGraphicsContext.current.color = this.backgroundColor;
        CCGraphicsContext.current.drawFilledRectangle(rect);
    }

    /**
     * Displays a view in the specified rectangle. This should not be called by
     * other code.
     * @param rect The rectangle to draw inside
     * @package
     */
    public display(rect: CCRect): void {
        const needsDraw = this.needsDraw;
        if (needsDraw) {
            this.needsDraw = false;
            this.draw(rect);
        }
        for (let view of this.subviews) {
            if (needsDraw) view.needsDraw = true;
            let vr = CCRectIntersection(view.frame, rect);
            vr.x = vr.x - view.frame.x + 1;
            vr.y = vr.y - view.frame.y + 1;
            if (vr.width > 0 && vr.height > 0) {
                CCGraphicsContext.current.pushState();
                CCGraphicsContext.current.setRect(view.frame);
                view.display(vr);
                CCGraphicsContext.current.popState();
            }
        }
    }

    /**
     * Sets the view as requiring a full redraw.
     */
    public setNeedsDisplay(): void {
        this.needsDraw = true;
        if (this.window) this.window.viewsNeedDisplay = true;
    }

    /**
     * Returns the window coordinates of the specified point.
     * @param point The point to convert
     */
    public convertToWindowSpace(point: CCPoint): CCPoint {
        if (this.superview === undefined) return point;
        return this.superview.convertToWindowSpace({x: this.frame.x + point.x - 1, y: this.frame.y + point.y - 1})
    }

    /**
     * Returns the furthest descendant that contains the specified point.
     * @param point The point to look for
     * @returns The deepest view that hit the point, or undefined if none was found
     */
    public hitTest(point: CCPoint): CCView | undefined {
        if (!(point.x >= this._frame.x && point.y >= this._frame.y && point.x < this._frame.x + this._frame.width && point.y < this._frame.y + this._frame.height))
            return undefined;
        for (let i = this.subviews.length - 1; i >= 0; i--) {
            if (!this.subviews[i].isHidden) {
                let view = this.subviews[i].hitTest({x: point.x - this._frame.x + 1, y: point.y - this._frame.y + 1});
                if (view !== undefined) return view;
            }
        }
        return this;
    }
}
