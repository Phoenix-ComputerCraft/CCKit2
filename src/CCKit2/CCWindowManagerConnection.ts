import CCApplication from "CCKit2/CCApplication";
import CCEvent from "CCKit2/CCEvent";
import CCWindow from "CCKit2/CCWindow";
import * as defaultWM from "CCKit2/CCDefaultWindowManagerConnection";

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
    getPaletteColor(color: Color): LuaMultiReturn<[number, number, number]>;
    setPaletteColor(color: Color, rgb: number): void;
    setPaletteColor(color: Color, r: number, g: number, b: number): void;
    getPaletteColour(color: Color): LuaMultiReturn<[number, number, number]>;
    setPaletteColour(color: Color, rgb: number): void;
    setPaletteColour(color: Color, r: number, g: number, b: number): void;
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
    getTextColor(): Color;
    setTextColor(color: Color): void;
    getBackgroundColor(): Color;
    setBackgroundColor(color: Color): void;
    getTextColour(): Color;
    setTextColour(color: Color): void;
    getBackgroundColour(): Color;
    setBackgroundColour(color: Color): void;
    getBorderColor(): number;
    setBorderColor(color: number): void;
    getLine(y: number): LuaMultiReturn<[string, string, string]> | undefined;
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
     */
    createWindow(forWindow: CCWindow, x: number | undefined, y: number | undefined, width: number, height: number, title: string, options: CCWindowManagerWindowOptions): CCWindowManagerFramebuffer | undefined;

    /**
     * Waits for an event from the window manager or operating system.
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