import CCApplication from "CCKit2/CCApplication";
import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";

/**
 * An application implementing the CCApplicationDelegate interface can be used
 * to receive life cycle events from the application.
 */
export default interface CCApplicationDelegate {
    /** Called to get a window manager connection for the app. This is required. */
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection;
    /** Called when the application is about to finish launching. */
    applicationWillFinishLaunching?(app: CCApplication, launchOptions: CCApplication.LaunchOptions): void;
    /** Called when the application finished launching. */
    applicationDidFinishLaunching?(app: CCApplication, launchOptions: CCApplication.LaunchOptions): void;
    /** Called when the application is about to become active. */
    applicationWillBecomeActive?(app: CCApplication): void;
    /** Called when the application became active. */
    applicationDidBecomeActive?(app: CCApplication): void;
    /** Called when the application is about to become inactive. */
    applicationWillResignActive?(app: CCApplication): void;
    /** Called when the application became inactive. */
    applicationDidResignActive?(app: CCApplication): void;
    /** Called when the application requests to terminate, checking whether it should. */
    applicationShouldTerminate?(app: CCApplication): CCApplication.TerminateReply;
    /** Called when the application is about to terminate. */
    applicationWillTerminate?(app: CCApplication): void;
    /** Called when the application is about to hide. */
    applicationWillHide?(app: CCApplication): void;
    /** Called when the application was hidden. */
    applicationDidHide?(app: CCApplication): void;
    /** Called when the application is about to unhide. */
    applicationWillUnhide?(app: CCApplication): void;
    /** Called when the application was unhidden. */
    applicationDidUnhide?(app: CCApplication): void;
    /** Called when the application is about to update all windows. */
    applicationWillUpdate?(app: CCApplication): void;
    /** Called when the application updated all windows. */
    applicationDidUpdate?(app: CCApplication): void;
    /** Called when an attached screen updates. */
    applicationDidChangeScreenParameters?(app: CCApplication): void; // TODO: add parameters for this
    /** Called to open one or more URLs. */
    applicationOpen?(app: CCApplication, url: string[]): void;
    /** Called to open a file; returns whether the file was opened. */
    applicationOpenFile?(app: CCApplication, path: string): boolean;
    /** Called to open multiple files. */
    applicationOpenFiles?(app: CCApplication, paths: string[]): void;
    /** Called to open a file without showing UI; returns whether the file was opened. */
    applicationOpenFileWithoutUI?(app: CCApplication, path: string): boolean;
    /** Called to open a temporary file; returns whether the file was opened. */
    applicationOpenTempFile?(app: CCApplication, path: string): boolean;
    /** Called to ask whether the app is able to open untitled files. */
    applicationShouldOpenUntitledFile?(app: CCApplication): boolean;
    /** Called to open an untitled file; returns whether the file was opened. */
    applicationOpenUntitledFile?(app: CCApplication): boolean;
    /** Called to print a file to a printer; returns whether the file was printed. */
    applicationPrintFile?(app: CCApplication, path: string): boolean;

}