import CCView from "CCKit2/CCView";

/**
 * The CCLayoutConstraint class defines a rule that constrains a value of one
 * view's geometry to another view, following a linear equation.
 * Use constraints to make a UI that automatically handles resizing.
 * @category Core
 */
export class CCLayoutConstraint {
    /** The first item to constrain. */
    public firstItem: CCView;
    /** The attribute of the first item to use. */
    public firstAttribute: CCLayoutConstraint.Attribute;
    /** The relation between the two attributes. */
    public relation: CCLayoutConstraint.Relation;
    /** The second item to constrain to. */
    public secondItem: CCView|undefined;
    /** The attribute of the second item to use. */
    public secondAttribute: CCLayoutConstraint.Attribute;
    /** The multiplier to apply to the second attribute. */
    public multiplier: number;
    /** The constant to add to the second attribute. */
    public constant: number;
    /** The priority of the constraint. */
    public priority: number = 1000;

    /** Whether the constraint is active. */
    public get active(): boolean {
        return this._active;
    }
    public set active(value: boolean) {
        if (value == this._active) return;
        if (value) this.firstItem.addConstraint(this);
        else this.firstItem.removeConstraint(this);
        this._active = value;
    }
    private _active: boolean = false;

    /**
     * Creates a new constraint between two views.
     * @param item1 The first item to constrain
     * @param attribute1 The attribute of the first item to constrain
     * @param relation The relation between the two attributes
     * @param item2 The second item to constrain to
     * @param attribute2 The attribute of the second item to constrain to
     * @param multiplier The multiplier to apply to the second attribute
     * @param constant The constant to add to the second attribute
     */
    constructor(
        item1: CCView,
        attribute1: CCLayoutConstraint.Attribute,
        relation: CCLayoutConstraint.Relation,
        item2: CCView|undefined,
        attribute2: CCLayoutConstraint.Attribute,
        multiplier: number, constant: number) {
        this.firstItem = item1;
        this.firstAttribute = attribute1;
        this.relation = relation;
        this.secondItem = item2;
        this.secondAttribute = attribute2;
        this.multiplier = multiplier;
        this.constant = constant;
    }
}

/**
 * @category Core
 */
export namespace CCLayoutConstraint {
    export enum Attribute {
        Left,
        Right,
        Top,
        Bottom,
        Leading,
        Trailing,
        Width,
        Height,
        CenterX,
        CenterY,
        LastBaseline,
        FirstBaseline,
        NotAnAttribute
    }

    export enum Relation {
        LessThanOrEqual,
        Equal,
        GreaterThanOrEqual
    }
}

export default CCLayoutConstraint;
