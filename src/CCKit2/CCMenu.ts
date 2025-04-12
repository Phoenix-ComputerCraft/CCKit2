import { CCMenuItemDescription } from "CCKit2/CCWindowManagerConnection";
import CCMenuItem from "CCKit2/CCMenuItem";
import { CCKeyCombo } from "CCKit2/CCTypes";
import CCApplication from "CCKit2/CCApplication";

function indexCheck(index: number): number | undefined {
    if (index === -1) return undefined;
    return index;
}

/**
 * Holds information about a single menu in the menu bar, either as a top-level
 * menu or a submenu.
 * @category Application
 */
export default class CCMenu {
    /** The menu that contains this menu. */
    public supermenu?: CCMenu;
    /** The number of items in the menu. */
    public get length(): number {return this.items.length;}

    private items: CCMenuItem[] = [];

    /**
     * Adds an item to the end of the menu.
     * @param item The item to add
     */
    public addItem(item: CCMenuItem): void;
    /**
     * Constructs and adds a new item with an action.
     * @param title The title of the item
     * @param action The function to call when the item is clicked
     * @param keyEquivalent A key combo to trigger the action with
     */
    public addItem(title: string, action: () => void, keyEquivalent?: CCKeyCombo): void;
    public addItem(first: string | CCMenuItem, action?: () => void, keyEquivalent?: CCKeyCombo): void {
        if (typeof first === "string") {
            first = new CCMenuItem(first, action!, keyEquivalent);
        }
        if (first.supermenu !== undefined) throw "Item already attached to menu";
        first.supermenu = this;
        this.items.push(first);
        this.itemChanged(first);
    }

    /**
     * Inserts an item at the specified index.
     * @param item The item to add
     * @param index The index to add at
     */
    public insertItem(item: CCMenuItem, index: number): void {
        if (item.supermenu !== undefined) throw "Item already attached to menu";
        item.supermenu = this;
        this.items.splice(index, 0, item);
        this.itemChanged(item);
    }

    /**
     * Removes an item from the menu.
     * @param item The item to remove
     */
    public removeItem(item: CCMenuItem): void {
        let index = this.indexOfItem(item);
        if (index === undefined) return;
        this.items.splice(index);
        item.supermenu = undefined;
        this.itemChanged(item);
    }

    /**
     * Removes an item at the specified index from the menu.
     * @param index The index of the item to remove
     */
    public removeItemAtIndex(index: number): void {
        let item = this.items[index];
        if (item === undefined) return;
        this.items.splice(index);
        item.supermenu = undefined;
        this.itemChanged(item);
    }

    /**
     * Called when a subitem changes state.
     * @param item The item that changed
     * @package
     */
    public itemChanged(item: CCMenuItem): void {
        if (this.supermenu) return this.supermenu.itemChanged(item);
        else if (this === CCApplication.shared.menu && CCApplication.shared.wmConnection.updateAppMenu)
            CCApplication.shared.wmConnection.updateAppMenu(this.serialize());
    }

    /**
     * Returns the first menu item with the specified title.
     * @param title The title to look for
     * @returns The found item, or undefined if not found
     */
    public itemWithTitle(title: string): CCMenuItem | undefined {
        return this.items.find(item => item.title === title);
    }

    /**
     * Returns the menu item at the specified index.
     * @param index The index of the item
     * @returns The found item, or undefined if not found
     */
    public itemAtIndex(index: number): CCMenuItem | undefined {
        return this.items[index];
    }

    /**
     * Returns the index of the specified menu item.
     * @param item The item to look for
     * @returns The item's index, or undefined if not found
     */
    public indexOfItem(item: CCMenuItem): number | undefined {
        return indexCheck(this.items.indexOf(item));
    }

    /**
     * Returns the index of the first menu item with the specified title.
     * @param title The title to look for
     * @returns The found item's index, or undefined if not found
     */
    public indexOfItemWithTitle(title: string): number | undefined {
        return indexCheck(this.items.findIndex(item => item.title === title));
    }

    /**
     * Returns the index of the first menu item with the specified submenu.
     * @param menu The menu to look for
     * @returns The found item's index, or undefined if not found
     */
    public indexOfItemWithSubmenu(menu: CCMenu): number | undefined {
        return indexCheck(this.items.findIndex(item => item.submenu === menu));
    }

    /**
     * Serializes the menu into a representation for the window manager.
     * @returns A serialized representation of the menu
     */
    public serialize(): CCMenuItemDescription[] {
        let items = [];
        for (let item of this.items) items.push(item.serialize());
        return items;
    }

    /**
     * Triggers an incoming action on a nested subitem.
     * @param key The key of the item that was triggered
     * @returns Whether an item triggered an action
     */
    public triggerAction(key: string): boolean {
        for (let item of this.items)
            if (item.triggerAction(key)) return true;
        return false;
    }
}
