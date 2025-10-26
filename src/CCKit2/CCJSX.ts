import CCView from "CCKit2/CCView";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";
import { CCColor, CCPoint, CCRect, CCSize } from "CCKit2/CCTypes";

/**
 * Creates a new JSX element from the specified tag, attributes and children.
 * You should not need to call this manually.
 * @param klass The CCView class to build, or one of the keys of `JSX.IntrinsicElements`
 * @param attributes The attributes for the tag
 * @param children The child tags or content to build
 * @return The created JSX element
 */
export function createElement<T extends CCView>(klass: keyof JSX.IntrinsicElements | (new (props: any, text: string | undefined) => T), attributes: {outlet?: JSX.Outlet<T>} & {[key: string]: string}, ...children: (JSX.Element | string)[]): JSX.Element {
    if (klass === "constraint") {
        let attr = attributes as JSX.IntrinsicElements["constraint"]
        if ("secondItem" in attr) {
            let view: CCView | "superview";
            if (attr.secondItem === "superview") view = "superview";
            else if (attr.secondItem instanceof CCView) view = attr.secondItem;
            else view = attr.secondItem.object[attr.secondItem.key] as CCView;
            return new CCLayoutConstraint(
                // @ts-expect-error
                undefined,
                typeof attr.firstAttribute === "string" ? CCLayoutConstraint.Attribute[attr.firstAttribute] : attr.firstAttribute,
                typeof attr.relation === "string" ? CCLayoutConstraint.Relation[attr.relation] : attr.relation,
                view,
                typeof attr.secondAttribute === "string" ? CCLayoutConstraint.Attribute[attr.secondAttribute] : attr.secondAttribute,
                typeof attr.multiplier === "string" ? parseInt(attr.multiplier) : attr.multiplier,
                typeof attr.constant === "string" ? parseInt(attr.constant) : attr.constant
            );
        } else {
            return new CCLayoutConstraint(
                // @ts-expect-error
                undefined,
                typeof attr.firstAttribute === "string" ? CCLayoutConstraint.Attribute[attr.firstAttribute] : attr.firstAttribute,
                typeof attr.relation === "string" ? CCLayoutConstraint.Relation[attr.relation] : attr.relation,
                undefined,
                CCLayoutConstraint.Attribute.NotAnAttribute,
                typeof attr.multiplier === "string" ? parseInt(attr.multiplier) : attr.multiplier,
                typeof attr.constant === "string" ? parseInt(attr.constant) : attr.constant
            );
        }
    }
    let str = undefined;
    for (const child of children) {
        if (typeof child === "string") {
            if (str === undefined) str = "";
            str += child;
        }
    }
    let view = new klass(attributes, str);
    for (let child of children) {
        if (child instanceof CCView) view.addSubview(child);
        else if (child instanceof CCLayoutConstraint) {
            child.firstItem = view;
            view.addConstraint(child);
        }
    }
    if (attributes.outlet !== undefined) attributes.outlet.object[attributes.outlet.key] = view;
    return view;
}

/**
 * The CCJSX module allows you to define user interfaces using XML syntax
 * directly in your source code.
 * 
 * @example Create a view hierarchy using JSX.
 * ```tsx
 * class ViewController extends CCViewController {
 *     private textField!: CCTextField;
 * 
 *     public get constructedView(): CCView {
 *         return <CCView frame="1 1 30 15">
 *             <CCLabel pos="1 1">Hello World!</CCLabel>
 *             <CCTextField outlet="textField" frame="1 2 20 1" placeholder="Text..." />
 *             <CCButton pos="1 3" action="buttonClicked">Submit</CCButton>
 *         </CCView>
 *     }
 * 
 *     private buttonClicked(sender: CCButton): void {
 *         CCDialog.messageWithOneButton(this.view.window, "Hello", this.textField.text);
 *     }
 * }
 * ```
 * 
 * @category Core
 */
export namespace JSX {
    /** Intrinsic elements (constraint). */
    export interface IntrinsicElements {
        constraint: {
            firstAttribute: Exclude<CCLayoutConstraint.Attribute, CCLayoutConstraint.Attribute.NotAnAttribute> | Exclude<keyof typeof CCLayoutConstraint.Attribute, "NotAnAttribute">;
            relation: keyof typeof CCLayoutConstraint.Relation;
            multiplier?: number | `${number}`;
            constant?: number | `${number}`;
        } & ({} | {
            secondItem: CCView | Outlet<CCView> | "superview";
            secondAttribute: Exclude<CCLayoutConstraint.Attribute, CCLayoutConstraint.Attribute.NotAnAttribute> | Exclude<keyof typeof CCLayoutConstraint.Attribute, "NotAnAttribute">
        });
    }
    /** The base type for JSX-capable elements. */
    export type ElementClass = CCView;
    /** The constructor type for JSX-capable elements. */
    export type ElementType = keyof IntrinsicElements | (new (props: any, text: string | undefined) => CCView);
    /** The type which is returned by a JSX element. */
    export type Element = CCView | CCLayoutConstraint;
    /** The underlying type for an outlet connection. */
    export type Outlet<T> = {key: string, object: any, __unused?: T};
    /** Extra attributes applied to elements. */
    type ExtraAttributes<T> = {
        /** The name of a property in the view controller to assign this view to. */
        outlet?: Outlet<T>;
    };
    /**
     * Declares the values an attribute may have depending on its original property type.
     * @typeParam T - The type of the original property
     */
    export type AttributeValues<T> =
        (T extends undefined | null ? "" : never) |
        (T extends boolean ? "true" | "false" : never) |
        (T extends Exclude<number, CCColor> ? `${number}` : never) |
        (T extends string ? string : never) |
        (T extends CCColor ? keyof typeof CCColor : never) |
        (T extends CCPoint | CCSize ? `${number} ${number}` : never) |
        (T extends CCRect ? `${number} ${number} ${number} ${number}` : never);
    /**
     * Declares the attributes a JSX element of a particular view type may have,
     * automatically generated from the view's properties.
     * @typeParam T - The view type to load from
     * @typeParam E - Any properties to manually declare and exclude from automatic type inference. This is required for any action proeprty, as those are usually excluded from the result.
     */
    export type AttributesFor<T extends CCView, E extends {[key: string]: any} = {}> = {
        [key in keyof Pick<T, {
            [K in keyof T]: AttributeValues<T[K]> extends string ? K : (E extends {[ek in K]: any} ? K : never)
        }[keyof T]>]?: E extends {[ek in key]: any} ? any : T[key] | AttributeValues<T[key]>
    } & E & ExtraAttributes<T>;
}
