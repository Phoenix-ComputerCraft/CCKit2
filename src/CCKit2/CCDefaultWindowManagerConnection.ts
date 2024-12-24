import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";
import CCApplication from "CCKit2/CCApplication";

/**
 * Creates a new window manager connection for the current platform's default
 * connection type.
 * @category Windows
 * @param app The application the window manager is for
 * @returns A new window manager connection
 */
export default function CCDefaultWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
    throw "Missing implementation for CCDefaultWindowManagerConnection - make sure you installed the correct version for your platform.\n\n- On CraftOS, ensure CCCraftOSWindowManagerConnection.lua exists.\n- On Phoenix standalone, install the cckit2-framebuffer package.\n- On Phoenix with Hydra, make sure hydra is installed correctly.";
}