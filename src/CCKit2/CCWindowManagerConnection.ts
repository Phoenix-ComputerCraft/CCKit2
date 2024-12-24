import CCApplication from "CCKit2/CCApplication";
import CCEvent from "CCKit2/CCEvent";
import CCWindow from "CCKit2/CCWindow";
import * as defaultWM from "CCKit2/CCDefaultWindowManagerConnection";
import { CCColor } from "CCKit2/CCTypes";

/**
 * The CCWindowManagerFramebuffer interface represents the underlying framebuffer
 * that is used as a render target for a window. It contains methods similar to
 * a CraftOS window, but with additional methods relating to window ordering and
 * other window manager-specific tasks. This type can only be constructed through
 * a CCWindowManagerConnection instance.
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
 * @noSelf
 */
export declare interface CCWindowManagerGraphicsFramebuffer {
    getSize(): [number, number];

}

export type CCWindowManagerWindowOptions = {
    z?: -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3;
    closable?: boolean;
    minimizable?: boolean;
    resizable?: boolean;
    utility?: boolean;
    borderless?: boolean;
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
}

/**
 * Creates a new window manager connection for the current platform's default
 * connection type.
 * @returns A new window manager connection
 */
export function CCDefaultWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
    return defaultWM.default(app);
}