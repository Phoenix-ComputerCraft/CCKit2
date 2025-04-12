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
    public get action(): (() => void) | undefined {return this._action;}
    public set action(value: (() => void) | undefined) {
        this._action = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _action?: () => void;
    /** Whether the item is enabled. */
    public get isEnabled(): boolean {return this._isEnabled;}
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (this._supermenu) this._supermenu.itemChanged(this);
    }
    private _isEnabled: boolean = true;
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
     * Creates a new menu item for a submenu.
     * @param title The title for the submenu
     * @param menu The menu to display under this item
     */
    public constructor(title: string, menu: CCMenu);
    public constructor(title?: string, second?: CCMenu | (() => void), keyCombo?: CCKeyCombo) {
        this._title = title;
        if (typeof second === "function") {
            this._action = second;
            this._keyCombo = keyCombo;
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
        };
    }

    /**
     * Triggers an incoming action on this item or a nested subitem.
     * @param key The key of the item that was triggered
     * @returns Whether an item triggered an action
     */
    public triggerAction(key: string): boolean {
        if (this._action && key === tostring(this._action)) {
            this._action();
            return true;
        } else if (this._submenu)
            return this._submenu.triggerAction(key);
        else return false;
    }
}
