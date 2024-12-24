import { CCKey, CCPoint } from "CCKit2/CCTypes";
import CCWindow from "CCKit2/CCWindow";

/**
 * A CCEvent holds information about a single event that was triggered by the
 * system, application, or window manager.
 * @category Application
 */
export class CCEvent {
    /** The type of the event. */
    public type: CCEvent.Type = CCEvent.Type.ApplicationDefined;
    /** The subtype of the event, if relevant. */
    public subtype: CCEvent.SubType = CCEvent.SubType.ApplicationActivated;
    /** The location of the event relative to a window. */
    public locationInWindow?: CCPoint;
    /** The timestamp that the event occurred at. */
    public timestamp: number = 0;
    /** The window the event is intended for. */
    public window?: CCWindow;
    /** If the event is from CraftOS, the raw event data. */
    public ccEvent?: any[];
    /** If the event is from Phoenix, the raw event data. */
    public phoenixEvent?: {name: string, params: object};
    /** The modifier keys pressed with the event. */
    public modifierFlags?: CCEvent.ModifierFlags;
    /** For character input events, the characters pressed. */
    public characters?: string;
    /** For character input events, the characters pressed, without modifier keys. */
    public get charactersIgnoringModifiers(): string | undefined {
        if (this.characters !== undefined) return this.characters.toLowerCase();
        else return undefined;
    };
    /** For key events, the key code pressed. */
    public keyCode?: CCKey;
    /** For key down events, whether the key was repeated. */
    public isRepeat?: boolean;
    /** For mouse events, the mouse button pressed. */
    public buttonNumber?: number;
    /** For mouse down events, the number of times the button was pressed. */
    public clickCount?: number;
    /** For mouse scroll events, the direction of the scroll (1 or -1). */
    public scrollDirection?: number;
    /** For application-defined events, any extra parameters to pass. */
    public extraParams?: object;

    /**
     * Starts sending periodic events to the application.
     * @param delay The number of seconds to wait until sending events
     * @param period The amount of time to wait between events
     * @typecheck
     */
    public static startPeriodicEvents(delay: number, period: number): void {
        throw "Not implemented";
    }

    /**
     * Stops sending periodic events if enabled.
     */
    public static stopPeriodicEvents(): void {
        throw "Not implemented";
    }
}

/**
 * @category Application
 */
export namespace CCEvent {
    export enum Type {
        LeftMouseDown,
        LeftMouseDragged,
        LeftMouseUp,
        RightMouseDown,
        RightMouseDragged,
        RightMouseUp,
        OtherMouseDown,
        OtherMouseDragged,
        OtherMouseUp,
        MouseMoved,
        MouseEntered,
        MouseExited,
        KeyDown,
        KeyUp,
        TextInput,
        ScrollWheel,
        CCKitDefined,
        ApplicationDefined,
        Periodic,
        SystemDefined
    }

    export enum SubType {
        ApplicationActivated,
        ApplicationDeactivated,
        ScreenChanged,
        WindowExposed,
        WindowMoved,
        WindowClosed,
        PowerOff,
        MouseEvent,
        Touch,
        Quit
    }

    export type ModifierFlags = number;
    export const ModifierFlags = {
        Shift: 1,
        Alt: 2,
        Ctrl: 4
    }
}

export default CCEvent;