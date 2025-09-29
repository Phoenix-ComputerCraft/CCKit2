import { CCKeyCombo } from "CCKit2/CCTypes";
import CCMenu from "CCKit2/CCMenu";
import { CCMenuItemDescription } from "CCKit2/CCWindowManagerConnection";

/**
 * Stores information about a single menu item.
 * @category Application
 */
export default class CCMenuItem {
    /** The title of the menu item. */
    public get title(): string | undefined {return this._title;}
    public set title(value: string | undefined) {
        this._title = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _title?: string;
    /** A key combo that will trigger the action. */
    public get keyCombo(): CCKeyCombo | undefined {return this._keyCombo;}
    public set keyCombo(value: CCKeyCombo | undefined) {
        this._keyCombo = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _keyCombo?: CCKeyCombo;
    /** The function to call when this action is triggered. */
    public get action(): ((checked?: boolean) => void) | undefined {return this._action;}
    public set action(value: ((checked?: boolean) => void) | undefined) {
        this._action = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _action?: ((checked?: boolean) => void);
    /** Whether the item is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _isEnabled: boolean = true;
    /** If not `nil`, whether the item's checkbox is checked. */
    public get checkbox(): boolean | undefined {return this._checkbox;}
    public set checkbox(value: boolean | undefined) {
        this._checkbox = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _checkbox?: boolean;
    /** A string that groups radio items together. */
    public get radioGroup(): string | undefined {return this._radioGroup;}
    public set radioGroup(value: string | undefined) {
        this._radioGroup = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _radioGroup?: string;
    /** A submenu to display under this item. */
    public get submenu(): CCMenu | undefined {return this._submenu;}
    public set submenu(value: CCMenu | undefined) {
        this._submenu = value;
        if (value) value.supermenu = this._supermenu;
        if (this.supermenu) this.supermenu.itemChanged(this);
    }
    private _submenu?: CCMenu;
    /** The menu that owns this item. */
    public get supermenu(): CCMenu | undefined {return this._supermenu;}
    public set supermenu(value: CCMenu | undefined) {
        this._supermenu = value;
        if (this._submenu) this._submenu.supermenu = value;
    }
    private _supermenu?: CCMenu;

    /**
     * Creates a new menu item for a separator.
     */
    public constructor();
    /**
     * Creates a new menu item for an action.
     * @param title The title for the action
     * @param action The function to call when the action is triggered
     * @param keyCombo A key combo that will trigger the action, if desired
     */
    public constructor(title: string, action: () => void, keyCombo?: CCKeyCombo);
    /**
     * Creates a new menu item for a radio action.
     * @param title The title for the action
     * @param action The function to call when the action is triggered
     * @param keyCombo A key combo that will trigger the action, if desired
     * @param radioGroup The ID of the group the item is in
     */
    public constructor(title: string, action: () => void, keyCombo: CCKeyCombo | undefined, radioGroup: string);
    /**
     * Creates a new menu item for a checkbox action.
     * @param title The title for the action
     * @param action The function to call when the action is triggered
     * @param keyCombo A key combo that will trigger the action, if desired
     * @param checked Whether the checkbox is initially checked
     */
    public constructor(title: string, action: (checked?: boolean) => void, keyCombo: CCKeyCombo | undefined, checked: boolean);
    /**
     * Creates a new menu item for a submenu.
     * @param title The title for the submenu
     * @param menu The menu to display under this item
     */
    public constructor(title: string, menu: CCMenu);
    public constructor(title?: string, second?: CCMenu | ((checked?: boolean) => void), keyCombo?: CCKeyCombo, extra?: string|boolean) {
        this._title = title;
        if (typeof second === "function") {
            this._action = second;
            this._keyCombo = keyCombo;
            if (typeof extra === "string") this._radioGroup = extra;
            else if (typeof extra === "boolean") this._checkbox = extra;
        } else if (second) {
            this._submenu = second;
        }
    }

    /**
     * Serializes this menu item into a format for the window manager.
     * @returns The serialized version of this menu item
     */
    public serialize(): CCMenuItemDescription {
        return {
            title: this._title,
            keyCombo: this._keyCombo,
            action: this._isEnabled ? tostring(this._action) : undefined,
            subitems: this._submenu ? this._submenu.serialize() : undefined,
            checkbox: this._checkbox,
            radioGroup: this._radioGroup,
        };
    }

    /**
     * Triggers an incoming action on this item or a nested subitem.
     * @param key The key of the item that was triggered
     * @returns Whether an item triggered an action
     */
    public triggerAction(key: string): boolean {
        if (this._action && key === tostring(this._action)) {
            if (this._checkbox !== undefined) this.checkbox = !this._checkbox;
            this._action(this._checkbox);
            return true;
        } else if (this._submenu)
            return this._submenu.triggerAction(key);
        else return false;
    }
}
