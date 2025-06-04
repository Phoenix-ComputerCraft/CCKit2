import CCButton from "CCKit2/CCButton";
import CCEvent from "CCKit2/CCEvent";
import CCResponder from "CCKit2/CCResponder";
import CCScreen from "CCKit2/CCScreen";
import { CCColor, CCPoint, CCRect, CCSize } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCViewController from "CCKit2/CCViewController";
import CCWindowDelegate from "CCKit2/CCWindowDelegate";
import { CCWindowManagerFramebuffer } from "CCKit2/CCWindowManagerConnection";
import CCApplication from "CCKit2/CCApplication";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

const mouseResponders: {[key: number]: string} = {
    [CCEvent.Type.LeftMouseDown]: "mouseDown",
    [CCEvent.Type.LeftMouseDragged]: "mouseDragged",
    [CCEvent.Type.LeftMouseUp]: "mouseUp",
    [CCEvent.Type.RightMouseDown]: "rightMouseDown",
    [CCEvent.Type.RightMouseDragged]: "rightMouseDragged",
    [CCEvent.Type.RightMouseUp]: "rightMouseUp",
    [CCEvent.Type.OtherMouseDown]: "otherMouseDown",
    [CCEvent.Type.OtherMouseDragged]: "otherMouseDragged",
    [CCEvent.Type.OtherMouseUp]: "otherMouseUp",
    [CCEvent.Type.MouseMoved]: "mouseMoved",
    [CCEvent.Type.MouseEntered]: "mouseEntered",
    [CCEvent.Type.MouseExited]: "mouseExited",
    [CCEvent.Type.ScrollWheel]: "scrollWheel",
    [CCEvent.Type.HorizontalScrollWheel]: "horizontalScrollWheel",
};

/**
 * The CCWindow class represents a window displayed on screen. A CCWindow is
 * backed by a window region on the window server, and can be moved around,
 * stacked, and hidden. It controls all drawing to the window region it owns,
 * holds the view controller and views that are drawn to the region, and handles
 * events sent from the window server to the window.
 * @category Windows
 */
export class CCWindow extends CCResponder {
    /** The delegate for the window. */
    public delegate?: CCWindowDelegate;
    /** The main view controller for the window. */
    public contentViewController?: CCViewController;
    /** The main view for the window, if no view controller is used. */
    public contentView?: CCView;
    /** The style mask for the window. */
    public styleMask: CCWindow.StyleMask = CCWindow.StyleMask.Closable | CCWindow.StyleMask.Miniaturizable | CCWindow.StyleMask.Resizable;
    /** Whether the window receives key and mouse events when a modal window is in the foreground. */
    public get worksWhenModal(): boolean {return false;}
    /** Whether the window hides itself when the app is deactivated. */
    public hidesOnDeactivate: boolean = false;
    /** The background color for the window. */
    public backgroundColor: CCColor = CCColor.white;
    /** The color palette for the window. (Only relevant in fullscreen or graphics mode.) */
    public colorPalette: CCColor[] = [];
    /** Whether the window is able to hide. */
    public canHide: boolean = true;
    /** The position and size of the window. */
    public get frame(): CCRect {return this._frame;}
    public set frame(rect: CCRect) {
        this._frame = rect;
        if (this.contentViewController) {
            this.contentViewController.view.frame = {x: 1, y: 1, width: rect.width, height: rect.height};
        } else if (this.contentView) {
            this.contentView.frame = {x: 1, y: 1, width: rect.width, height: rect.height};
        }
    }
    private _frame: CCRect;
    /** The position of the window on screen. */
    public get position(): CCPoint {
        let [x, y] = this.framebuffer.getPosition();
        return {x: x, y: y};
    }
    /** The minimum size that the window will allow resizing to. */
    public minSize: CCSize = {width: 1, height: 1};
    /** The maximum size that the window will allow resizing to. */
    public maxSize: CCSize = {width: math.huge, height: math.huge};
    /** The level of the window on the screen. */
    public get level(): CCWindow.Level {return this._level;}
    public set level(level: CCWindow.Level) {
        this._level = level;
        // TODO: update level on screen
    }
    private _level: CCWindow.Level = CCWindow.Level.Normal;
    /** Whether the window is visible on screen. */
    public isVisible: boolean = true;
    /** Whether the window is the key window for the app. */
    public isKeyWindow: boolean = false;
    /** Whether the window can become the key window. */
    public canBecomeKey: boolean = true;
    /** Whether the window is the main window for the app. */
    public isMainWindow: boolean = false;
    /** Whether the window can become the main window. */
    public canBecomeMain: boolean = true;
    /** A list of child windows of the current window. */
    public childWindows: CCWindow[] = [];
    /** The parent window of the current window, if there is one. */
    public parent?: CCWindow;
    /** A button that will be triggered when the Enter key is pressed. */
    public get defaultButton(): CCButton | undefined {return this._defaultButton;}
    public set defaultButton(button: CCButton | undefined) {
        this._defaultButton = button;

    }
    private _defaultButton?: CCButton;
    /** Whether the window is excluded from the Window menu. */
    public isExcludedFromWindowsMenu: boolean = false;
    /** A list of windows that display as tabs under this one. */
    public tabbedWindows?: CCWindow[];
    /** The index of the currently selected window. */
    public get selectedTab(): number | undefined {return this._selectedTab;}
    public set selectedTab(tab: number) {
        this._selectedTab = tab;
        
    }
    private _selectedTab?: number;
    /** Whether the window will show tooltips even when the app is in the background. */
    public allowsToolTipsWhenApplicationIsInactive: boolean = false;
    /** The event that is currently being processed by the window. */
    public currentEvent?: CCEvent;
    /** The first responder for this window. */
    public get firstResponder(): CCResponder | undefined {return this._firstResponder;}
    private _firstResponder?: CCResponder;
    /** Whether any subviews require redrawing. */
    public viewsNeedDisplay: boolean = false;
    /** The title of the window. */
    public get title(): string {return this._title;}
    public set title(value: string) {
        this._title = value;
        if (this.framebuffer !== undefined) this.framebuffer.setTitle(value);
    }
    private _title: string = "Window";
    /** Whether the title bar is visible. */
    public titleVisible: boolean = true;
    /** A file path that the window represents. */
    public representedFilename?: string;
    /** The screen the window is on. */
    public screen?: CCScreen;
    /** Whether the screen can be moved. */
    public isMovable: boolean = true;
    /** Whether the entire window's background is a move target. */
    public isMovableByWindowBackground: boolean = false;

    /** The window's backing framebuffer. */
    private framebuffer: CCWindowManagerFramebuffer;
    private viewHasAppeared: boolean = false;

    /**
     * Creates a new window using a view controller for the contents.
     * @param viewController The view controller to use
     */
    public constructor(viewController: CCViewController);
    /**
     * Creates a new empty window with the specified parameters.
     * @param contentRect The position and size of the new window
     * @param styleMask A combination of style parameters for the window
     * @param defer Whether to defer creation of the window server's window until the window is moved on-screen
     * @param screen The screen to position the window on (defaults to the main screen)
     */
    public constructor(contentRect: CCRect, styleMask: CCWindow.StyleMask, defer: boolean, screen?: CCScreen);
    public constructor(first: CCViewController | CCRect, styleMask?: CCWindow.StyleMask, defer?: boolean, screen?: CCScreen) {
        super();
        if (first instanceof CCViewController) {
            this.contentViewController = first;
            first.nextResponder = this;
            const size = first.preferredContentSize;
            let fb = CCApplication.shared.wmConnection.createWindow(this, undefined, undefined, size.width, size.height, first.title || "Window", {closable: true, minimizable: true, resizable: true}); // TODO: options
            if (fb === undefined) throw "Could not create window";
            this.framebuffer = fb;
            first.loadViewIfNeeded();
            first.view.window = this;
            first.view.didMoveToSuperview();
        } else {
            this.contentView = new CCView(first);
            this.contentView.nextResponder = this;
            let fb = CCApplication.shared.wmConnection.createWindow(this, first.x, first.y, first.width, first.height, "Window", {
                utility: (styleMask! & CCWindow.StyleMask.UtilityWindow) != 0,
                borderless: (styleMask! & CCWindow.StyleMask.Borderless) != 0,
                closable: (styleMask! & CCWindow.StyleMask.Closable) != 0,
                minimizable: (styleMask! & CCWindow.StyleMask.Miniaturizable) != 0,
                resizable: (styleMask! & CCWindow.StyleMask.Resizable) != 0,
                z: (styleMask! & CCWindow.StyleMask.AboveOthers) != 0 ? 1 : 0,
            });
            if (fb === undefined) throw "Could not create window";
            this.framebuffer = fb;
            this.contentView.window = this;
        }
        const [width, height] = this.framebuffer.getSize();
        this._frame = {x: 1, y: 1, width: width, height: height};
        this.frame = this._frame;
        CCApplication.shared.windows.push(this);
        this.nextResponder = CCApplication.shared;
    }

    /**
     * Toggles whether the window is in fullscreen.
     */
    public toggleFullscreen(): void {
        throw "Not implemented";
    }

    /**
     * Tells the window manager to hide the window.
     */
    public orderOut(): void {
        throw "Not implemented";
    }

    /**
     * Tells the window manager to move the window to the back of the screen.
     */
    public orderBack(): void {
        this.framebuffer.sendBack();
    }

    /**
     * Tells the window manager to move the window to the front of the screen,
     * without making it the key window.
     */
    public orderFront(): void {
        this.framebuffer.sendFront();
    }

    /**
     * Tells the window manager to move the window relative to another window.
     * @param order The way to order the window
     * @param window The other window to position relative to
     * @typecheck
     */
    public order(order: CCWindow.OrderingMode, window: CCWindow): void {
        throw "Not implemented";
    }

    /**
     * Makes the window the key window of the app.
     */
    public makeKey(): void {
        // TODO: shouldBecomeKey?
        CCApplication.shared.keyWindow = this;
        this._becomeKey();
    }

    /**
     * Makes the window the key window of the app, and moves the window to the
     * front of the screen.
     */
    public makeKeyAndOrderFront(): void {
        CCApplication.shared.keyWindow = this;
        this.framebuffer.sendFrontAndFocus();
    }

    /**
     * Called when the window becomes the key window. Don't call this.
     * @package
     */
    _becomeKey(): void {
        //throw "Not implemented";
    }

    /**
     * Called when the window will no longer be the key window. Don't call this.
     * @package
     */
    _resignKey(): void {
        //throw "Not implemented";
    }

    /**
     * Makes the window the main window of the app.
     */
    public makeMain(): void {
        //throw "Not implemented";
    }

    /**
     * Called when the window becomes the main window. Don't call this.
     * @package
     */
    _becomeMain(): void {
        //throw "Not implemented";
    }

    /**
     * Called when the window will no longer be the main window. Don't call this.
     * @package
     */
    _resignMain(): void {
        //throw "Not implemented";
    }

    /**
     * Adds a new window as a child of the current window.
     * @param window The window to add
     * @param order How to order the window relative to the current one
     * @typecheck
     */
    public addChildWindow(window: CCWindow, order: CCWindow.OrderingMode): void {
        throw "Not implemented";
    }

    /**
     * Removes the selected window as a child.
     * @param window The window to remove
     * @typecheck
     */
    public removeChildWindow(window: CCWindow): void {
        throw "Not implemented";
    }

    /**
     * Adds a window as a child tab of the current window.
     * @param window The window to add
     * @param index The index to place the new window at
     * @typecheck
     */
    public addTabbedWindow(window: CCWindow, index?: number): void {
        throw "Not implemented";
    }

    /**
     * Moves this tabbed window into its own independent window on screen.
     */
    public moveTabToNewWindow(): void {
        throw "Not implemented";
    }

    private mouseDownView?: CCView;
    private sendMouseEvent(event: CCEvent): void {
        if (this.contentView) {
            let view = this.mouseDownView ?? this.contentView.hitTest(event.locationInWindow!);
            if (view) {
                view.tryToCall(mouseResponders[event.type], event);
                if (event.type == CCEvent.Type.LeftMouseDown && this._firstResponder !== view && view.acceptsFirstResponder && view.becomeFirstResponder() && (!this._firstResponder || this._firstResponder.resignFirstResponder())) {
                    this._firstResponder = view;
                }
                switch (event.type) {
                    case CCEvent.Type.LeftMouseDown:
                    case CCEvent.Type.RightMouseDown:
                    case CCEvent.Type.OtherMouseDown:
                        this.mouseDownView = view;
                        break;
                    case CCEvent.Type.LeftMouseUp:
                    case CCEvent.Type.RightMouseUp:
                    case CCEvent.Type.OtherMouseUp:
                        this.mouseDownView = undefined;
                        break;
                }
            }
        } else if (this.contentViewController) {
            let view = this.mouseDownView ?? this.contentViewController.view.hitTest(event.locationInWindow!);
            if (view) {
                view.tryToCall(mouseResponders[event.type], event);
                if (event.type == CCEvent.Type.LeftMouseDown && this._firstResponder !== view && view.acceptsFirstResponder && view.becomeFirstResponder() && (!this._firstResponder || this._firstResponder.resignFirstResponder())) {
                    this._firstResponder = view;
                }
                switch (event.type) {
                    case CCEvent.Type.LeftMouseDown:
                    case CCEvent.Type.RightMouseDown:
                    case CCEvent.Type.OtherMouseDown:
                        this.mouseDownView = view;
                        break;
                    case CCEvent.Type.LeftMouseUp:
                    case CCEvent.Type.RightMouseUp:
                    case CCEvent.Type.OtherMouseUp:
                        this.mouseDownView = undefined;
                        break;
                }
            }
        }
    }

    /**
     * Sends an event to the appropriate responder.
     * @param event The event to send
     */
    public sendEvent(event: CCEvent): void {
        switch (event.type) {
            case CCEvent.Type.LeftMouseDown:
            case CCEvent.Type.LeftMouseDragged:
            case CCEvent.Type.LeftMouseUp:
            case CCEvent.Type.RightMouseDown:
            case CCEvent.Type.RightMouseDragged:
            case CCEvent.Type.RightMouseUp:
            case CCEvent.Type.OtherMouseDown:
            case CCEvent.Type.OtherMouseDragged:
            case CCEvent.Type.OtherMouseUp:
            case CCEvent.Type.MouseMoved:
            case CCEvent.Type.MouseEntered:
            case CCEvent.Type.MouseExited:
                this.sendMouseEvent(event);
                break;
            case CCEvent.Type.KeyDown:
                if (this.firstResponder) this.firstResponder.tryToCall("keyDown", event);
                break;
            case CCEvent.Type.KeyUp:
                if (this.firstResponder) this.firstResponder.tryToCall("keyUp", event);
                break;
            case CCEvent.Type.TextInput:
                if (this.firstResponder) this.firstResponder.tryToCall("textInput", event);
                break;
            case CCEvent.Type.ScrollWheel:
            case CCEvent.Type.HorizontalScrollWheel:
                this.sendMouseEvent(event);
                break;
            case CCEvent.Type.CCKitDefined:
            case CCEvent.Type.ApplicationDefined:
                if (this.firstResponder) this.firstResponder.tryToCall("customEvent", event);
                break;
            case CCEvent.Type.Periodic:
                break;
            case CCEvent.Type.SystemDefined:
                switch (event.subtype) {
                    case CCEvent.SubType.ApplicationActivated:
                    case CCEvent.SubType.ApplicationDeactivated:
                    case CCEvent.SubType.ScreenChanged:
                    case CCEvent.SubType.WindowExposed:
                    case CCEvent.SubType.WindowMoved:
                    case CCEvent.SubType.WindowActivated:
                    case CCEvent.SubType.WindowDeactivated:
                        break;
                    case CCEvent.SubType.WindowClosed:
                        this.close();
                        break;
                    case CCEvent.SubType.WindowResized:
                        const [width, height] = this.framebuffer.getSize();
                        this.frame = {x: 1, y: 1, width: width, height: height};
                        break;
                    case CCEvent.SubType.PowerOff:
                    case CCEvent.SubType.MouseEvent:
                    case CCEvent.SubType.Touch:
                        break;
                }
                break;
        }
        this.update();
    }

    /**
     * Makes the selected responder the window's first responder.
     * @param responder The responder that should be first responder
     * @returns Whether the responder is now the first responder
     */
    public makeFirstResponder(responder?: CCResponder): boolean {
        if (this._firstResponder === responder) return true;
        if (this._firstResponder !== undefined) {
            if (!this._firstResponder.resignFirstResponder()) return false;
        }
        if (responder !== undefined && !responder.becomeFirstResponder()) {
            this._firstResponder = this;
            return true;
        }
        this._firstResponder = responder ?? this;
        return true;
    }

    /**
     * Redraws all subviews in the window.
     */
    public display(): void {
        if (this.framebuffer === undefined) return;
        this.framebuffer.setCursorBlink(false);
        CCGraphicsContext.current = new CCGraphicsContext(this.framebuffer);
        CCGraphicsContext.current.pushState();
        if (this.contentViewController) {
            if (!this.viewHasAppeared) {
                this.contentViewController.viewWillAppear(false);
            }
            this.contentViewController.view.layoutSubtree();
            const size = this.contentViewController.view.frame;
            CCGraphicsContext.current.setRect(size);
            this.contentViewController.view.display({x: 1, y: 1, width: size.width, height: size.height});
            if (!this.viewHasAppeared) {
                this.contentViewController.viewDidAppear(false);
                this.viewHasAppeared = true;
            }
        } else if (this.contentView) {
            this.contentView.layoutSubtree();
            const size = this.contentView.frame;
            CCGraphicsContext.current.setRect(size);
            this.contentView.display({x: 1, y: 1, width: size.width, height: size.height});
        }
        CCGraphicsContext.current = undefined;
        let cursor = this._firstResponder?.cursorPos();
        if (cursor !== undefined) {
            this.framebuffer.setCursorPos(cursor[0].x, cursor[0].y);
            this.framebuffer.setTextColor(cursor[1]);
            this.framebuffer.setCursorBlink(true);
        }
    }

    /**
     * Redraws only views that need to be redrawn.
     */
    public displayIfNeeded(): void {
        if (this.viewsNeedDisplay) {
            this.viewsNeedDisplay = false;
            this.display();
        }
    }

    /**
     * Disables drawing directly to the screen until the next flush.
     */
    public disableScreenUpdatesUntilFlush(): void {
        this.framebuffer.setVisible(false);
    }

    /**
     * Updates the window.
     */
    public update(): void {
        if (this.viewsNeedDisplay) {
            this.displayIfNeeded();
            //this.framebuffer.setVisible(true);
            if (this.framebuffer !== undefined) this.framebuffer.redraw();
        }
    }

    // Backing store coordinates refer to the coordinates used when directly
    // drawing to the screen, which differs in text and graphics mode.
    // Screen coordinates are the same in both modes, but use decimals in
    // graphics mode to indicate pixel-perfect positioning.

    /**
     * Returns a backing store pixel-aligned rectangle in window coordinates.
     * @param rect The rectangle to align in window coordinates
     * @param alignment How to align the rectangle
     * @returns The new aligned rectangle in window coordinates
     */
    public backingAlignedRect(rect: CCRect, alignment: CCWindow.AlignmentOptions): CCRect {
        throw "Not implemented";
    }

    /**
     * Returns a rectangle converted from backing store coordinates to window coordinates.
     * @param rect The rectangle to convert, in backing store coordinates
     * @returns The rectangle converted to window coordinates
     */
    public convertFromBacking(rect: CCRect): CCRect {
        throw "Not implemented";
    }

    /**
     * Returns a rectangle converted from screen coordinates to window coordinates.
     * @param rect The rectangle to convert, in screen coordinates
     * @returns The rectangle converted to window coordinates
     */
    public convertFromScreen(rect: CCRect): CCRect {
        throw "Not implemented";
    }

    /**
     * Returns a rectangle converted from window coordinates to backing store coordinates.
     * @param rect The rectangle to convert, in window coordinates
     * @returns The rectangle converted to backing store coordinates
     */
    public convertToBacking(rect: CCRect): CCRect {
        throw "Not implemented";
    }

    /**
     * Returns a rectangle converted from window coordinates to screen coordinates.
     * @param rect The rectangle to convert, in window coordinates
     * @returns The rectangle converted to screen coordinates
     */
    public convertToScreen(rect: CCRect): CCRect {
        throw "Not implemented";
    }

    /**
     * Returns a point converted from backing store coordinates to window coordinates.
     * @param point The point to convert, in backing store coordinates
     * @returns The point converted to window coordinates
     */
    public convertPointFromBacking(point: CCPoint): CCPoint {
        throw "Not implemented";
    }

    /**
     * Returns a point converted from screen coordinates to window coordinates.
     * @param point The point to convert, in screen coordinates
     * @returns The point converted to window coordinates
     */
    public convertPointFromScreen(point: CCPoint): CCPoint {
        throw "Not implemented";
    }

    /**
     * Returns a point converted from window coordinates to backing store coordinates.
     * @param point The point to convert, in window coordinates
     * @returns The point converted to backing store coordinates
     */
    public convertPointToBacking(point: CCPoint): CCPoint {
        throw "Not implemented";
    }

    /**
     * Returns a point converted from window coordinates to screen coordinates.
     * @param point The point to convert, in window coordinates
     * @returns The point converted to screen coordinates
     */
    public convertPointToScreen(point: CCPoint): CCPoint {
        throw "Not implemented";
    }

    /**
     * Sets the represented file for the window, updating the title in the process.
     * @param path The path to set
     */
    public setTitleWithRepresentedFilename(path: string): void {
        throw "Not implemented";
    }

    /**
     * Centers the window on screen.
     */
    public center(): void {
        throw "Not implemented";
    }

    /**
     * Closes the window and removes it from the screen.
     */
    public close(): void {
        this.framebuffer.close();
        if (this.parent && this.isKeyWindow) this.parent.makeKey();
        // TODO: refactor into CCApplication?
        let index = CCApplication.shared.windows.indexOf(this);
        if (index !== -1) CCApplication.shared.windows.splice(index, 1);
        if (CCApplication.shared.windows.length === 0) CCApplication.shared.terminate();
        // @ts-ignore
        this.framebuffer = undefined; // TODO: UGLY!!!
    }
}

/**
 * @category Windows
 */
export namespace CCWindow {
    export enum StyleMask {
        Borderless = 1,
        Titled = 2,
        Closable = 4,
        Miniaturizable = 8,
        Resizable = 16,
        FullScreen = 32,
        FullSizeContentView = 64,
        UtilityWindow = 128,
        AboveOthers = 256,
    }

    export enum OrderingMode {
        Out,
        Above,
        Below
    }

    export enum Level {
        Desktop = -4,
        Normal = -3,
        Dialog = -2,
        Panel = -1,
        ModalDialog = 0,
        Alert = 1,
        Dock = 2,
        Menu = 3
    }

    export enum Alignment {
        Inward,
        Outward,
        Nearest
    }

    export type AlignmentOptions = {
        alignMinX?: Alignment;
        alignMinY?: Alignment;
        alignMaxX?: Alignment;
        alignMaxY?: Alignment;
        alignWidth?: Alignment;
        alignHeight?: Alignment;
        alignAllEdges?: Alignment;
        alignRectFlipped?: true;
    }
}

export default CCWindow;