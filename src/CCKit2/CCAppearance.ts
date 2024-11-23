import { CCColor } from "CCKit2/CCTypes";

/**
 * Stores parameters that define the appearance for an application.
 */
export default class CCAppearance {
    /** Whether to show the title bar. */
    public showTitleBar: boolean = true;
    /** The color of the title bar when the window is active. */
    public activeTitleBarColor: CCColor = CCColor.yellow;
    /** The color of the title bar when the window is inactive. */
    public inactiveTitleBarColor: CCColor = CCColor.lightGray;
    /** The default color of the root view. */
    public windowColor: CCColor = CCColor.white;
    /** The color of text in the title bar. */
    public titleBarTextColor: CCColor = CCColor.black;
    /** The color of active controls, such as selected buttons. */
    public activeElementColor: CCColor = CCColor.blue;
    /** The color of inactive controls, such as normal buttons. */
    public inactiveElementColor: CCColor = CCColor.lightGray;
    /** The color of text in active controls. */
    public activeElementTextColor: CCColor = CCColor.white;
    /** The color of text in inactive controls. */
    public inactiveElementTextColor: CCColor = CCColor.black;

    /**
     * Returns the appearance corresponding to a system name if it exists.
     * @param name The name of the appearance to get
     * @returns The appearance object, or nil if unknown
     * @typecheck
     */
    public static getAppearance(name: string): CCAppearance | undefined {
        throw "Not implemented";
    }
}