import CCEvent from "CCKit2/CCEvent";
import CCWindow from "CCKit2/CCWindow";
import { CCColor, CCKey, CCKeyCombo } from "CCKit2/CCTypes";
import CCImage from "CCKit2/CCImage";

/**
 * The CCWindowManagerFramebuffer interface represents the underlying framebuffer
 * that is used as a render target for a window. It contains methods similar to
 * a CraftOS window, but with additional methods relating to window ordering and
 * other window manager-specific tasks. This type can only be constructed through
 * a CCWindowManagerConnection instance.
 * @category Windows
 * @noSelf
 */
export declare interface CCWindowManagerFramebuffer {
    close(): void;
    getSize(): LuaMultiReturn<[number, number]>;
    getPosition(): LuaMultiReturn<[number, number]>;
    getPaletteColor(color: CCColor): LuaMultiReturn<[number, number, number]>;
    setPaletteColor(color: CCColor, rgb: number): void;
    setPaletteColor(color: CCColor, r: number, g: number, b: number): void;
    getPaletteColour(color: number): LuaMultiReturn<[number, number, number]>;
    setPaletteColour(color: CCColor, rgb: number): void;
    setPaletteColour(color: CCColor, r: number, g: number, b: number): void;
    reposition(x: number, y: number): void;
    resize(w: number, h: number): void;
    write(text: string): void;
    blit(text: string, fg: string, bg: string): void;
    clear(): void;
    clearLine(): void;
    getCursorPos(): LuaMultiReturn<[number, number]>;
    setCursorPos(x: number, y: number): void;
    getCursorBlink(): boolean;
    setCursorBlink(blink: boolean): void;
    isColor(): boolean;
    isColour(): boolean;
    scroll(lines: number): void;
    getTextColor(): CCColor;
    setTextColor(color: CCColor): void;
    getBackgroundColor(): CCColor;
    setBackgroundColor(color: CCColor): void;
    getTextColour(): CCColor;
    setTextColour(color: CCColor): void;
    getBackgroundColour(): CCColor;
    setBackgroundColour(color: CCColor): void;
    getBorderColor(): CCColor;
    setBorderColor(color: CCColor): void;
    getLine(y: number): LuaMultiReturn<[string, string, string] | []>;
    restoreCursor(): void;
    isVisible(): boolean;
    setVisible(visible: boolean): void;
    redraw(): void;
    sendFront(): void;
    sendBack(): void;
    sendFrontAndFocus(): void;
    setTitle(title: string): void;
    gfxHandle(): CCWindowManagerGraphicsFramebuffer;
}

/**
 * 
 * @category Windows
 * @noSelf
 */
export declare interface CCWindowManagerGraphicsFramebuffer {
    getSize(): [number, number];

}

/**
 * Holds parameters for window creation.
 * @category Windows
 */
export type CCWindowManagerWindowOptions = {
    z?: -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3;
    closable?: boolean;
    minimizable?: boolean;
    resizable?: boolean;
    utility?: boolean;
    borderless?: boolean;
}

/**
 * Holds information about a menu item in a serializable way.
 * @category Application
 */
export type CCMenuItemDescription = {
    /** The text for the menu item (if null, denotes a separator) */
    title?: string;
    /** A key combo that will trigger the item */
    keyCombo?: CCKeyCombo;
    /** If this item has a submenu, the items to display */
    subitems?: CCMenuItemDescription[];
    /** A key for an action to send when the item is triggered (if null, the item will be disabled) */
    action?: string;
    /** If set, renders a checkbox on the item, which will be checked based on this value. */
    checkbox?: boolean;
    /** If set, renders a radio button on the item, which is grouped with any other item in the menu with the same group name. */
    radioGroup?: string;
}

/**
 * The CCWindowManagerConnection interface is used by classes that implement a
 * connection to a window server, which hosts all of the windows and handles
 * things like drawing, decorations, positioning, and occlusion.
 * 
 * This allows apps to run on multiple platforms both with and without external
 * window servers. For example, CraftOS systems can use the CCCraftOSWindowManager
 * class to run a single-application window server, while Phoenix systems can
 * use the CCPhoenixWMConnection class to connect to a multi-app PhoenixWM
 * window server.
 * 
 * Use the CCDefaultWindowManagerConnection function to acquire an instance of
 * CCWindowManagerConnection that's most appropriate for the current platform.
 * @category Windows
 */
export default interface CCWindowManagerConnection {
    /**
     * Creates a new window in the window manager.
     * @param forWindow The CCWindow instance this window is for
     * @param x The X position of the window, or undefined to let the WM choose
     * @param y The Y position of the window, or undefined to let the WM choose
     * @param width The width of the window
     * @param height The height of the window
     * @param title The title for the window
     * @param options Options to specify for the window
     * @returns A new window framebuffer target, or undefined if it couldn't be created
     */
    createWindow(forWindow: CCWindow, x: number | undefined, y: number | undefined, width: number, height: number, title: string, options: CCWindowManagerWindowOptions): CCWindowManagerFramebuffer | undefined;

    /**
     * Waits for an event from the window manager or operating system.
     * @returns An event to post to the application
     */
    pullEvent(): CCEvent;

    /**
     * Updates the window manager with the app's current menu state. Each item
     * corresponds to a main menu button in the titlebar, though note that the
     * first item will always be given the title of the app, regardless of its
     * `title` field.
     * @param menu The menus to display in the menu bar
     */
    updateAppMenu?(menu: CCMenuItemDescription[]): void;

    /**
     * If the app is waiting for an event in pullEvent, this function will cause
     * it to wake up and return an empty CCEvent (which will be ignored). This
     * is used to handle CCKit events immediately.
     * 
     * If the app is not waiting for an event, this function should do nothing.
     */
    wakeUp(): void;

    /**
     * Sets the application name and icon, for use in a task manager.
     * @param title The title of the app
     * @param icon The icon for the app, which should be exactly 2x1
     */
    setAppMetadata?(title: string, icon: CCImage): void;
}
