import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCViewController from "CCKit2/CCViewController";
import CCWindow from "CCKit2/CCWindow";

/**
 * Starts the application main loop by creating the shared CCApplication,
 * creating the main window with the specified view controller class, and
 * running the main event loop.
 * @category Application
 * @param viewController The class for the main view controller
 * @param delegate The application delegate for the program
 * @typecheck
 */
export default function CCApplicationMain(viewController: new () => CCViewController, delegate: CCApplicationDelegate, ...args: string[]): void {
    let app = new CCApplication(delegate, args);
    let vc = new viewController();
    let win = new CCWindow(vc);
    app.mainWindow = win;
    win.display();
    win.makeKeyAndOrderFront();
    app.run();
}