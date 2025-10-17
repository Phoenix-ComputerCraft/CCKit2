import { CCMenuItemDescription } from "CCKit2/CCWindowManagerConnection";
import CCMenuItem from "CCKit2/CCMenuItem";
import { CCKeyCombo } from "CCKit2/CCTypes";
import CCApplication from "CCKit2/CCApplication";

function indexCheck(index: number): number | undefined {
    if (index === -1) return undefined;
    return index;
}

/**
 * Holds information about a single menu in the menu bar or context menu, either
 * as a top-level menu or a submenu.  
 * ![Example image](../../images/CCMenu.png)
 * 
 * @example Create a menu.
 * ```ts
 * let menu = new CCMenu();
 * menu.addItem("New", () => this.newItem(), {key: CCKey.N, ctrl: true});
 * menu.addItem("Open", () => this.openItem(), {key: CCKey.O, ctrl: true});
 * menu.addSpacer();
 * menu.addItem("Auto Save", state => this.setAutosave(state), undefined, false);
 * let submenu = new CCMenu();
 * submenu.addItem("Top", () => this.setPosition("top"), undefined, "position");
 * submenu.addItem("Center", () => this.setPosition("center"), undefined, "position");
 * submenu.addItem("Bottom", () => this.setPosition("bottom"), undefined, "position");
 * menu.addItem("Position", submenu);
 * ```
 * ```lua
 * local menu = LuaWrappers.new(CCMenu)
 * menu:addItem("New", function() self:newItem() end, {key = CCKey.N, ctrl = true})
 * menu:addItem("Open", function() self:openItem() end, {key = CCKey.O, ctrl = true})
 * menu:addSpacer()
 * menu:addItem("Auto Save", function(state) self:setAutosave(state) end, nil, false)
 * local submenu = LuaWrappers.new(CCMenu)
 * submenu:addItem("Top", function() self:setPosition("top") end, nil, "position")
 * submenu:addItem("Center", function() self:setPosition("center") end, nil, "position")
 * submenu:addItem("Bottom", function() self:setPosition("bottom") end, nil, "position")
 * menu:addItem("Position", submenu)
 * ```
 * 
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
    /**
     * Constructs and adds a new menu item for a radio action.
     * @param title The title for the action
     * @param action The function to call when the action is triggered
     * @param keyCombo A key combo that will trigger the action, if desired
     * @param radioGroup The ID of the group the item is in
     */
    public addItem(title: string, action: () => void, keyCombo: CCKeyCombo | undefined, radioGroup: string): void;
    /**
     * Constructs and adds a new menu item for a checkbox action.
     * @param title The title for the action
     * @param action The function to call when the action is triggered
     * @param keyCombo A key combo that will trigger the action, if desired
     * @param checked Whether the checkbox is initially checked
     */
    public addItem(title: string, action: (checked?: boolean) => void, keyCombo: CCKeyCombo | undefined, checked: boolean): void;
    /**
     * Constructs and adds a new menu item for a submenu.
     * @param title The title for the submenu
     * @param menu The menu to display under this item
     */
    public addItem(title: string, menu: CCMenu): void;
    public addItem(first: string | CCMenuItem, action?: (() => void) | CCMenu, keyEquivalent?: CCKeyCombo, extra?: string | boolean): void {
        if (typeof first === "string") {
            // @ts-expect-error
            first = new CCMenuItem(first, action!, keyEquivalent, extra);
        }
        if (first.supermenu !== undefined) throw "Item already attached to menu";
        first.supermenu = this;
        this.items.push(first);
        this.itemChanged(first);
    }

    /**
     * Adds an empty spacer item.
     */
    public addSpacer(): void {
        let item = new CCMenuItem();
        item.supermenu = this;
        this.items.push(item);
        this.itemChanged(item);
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
