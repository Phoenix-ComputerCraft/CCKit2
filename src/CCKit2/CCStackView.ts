import CCView from "CCKit2/CCView";
import { CCRect } from "CCKit2/CCTypes";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";

/**
 * A stack view arranges child views in an either vertical or horizontal fashion,
 * automatically resizing each view to fit, with optional weighting.  
 * ![Example image](../../images/CCStackView.png)
 * 
 * @example Create a stack view with two text views covering a third and two thirds of the view.
 * ```ts
 * let stackView = new CCStackView({x: 1, y: 1, width: 30, height: 15});
 * this.view.addSubview(stackView);
 * stackView.addSubview(new CCTextView({x: 1, y: 1, width: 100, height: 1}, myText), 1);
 * stackView.addSubview(new CCTextView({x: 1, y: 1, width: 100, height: 1}, myText2), 2);
 * ```
 * ```lua
 * local stackView = LuaWrappers.new(CCStackView, {x = 1, y = 1, width = 30, height = 15})
 * self.view:addSubview(stackView)
 * stackView:addSubview(LuaWrappers.new(CCTextView, {x = 1, y = 1, width = 100, height = 1}, myText), 1)
 * stackView:addSubview(LuaWrappers.new(CCTextView, {x = 1, y = 1, width = 100, height = 1}, myText2), 2)
 * ```
 * 
 * @category Views
 */
export default class CCStackView extends CCView {
    /** The amount of spacing between views in characters. */
    public get spacing(): number {return this._spacing;}
    public set spacing(value: number) {
        this._spacing = value;
        this.updateConstraints();
    }
    private _spacing: number = 0;
    /** Whether the view is arranged horizontally (false) or vertically (true). */
    public get arrangedHorizontally(): boolean {return this._horizontal;}
    public set arrangedHorizontally(value: boolean) {
        this._horizontal = value;
        this.updateConstraints();
    }
    private _horizontal: boolean = false;

    private containedViews: {view: CCView, weight: number, constraints: CCLayoutConstraint[]}[] = [];

    public constructor(frame: CCRect, views: CCView[] = [], weights: number[] = []) {
        super(frame);
        for (let i = 0; i < views.length; i++) {
            super.addSubview(views[i]);
            this.containedViews.push({view: views[i], weight: weights[i] || 1, constraints: []});
        }
        this.updateConstraints();
    }

    public addSubview(view: CCView, weight: number = 1, after?: CCView): void {
        // TODO: after
        super.addSubview(view);
        this.containedViews.push({view: view, weight: weight, constraints: []});
        this.updateConstraints();
    }

    public didRemoveSubview(view: CCView): void {
        super.didRemoveSubview(view);
        for (let i = 0; i < this.containedViews.length; i++) {
            if (this.containedViews[i].view === view) {
                this.containedViews.splice(i, 1);
                return;
            }
        }
    }

    private resetConstraints(): void {

    }

    private updateConstraints(): void {
        if (this.containedViews.length < this.subviews.length) {
            this.resetConstraints();
            return;
        }

        for (let i = 0; i < this.containedViews.length && i < this.subviews.length; i++) {
            while (this.containedViews[i].view !== this.subviews[i]) {
                this.containedViews.splice(i);
                if (this.containedViews.length < this.subviews.length) {
                    this.resetConstraints();
                    return;
                } else if (i >= this.subviews.length) {
                    break;
                }
            }
        }

        for (let i = 0; i < this.containedViews.length; i++) {
            let info = this.containedViews[i];
            for (let c of info.constraints) info.view.removeConstraint(c);
            if (this._horizontal) {
                info.constraints = [
                    new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Top, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Top, 1, 0),
                    new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Bottom, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Bottom, 1, 0)
                ];
                if (i === 0) info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Left, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Left, 1, 0));
                else info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Left, CCLayoutConstraint.Relation.Equal, this.containedViews[i-1].view, CCLayoutConstraint.Attribute.Right, 1, this._spacing));
                if (i === this.containedViews.length - 1) info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Right, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Right, 1, 0));
                else info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Width, CCLayoutConstraint.Relation.Equal, this.containedViews[i+1].view, CCLayoutConstraint.Attribute.Width, info.weight / this.containedViews[i+1].weight, 0));
            } else {
                info.constraints = [
                    new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Left, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Left, 1, 0),
                    new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Right, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Right, 1, 0)
                ];
                if (i === 0) info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Top, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Top, 1, 0));
                else info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Top, CCLayoutConstraint.Relation.Equal, this.containedViews[i-1].view, CCLayoutConstraint.Attribute.Bottom, 1, this._spacing));
                if (i === this.containedViews.length - 1) info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Bottom, CCLayoutConstraint.Relation.Equal, this, CCLayoutConstraint.Attribute.Bottom, 1, 0));
                else info.constraints.push(new CCLayoutConstraint(info.view, CCLayoutConstraint.Attribute.Height, CCLayoutConstraint.Relation.Equal, this.containedViews[i+1].view, CCLayoutConstraint.Attribute.Height, info.weight / this.containedViews[i+1].weight, 0));
            }
            info.view.addConstraints(info.constraints);
        }
        this.setNeedsDisplay();
        this.setNeedsLayout(this, this);
    }
}
