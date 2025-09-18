import CCAppearance from "CCKit2/CCAppearance";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCEvent from "CCKit2/CCEvent";
import CCImage from "CCKit2/CCImage";
import CCMenu from "CCKit2/CCMenu";
import CCResponder from "CCKit2/CCResponder";
import { CCError } from "CCKit2/CCTypes";
import CCViewController from "CCKit2/CCViewController";
import CCWindow from "CCKit2/CCWindow";
import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";

/**
 * The CCApplication class is the main class that controls the app run loop,
 * handles events, and manages the lifecycle of the program.
 * @category Application
 */
export class CCApplication extends CCResponder {
    /** The CCApplication instance for the current app. */
    public static shared: CCApplication;

    /** A delegate object to receive lifecycle notifications. */
    public delegate: CCApplicationDelegate;
    /** Whether the current app is the active app. */
    public isActive: boolean = false;
    /** Whether the main loop is currently running. */
    public isRunning: boolean = false;
    /** Whether the app is currently hidden. */
    public isHidden: boolean = false;

    /** A list of all windows in the application. */
    public windows: CCWindow[] = [];
    /** The main window of the application. */
    public mainWindow?: CCWindow;
    /** The key window, which gets input events. */
    public keyWindow?: CCWindow;
    /** The modal window being displayed, if it exists. */
    public modalWindow?: CCWindow;
    /** The connection to the window manager for the app. */
    public wmConnection: CCWindowManagerConnection;

    /** The desired appearance of the app. */
    public appearance?: CCAppearance;
    /** The icon for the app. */
    public appIcon?: CCImage;
    /** The menu bar entries for the app. */
    public get menu(): CCMenu | undefined {return this._menu;}
    public set menu(value: CCMenu | undefined) {
        this._menu = value;
        if (value && this.wmConnection.updateAppMenu)
            this.wmConnection.updateAppMenu(value.serialize());
    }
    private _menu?: CCMenu;

    /** The event currently being processed. */
    public get currentEvent(): CCEvent | undefined {
        return this.eventQueue[0];
    };

    private eventQueue: CCEvent[] = [];

    /**
     * @package
     */
    constructor(del: CCApplicationDelegate, args: string[]) {
        super();
        if (CCApplication.shared != undefined) throw "CCApplication instance already exists";
        this.delegate = del;
        CCApplication.shared = this;
        let conn: CCWindowManagerConnection | undefined = undefined;
        for (let i = 0; i < args.length; i++) {
            if (args[i] === "--help") {
                print(
`Arguments for CCKit2 applications:
  --backend <name|path>: Selects a window manager to override the default choice.
  --open <path>: Opens a file or directory using the application, if supported.
  --help: Shows this help.`
                );
                throw "";
            } else if (args[i] === "--backend") {
                i++;
                if (args[i] === null) throw "Missing parameter for --backend argument";
                let mod: {default: new (app: CCApplication) => CCWindowManagerConnection};
                if (args[i].indexOf("/") !== -1) {
                    mod = dofile(args[i]);
                } else if (args[i].indexOf(".") !== -1) {
                    mod = require(args[i]);
                } else {
                    mod = require("CCKit2." + args[i]);
                }
                if (typeof mod.default !== "function") throw ""
                conn = new mod.default(this);
            } else if (args[i] === "--open") {
                i++;
                // TODO: finish
                if (args[i] !== undefined && del.applicationOpenFile !== undefined) {
                    del.applicationOpenFile(this, args[i]);
                }
            }
        }
        if (conn) this.wmConnection = conn;
        else this.wmConnection = del.applicationWindowManagerConnection(this);
    }

    /**
     * Returns the first event in the queue which matches the specified name.
     * @param matching The event name to match
     * @param dequeue Whether to pop the event from the queue
     * @returns The matching event, or null if not found
     * @typecheck
     */
    public nextEvent(matching: string, dequeue: boolean): CCEvent | undefined {
        const idx = this.eventQueue.findIndex(ev => (ev.phoenixEvent && ev.phoenixEvent.name == matching) || (ev.ccEvent && ev.ccEvent[0] == matching));
        if (idx === -1) return undefined;
        const ev = this.eventQueue[idx];
        if (dequeue) this.eventQueue.splice(idx, 1);
        return ev;
    }

    /**
     * Discards any event matching the specified event name, optionally only
     * before another event.
     * @param matching The event name to match
     * @param before If provided, only events before this event will be removed
     * @typecheck
     */
    public discardEvents(matching: string, before?: CCEvent): void {
        throw "Not implemented";
    }

    /**
     * Forwards an event to the correct receiver.
     * @param event The event to send
     * @typecheck
     */
    public sendEvent(event: CCEvent): void {
        if (event.type === CCEvent.Type.CCKitDefined && event.subtype === CCEvent.SubType.Quit) {
            if (this.delegate.applicationWillTerminate) this.delegate.applicationWillTerminate(this);
            this.stop();
        }
        if (event.type === CCEvent.Type.MenuItem && this._menu) {
            this._menu.triggerAction(event.menuItemKey!);
            return;
        }
        if (event.window !== undefined) return event.window.sendEvent(event);
        if (this.keyWindow) return this.keyWindow.sendEvent(event);
        return;
    }

    /**
     * Adds an event to the event queue, to be processed by the run loop.
     * @param event The event to queue
     * @param atStart Whether to add it to the front of the queue
     * @typecheck
     */
    public postEvent(event: CCEvent, atStart: boolean): void {
        if (atStart) this.eventQueue.unshift(event);
        else this.eventQueue.push(event);
    }

    /**
     * Called to activate the application before starting the main loop.
     */
    public finishLaunching(): void {
        if (this.delegate && this.delegate.applicationDidFinishLaunching)
            this.delegate.applicationDidFinishLaunching(this, {
                isOpeningFile: false,
                isPrintingFile: false,
                isPerformingService: false,
                isFromNotification: false
            });
    }

    /**
     * Run the main event loop.
     * @throws If the event loop is already running.
     */
    public run(): void {
        if (this.isRunning) throw "Run loop already running";
        this.finishLaunching();
        this.isRunning = true;
        while (this.isRunning) {
            if (this.eventQueue.length === 0) {
                this.eventQueue.push(this.wmConnection.pullEvent());
            }
            this.sendEvent(this.eventQueue.shift()!);
        }
    }

    /**
     * Stops the event loop.
     */
    public stop(): void {
        this.isRunning = false;
    }

    /**
     * Sends a notification to terminate the app.
     */
    public terminate(): void {
        if (this.delegate.applicationShouldTerminate) {
            let reply = this.delegate.applicationShouldTerminate(this);
            switch (reply) {
                case CCApplication.TerminateReply.TerminateNow:
                    break;
                case CCApplication.TerminateReply.TerminateCancel:
                case CCApplication.TerminateReply.TerminateLater: // ?
                    return;
            }
        }
        let event = new CCEvent();
        event.timestamp = os.time();
        event.type = CCEvent.Type.CCKitDefined;
        event.subtype = CCEvent.SubType.Quit;
        this.postEvent(event, true);
    }

    /**
     * Follows up to a previous response from the app delegate to delay termination.
     * @param terminate Whether to terminate the app now
     */
    public replyToApplicationShouldTerminate(terminate: boolean): void {
        throw "Not implemented";
    }

    /**
     * Activates the app.
     * @param ignoreOtherApps If false, will not activate if another app is already active
     */
    public activate(ignoreOtherApps: boolean): void {
        throw "Not implemented";
    }

    /**
     * Deactivates the app.
     */
    public deactivate(): void {
        throw "Not implemented";
    }

    /**
     * Hides the app from the screen, activating the next app.
     */
    public hide(): void {
        throw "Not implemented";
    }

    /**
     * Unhides and (optionally) activates the app.
     * @param activate Whether to also activate the app
     */
    public unhide(activate?: boolean): void {
        throw "Not implemented";
    }

    /**
     * Updates all windows in the application.
     */
    public updateWindows(): void {
        for (let window of this.windows) {
            window.update();
        }
    }

    /**
     * Runs a modal event loop for a window, pausing event processing until the
     * window is closed and the modal state is cleared.
     * @param window The modal window to show
     * @returns A response code indicating how the modal exited
     * @typecheck
     */
    public runModal(window: CCWindow): CCApplication.ModalResponse {
        throw "Not implemented";
    }

    /**
     * Stops a modal event loop in progress.
     * @param code If specified, a code to return from `runModal`
     * @typecheck
     */
    public stopModal(code?: CCApplication.ModalResponse): void {
        throw "Not implemented";
    }

    /**
     * Aborts a modal run loop.
     */
    public abortModal(): void {
        throw "Not implemented";
    }

    /**
     * Shows a color picker dialog.
     */
    public showColorPicker(): void {
        throw "Not implemented";
    }

    /**
     * Shows an About window for the app.
     * @param options Any options to pass to the window
     * @typecheck
     */
    public showAboutWindow(options?: {icon?: CCImage, name?: string, version?: string, build?: number, credits?: string}): void {
        throw "Not implemented";
    }

    /**
     * Shows a character palette window.
     */
    public showCharacterPalette(): void {
        throw "Not implemented";
    }

    /**
     * Displays an error message in a popup window.
     * @param error The error to show
     * @param window If specified, a window to show the error as a modal on
     * @param callback If specified, a function to call when the popup appears on screen
     * @typecheck
     */
    public presentError(error: CCError, window?: CCWindow, callback?: () => void): void {
        throw "Not implemented";
    }
}

/**
 * @category Application
 */
export namespace CCApplication {
    export enum ModalResponse {
        OK,
        Cancel,
        Continue,
        Stop,
        Abort,
        AlertFirstButtonReturn,
        AlertSecondButtonReturn,
        AlertThirdButtonReturn
    }

    export enum TerminateReply {
        TerminateNow,
        TerminateCancel,
        TerminateLater
    }

    export type LaunchOptions = {
        isOpeningFile: boolean,
        isPrintingFile: boolean,
        isPerformingService: boolean,
        isFromNotification: boolean,
        sourceFile?: string,
        sourceURL?: string,
        sourceApplication?: string
    }
}

export default CCApplication;