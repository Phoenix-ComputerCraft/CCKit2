import CCResponder from "CCKit2/CCResponder";
import { CCColor, CCPoint, CCRect, CCRectIntersection } from "CCKit2/CCTypes";
import CCWindow from "CCKit2/CCWindow";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";

function addLayoutRow(rows: CCRect[][], constants: number[], size: number, firstOffset: number, firstValues: CCRect, secondOffset: number|undefined, secondValues: CCRect|undefined, constant: number): void {
    let row: CCRect[] = [];
    for (let i = 0; i < size; i++) row.push({x: 0, y: 0, width: 0, height: 0});
    row[firstOffset] = firstValues;
    if (secondOffset !== undefined) row[secondOffset] = secondValues!;
    rows.push(row);
    constants.push(constant);
}

const LayoutAttributes: {[name: string]: CCLayoutConstraint.Attribute | undefined} = {
    Left: CCLayoutConstraint.Attribute.Left,
    Right: CCLayoutConstraint.Attribute.Right,
    Top: CCLayoutConstraint.Attribute.Top,
    Bottom: CCLayoutConstraint.Attribute.Bottom,
    Leading: CCLayoutConstraint.Attribute.Leading,
    Trailing: CCLayoutConstraint.Attribute.Trailing,
    Width: CCLayoutConstraint.Attribute.Width,
    Height: CCLayoutConstraint.Attribute.Height,
    CenterX: CCLayoutConstraint.Attribute.CenterX,
    CenterY: CCLayoutConstraint.Attribute.CenterY,
    LastBaseline: CCLayoutConstraint.Attribute.LastBaseline,
    FirstBaseline: CCLayoutConstraint.Attribute.FirstBaseline
};

const PropertyNames = ["Left", "Top", "Width", "Height"];

/**
 * The CCView class is the base for all displayable objects on screen. It
 * handles rendering the element, resizing subviews, and user interaction.
 * Subclasses can override the default behavior to provide custom elements.
 * @category Views
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
    public get frame(): CCRect {return this._frame;} // TODO: modification of inner values
    public set frame(rect: CCRect) {
        if (this.isLayingOut) {
            this._frame = rect;
            return;
        }
        if (rect.x == this._frame.x && rect.y == this._frame.y && rect.width == this._frame.width && rect.height == this._frame.height) return;
        if ((rect.width < this._frame.width || rect.height < this._frame.height) && this.superview)
            this.superview.setNeedsDisplay();
        this._frame = rect;
        this.setNeedsDisplay();
        this.setNeedsLayout(this, this);
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
    /** Whether the view needs to be laid out. */
    public needsLayout: boolean = false;
    /** Whether constraints need to be updated. */
    public needsUpdateConstraints: boolean = false;

    private constraints: CCLayoutConstraint[] = [];
    private isLayingOut: boolean = false;

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
        view.nextResponder = this;
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

    /**
     * Draws the view inside the specified rectangle. Override this function to
     * provide custom view types.
     * @param rect The rectangle to draw inside
     */
    public draw(rect: CCRect): void {
        if (this.backgroundColor === undefined || this.window === undefined) return;
        CCGraphicsContext.current!.color = this.backgroundColor;
        CCGraphicsContext.current!.drawFilledRectangle(rect);
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
                CCGraphicsContext.current!.pushState();
                CCGraphicsContext.current!.setRect(view.frame);
                view.display(vr);
                CCGraphicsContext.current!.popState();
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

    /**
     * Adds a constraint to the view. The first item of the constraint MUST be
     * this view.
     * @param constraint The constraint to add
     * @see CCLayoutConstraint.active A safer way to enable a constraint
     * @typecheck
     */
    public addConstraint(constraint: CCLayoutConstraint): void {
        if (constraint.firstItem !== this) throw "Invalid constraint for view";
        this.constraints.push(constraint);
        this.setNeedsLayout(this, this);
    }

    /**
     * Removes a constraint from the view. The first item of the constraint MUST
     * be this view.
     * @param constraint The constraint to add
     * @see CCLayoutConstraint.active A safer way to enable a constraint
     * @typecheck
     */
    public removeConstraint(constraint: CCLayoutConstraint): void {
        if (constraint.firstItem !== this) throw "Invalid constraint for view";
        const item = this.constraints.indexOf(constraint);
        if (item === -1) return;
        this.constraints.splice(item);
        this.setNeedsLayout(this, this);
    }

    /**
     * Adds a list of constraints to the view. The first item of the constraints
     * MUST be this view.
     * @param constraints The constraints to add
     * @see CCLayoutConstraint.active A safer way to enable a constraint
     * @typecheck
     */
    public addConstraints(constraints: CCLayoutConstraint[]): void {
        for (let constraint of constraints) {
            if (constraint.firstItem !== this) throw "Invalid constraint for view";
            this.constraints.push(constraint);
        }
        this.setNeedsLayout(this, this);
    }

    /**
     * Adds a number of constraints to views using code. This can simplify
     * settings constraints by using familiar code syntax instead of lengthy
     * constraint constructions and activations.
     * 
     * The syntax is fairly simple:
     *     
     *     <ViewName>.<Attribute> = [<Multiplier> *] <ViewName>.<Attribute> [+|- <Constant>]
     *     <ViewName>.<Attribute> = <Constant>
     * 
     * The code is processed using Lua as the parser, so it's not strictly
     * required to be in exactly this format; but mind that operators other than
     * add/sub/mul/div/unm aren't supported (and division is only valid if the
     * divisor is a number), and no libraries are available in the environment.
     * 
     * @param code The constraint code to apply
     * @param views A key-value map of names of views in the code, to the views they represent
     */
    public static addConstraintsByCode(code: string, views: {[name: string]: CCView}): void {
        let attr_mt = new LuaTable();
        attr_mt.set("__name", "attribute");
        attr_mt.set("__add", function(this: void, a: any, b: any): LuaTable {
            let attr = new LuaTable();
            if (type(b) === "table" && getmetatable(b) === attr_mt) {
                if (type(a) === "number") {
                    attr.set("view", (b as LuaTable).get("view"));
                    attr.set("attribute", (b as LuaTable).get("attribute"));
                    attr.set("multiplier", (b as LuaTable).get("multiplier"));
                    attr.set("constant", (b as LuaTable).get("constant") as number + a as number);
                } else {
                    error("attempt to add " + type(a) + " and attribute", 2);
                }
            } else { // a is object
                if (type(b) === "number") {
                    attr.set("view", (a as LuaTable).get("view"));
                    attr.set("attribute", (a as LuaTable).get("attribute"));
                    attr.set("multiplier", (a as LuaTable).get("multiplier"));
                    attr.set("constant", (a as LuaTable).get("constant") as number + b as number);
                } else {
                    error("attempt to add attribute and " + type(b), 2);
                }
            }
            return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
        });
        attr_mt.set("__sub", function(this: void, a: any, b: any): LuaTable {
            let attr = new LuaTable();
            if (type(b) === "table" && getmetatable(b) === attr_mt) {
                if (type(a) === "number") {
                    attr.set("view", (b as LuaTable).get("view"));
                    attr.set("attribute", (b as LuaTable).get("attribute"));
                    attr.set("multiplier", (b as LuaTable).get("multiplier") as number * -1);
                    attr.set("constant", (b as LuaTable).get("constant") as number + a as number);
                } else {
                    error("attempt to subtract " + type(a) + " and attribute", 2);
                }
            } else { // a is object
                if (type(b) === "number") {
                    attr.set("view", (a as LuaTable).get("view"));
                    attr.set("attribute", (a as LuaTable).get("attribute"));
                    attr.set("multiplier", (a as LuaTable).get("multiplier"));
                    attr.set("constant", (a as LuaTable).get("constant") as number - b as number);
                } else {
                    error("attempt to subtract attribute and " + type(b), 2);
                }
            }
            return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
        });
        attr_mt.set("__mul", function(this: void, a: any, b: any): LuaTable {
            let attr = new LuaTable();
            if (type(b) === "table" && getmetatable(b) === attr_mt) {
                if (type(a) === "number") {
                    attr.set("view", (b as LuaTable).get("view"));
                    attr.set("attribute", (b as LuaTable).get("attribute"));
                    attr.set("multiplier", (b as LuaTable).get("multiplier") as number * a as number);
                    attr.set("constant", (b as LuaTable).get("constant") as number * a as number);
                } else {
                    error("attempt to multiply " + type(a) + " and attribute", 2);
                }
            } else { // a is object
                if (type(b) === "number") {
                    attr.set("view", (a as LuaTable).get("view"));
                    attr.set("attribute", (a as LuaTable).get("attribute"));
                    attr.set("multiplier", (a as LuaTable).get("multiplier") as number * b as number);
                    attr.set("constant", (a as LuaTable).get("constant") as number * b as number);
                } else {
                    error("attempt to multiply attribute and " + type(b), 2);
                }
            }
            return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
        });
        attr_mt.set("__div", function(this: void, a: any, b: any): LuaTable {
            let attr = new LuaTable();
            if (type(b) === "table" && getmetatable(b) === attr_mt) {
                error("attempt to divide attribute and " + type(b), 2);
            } else { // a is object
                if (type(b) === "number") {
                    attr.set("view", (a as LuaTable).get("view"));
                    attr.set("attribute", (a as LuaTable).get("attribute"));
                    attr.set("multiplier", (a as LuaTable).get("multiplier") as number * b as number);
                    attr.set("constant", (a as LuaTable).get("constant") as number * b as number);
                } else {
                    error("attempt to divide " + type(a) + " and attribute", 2);
                }
            }
            return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
        });
        attr_mt.set("__unm", function(this: void, a: LuaTable): LuaTable {
            let attr = new LuaTable();
            attr.set("view", a.get("view"));
            attr.set("attribute", a.get("attribute"));
            attr.set("multiplier", a.get("multiplier") as number * -1);
            attr.set("constant", a.get("constant") as number * -1);
            return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
        });

        let view_mt = new LuaTable();
        view_mt.set("__name", "view");
        view_mt.set("__index", function(this: void, self: LuaTable, key: any): LuaTable|undefined {
            if (LayoutAttributes[key] !== undefined) {
                let attr = new LuaTable();
                attr.set("view", self.get("view"));
                attr.set("attribute", key);
                attr.set("multiplier", 1);
                attr.set("constant", 0);
                return setmetatable(attr, attr_mt as LuaMetatable<LuaTable>);
            } else {
                return undefined;
            }
        });
        let constraints: CCLayoutConstraint[] = [];
        view_mt.set("__newindex", function(this: void, self: LuaTable, key: any, value: any): void {
            if (LayoutAttributes[key] === undefined) return undefined;
            if (type(value) === "table" && getmetatable(value) === attr_mt) {
                //print((self.get("view") as string) + "." + key + " = " + (value as LuaTable).get("multiplier") + " * " + (value as LuaTable).get("view") + "." + (value as LuaTable).get("attribute") + " + " + (value as LuaTable).get("constant"));
                constraints.push(new CCLayoutConstraint(
                    views[self.get("view") as string],
                    LayoutAttributes[key]!,
                    CCLayoutConstraint.Relation.Equal,
                    views[(value as LuaTable).get("view") as string],
                    LayoutAttributes[(value as LuaTable).get("attribute") as string]!,
                    (value as LuaTable).get("multiplier") as number,
                    (value as LuaTable).get("constant") as number
                ));
            } else if (type(value) === "number") {
                constraints.push(new CCLayoutConstraint(
                    views[self.get("view") as string],
                    LayoutAttributes[key]!,
                    CCLayoutConstraint.Relation.Equal,
                    undefined,
                    CCLayoutConstraint.Attribute.NotAnAttribute,
                    0,
                    value as number
                ));
            } else {
                error("attempt to assign attribute to a " + type(value) + " value", 2);
            }
        });
        let env = new LuaTable();
        for (const name in views) {
            let vtab = new LuaTable();
            vtab.set("view", name);
            env.set(name, setmetatable(vtab, view_mt as LuaMetatable<LuaTable>));
        }
        let [fn, err] = load(code, "=CCKit2: CCView.addConstraintsByCode chunk", "t", env);
        assert(fn, err)[0]();
        for (let constraint of constraints) {
            constraint.active = true;
        }
    }

    /**
     * Tells the receiver that the frame or constraints of the sender changed.
     * This triggers the receiver to update its constraints if any are related
     * to the sender, and cascades the message up and down throughout the hierarchy.
     * It will also trigger a cascade on itself if it needs to update constraints.
     * @param sender The view whose frame and/or constraints changed
     * @param previous The view that called this method, to prevent backtracking
     */
    public setNeedsLayout(sender: CCView, previous: CCView): void {
        for (const constraint of this.constraints) {
            if (constraint.firstItem === sender || constraint.secondItem === sender) {
                this.needsLayout = true;
                break;
            }
        }
        if (this.superview !== undefined && this.superview !== previous) {
            this.superview.setNeedsLayout(sender, this);
            if (this.needsLayout) this.superview.setNeedsLayout(this, this);
        }
        for (const subview of this.subviews) {
            if (subview !== previous) {
                subview.setNeedsLayout(sender, this);
                if (this.needsLayout) subview.setNeedsLayout(this, this);
            }
        }
    }

    private layoutConstraints(views: LuaTable<CCView, number>, rows: CCRect[][], constants: number[], visited: LuaTable<CCView, boolean>, nextOffset: number): number {
        if (visited.has(this)) return nextOffset;
        visited.set(this, true);
        let offset: number;
        if (views.has(this)) {
            offset = views.get(this);
        } else {
            offset = nextOffset;
            nextOffset = nextOffset + 1;
            views.set(this, offset);
            for (let row of rows) row.push({x: 0, y: 0, width: 0, height: 0});
        }
        if (this.needsLayout && this.constraints.length > 0) {
            for (const constraint of this.constraints) {
                if (constraint.relation === CCLayoutConstraint.Relation.Equal) {
                    let value1: CCRect = {x: 0, y: 0, width: 0, height: 0}
                    switch (constraint.firstAttribute) {
                        case CCLayoutConstraint.Attribute.Left:
                            value1.x = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Right:
                            value1.x = 1;
                            value1.width = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Top:
                            value1.y = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Bottom:
                            value1.y = 1;
                            value1.height = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Leading:
                            value1.x = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Trailing:
                            value1.x = 1;
                            value1.width = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Width:
                            value1.width = 1;
                            break;
                        case CCLayoutConstraint.Attribute.Height:
                            value1.height = 1;
                            break;
                        case CCLayoutConstraint.Attribute.CenterX:
                            value1.x = 1;
                            value1.width = 0.5;
                            break;
                        case CCLayoutConstraint.Attribute.CenterY:
                            value1.y = 1;
                            value1.height = 0.5;
                            break;
                        case CCLayoutConstraint.Attribute.LastBaseline:
                        case CCLayoutConstraint.Attribute.FirstBaseline:
                        case CCLayoutConstraint.Attribute.NotAnAttribute:
                            // ???
                            break;
                    }
                    let offset2: number|undefined = undefined;
                    let value2: CCRect|undefined = undefined;
                    let constantModifier: number = 0;
                    if (constraint.secondItem !== undefined && constraint.secondAttribute !== CCLayoutConstraint.Attribute.NotAnAttribute) {
                        if (views.has(constraint.secondItem)) {
                            offset2 = views.get(constraint.secondItem);
                        } else {
                            offset2 = nextOffset;
                            nextOffset = nextOffset + 1;
                            views.set(constraint.secondItem, offset2);
                            for (let row of rows) row.push({x: 0, y: 0, width: 0, height: 0});
                        }
                        let isSuperview: boolean = false;
                        if (constraint.firstItem.superview === constraint.secondItem) isSuperview = true;
                        else if (constraint.firstItem.superview !== constraint.secondItem.superview)
                            throw "Found invalid constraint, constraints only valid between a view and its parent or siblings";
                        value2 = {x: 0, y: 0, width: 0, height: 0};
                        switch (constraint.secondAttribute) {
                            case CCLayoutConstraint.Attribute.Left:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.x = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Right:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.x = -constraint.multiplier;
                                value2.width = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Top:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.y = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Bottom:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.y = -constraint.multiplier;
                                value2.height = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Leading:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.x = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Trailing:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.x = -constraint.multiplier;
                                value2.width = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Width:
                                value2.width = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.Height:
                                value2.height = -constraint.multiplier;
                                break;
                            case CCLayoutConstraint.Attribute.CenterX:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.x = -constraint.multiplier;
                                value2.width = -constraint.multiplier / 2;
                                break;
                            case CCLayoutConstraint.Attribute.CenterY:
                                if (isSuperview) constantModifier = constraint.multiplier;
                                else value2.y = -constraint.multiplier;
                                value2.height = -constraint.multiplier / 2;
                                break;
                            case CCLayoutConstraint.Attribute.LastBaseline:
                            case CCLayoutConstraint.Attribute.FirstBaseline:
                                // ???
                                break;
                        }
                    }
                    addLayoutRow(rows, constants, nextOffset, offset, value1, offset2, value2, constraint.constant + constantModifier);
                    if (constraint.secondItem !== undefined) nextOffset = constraint.secondItem.layoutConstraints(views, rows, constants, visited, nextOffset);
                } else {
                    // TODO: implement inequalities
                }
            }
        } else {
            addLayoutRow(rows, constants, nextOffset, offset, {x: 1, y: 0, width: 0, height: 0}, undefined, undefined, this.frame.x);
            addLayoutRow(rows, constants, nextOffset, offset, {x: 0, y: 1, width: 0, height: 0}, undefined, undefined, this.frame.y);
            addLayoutRow(rows, constants, nextOffset, offset, {x: 0, y: 0, width: 1, height: 0}, undefined, undefined, this.frame.width);
            addLayoutRow(rows, constants, nextOffset, offset, {x: 0, y: 0, width: 0, height: 1}, undefined, undefined, this.frame.height);
        }
        return nextOffset;
    }

    private traverseConstraints(views: LuaTable<CCView, number>, rows: CCRect[][], constants: number[], visited: LuaTable<CCView, boolean>, nextOffset: number): number {
        if (this.needsLayout && this.constraints.length > 0) nextOffset = this.layoutConstraints(views, rows, constants, visited, nextOffset);
        for (const view of this.subviews) nextOffset = view.traverseConstraints(views, rows, constants, visited, nextOffset);
        return nextOffset;
    }

    /**
     * Lays out the view hierarchy following constraints.
     * This should only be called on a superview, which is done automatically.
     * @package
     */
    public layoutSubtree(): void {
        // Add all constraints to a list of rectangles + constants
        let views = new LuaTable<CCView, number>();
        let rows: CCRect[][] = [];
        let constants: number[] = [];
        let n = this.traverseConstraints(views, rows, constants, new LuaTable<CCView, boolean>(), 0) * 4 + 1;
        if (n === 1) return;

        // Convert the list to a matrix for solving
        let matrix: number[][] = [];
        for (let i = 0; i < rows.length; i++) {
            let row: number[] = [];
            for (let j = 0; j < rows[i].length; j++) {
                let rect = rows[i][j];
                row.push(rect.x, rect.y, rect.width, rect.height);
            }
            row.push(constants[i]);
            matrix.push(row);
        }

        /*let [file] = io.open("ConstraintDebug.txt", "a");
        if (file === undefined) throw "";
        for (let i = 0; i < matrix.length; i++) {
            let str = "";
            for (let j = 0; j < matrix[i].length; j++)
                str += matrix[i][j] + " ";
            file.write(str + "\n");
        }
        file.write("\n");*/

        // Gaussian elimination to solve the matrix
        // From Wikipedia

        let h = 0; /* Initialization of the pivot row */
        let k = 0; /* Initialization of the pivot column */
        
        while (h < matrix.length && k < n) {
            /* Find the k-th pivot: */
            let i_max = h;
            for (let i = h + 1; i < matrix.length; i++) {
                if (Math.abs(matrix[i][k]) > Math.abs(matrix[i_max][k])) {
                    i_max = i;
                }
            }
            if (matrix[i_max][k] === 0) {
                /* No pivot in this column, pass to next column */
                k = k + 1;
            } else {
                let row = matrix[h];
                matrix[h] = matrix[i_max];
                matrix[i_max] = row;
                let pivot = matrix[h][k];
                for (let j = 0; j < n; j++) {
                    matrix[h][j] /= pivot; // Normalize the pivot row
                }
                /* Do for all rows: */
                for (let i = 0; i < matrix.length; i++) {
                    if (i !== h) {
                        let f = matrix[i][k] / matrix[h][k];
                        /* Do for all remaining elements in current row: */
                        for (let j = k; j < n; j++)
                            matrix[i][j] -= matrix[h][j] * f;
                    }
                }
                /* Increase pivot row and column */
                h = h + 1;
                k = k + 1;
            }
        }

        // Round numbers to fix precision & fix -0 results
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < n; j++) {
                let n = matrix[i][j];
                if (Math.abs(n) < 0.000001) n = 0;
                matrix[i][j] = Math.floor(n * 10000) / 10000;
            }
        }

        /*for (let i = 0; i < matrix.length; i++) {
            let str = "";
            for (let j = 0; j < matrix[i].length; j++)
                str += matrix[i][j] + " ";
            file.write(str + "\n");
        }
        file.write("\n");
        file.close();*/

        // Assign the solved values back to the views
        let rects: CCRect[] = [];
        for (let [view, index] of views) rects[index] = view.frame;
        let roff = 0;
        for (let i = 0; i < n - 1; i++) {
            while (matrix[i][i+roff] !== 1 && i + roff < n - 1) {
                // TODO: log
                let view: CCView | undefined = undefined;
                for (let [v, index] of views) {
                    if (Math.floor((i + roff) / 4) == index) {
                        view = v;
                        break;
                    }
                }
                print("Ambiguity in constraints: no solution for <" + tostring(view) + ">:" + PropertyNames[(i + roff) % 4])
                roff++;
            }
            if (i + roff == n - 1) break;
            let value = matrix[i][n-1];
            for (let j = i + roff + 1; j < n - 1; j++) {
                if (matrix[i][j] !== 0) {
                    // TODO: log
                    let view: CCView | undefined = undefined;
                    for (let [v, index] of views) {
                        if (Math.floor(j / 4) == index) {
                            view = v;
                            break;
                        }
                    }
                    print("Ambiguity in constraints: ambiguous solution for <" + tostring(view) + ">:" + PropertyNames[j % 4] + ", using existing value");
                    switch (j % 4) {
                        case 0: value += rects[Math.floor(j / 4)].x; break;
                        case 1: value += rects[Math.floor(j / 4)].y; break;
                        case 2: value += rects[Math.floor(j / 4)].width; break;
                        case 3: value += rects[Math.floor(j / 4)].height; break;
                    }
                }
            }
            switch ((i + roff) % 4) {
                case 0: rects[Math.floor((i + roff) / 4)].x = value; break;
                case 1: rects[Math.floor((i + roff) / 4)].y = value; break;
                case 2: rects[Math.floor((i + roff) / 4)].width = value; break;
                case 3: rects[Math.floor((i + roff) / 4)].height = value; break;
            }
        }
        for (let [view, index] of views) {
            view.isLayingOut = true;
            view.frame = rects[index];
            view.isLayingOut = false;
            view.needsLayout = false;
            view.setNeedsDisplay();
        }
    }
}
