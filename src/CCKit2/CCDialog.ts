import CCViewController from "CCKit2/CCViewController";
import CCWindow from "CCKit2/CCWindow";
import { CCColor, CCSize } from "CCKit2/CCTypes";
import CCTextView from "CCKit2/CCTextView";
import CCButton from "CCKit2/CCButton";
import CCApplication from "./CCApplication";

class CCDialogViewController extends CCViewController {
    private dialog: CCDialog;

    private select(button: number): void {
        this.view.window!.close();
        if (this.dialog.completionHandler) this.dialog.completionHandler(this.dialog, button);
    }

    constructor(d: CCDialog) {
        super();
        this.dialog = d;
    }

    public get preferredContentSize(): CCSize {
        let buttonWidth = -1;
        for (let button of this.dialog.buttons) buttonWidth += button.length + 3;
        let width = Math.max(buttonWidth, Math.min(this.dialog.message.length, 40));
        return {width: width, height: Math.ceil(this.dialog.message.length / (width - 5)) + 3};
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
        this.view.backgroundColor = CCColor.white;
        let textView = new CCTextView({x: 1, y: 2, width: this.view.frame.width, height: this.view.frame.height - 3});
        textView.text = this.dialog.message;
        this.view.addSubview(textView);

        for (let i = this.dialog.buttons.length - 1, x = this.view.frame.width + 1; i >= 0; i--) {
            x -= this.dialog.buttons[i].length + 3;
            const ci = i;
            let button = new CCButton({x: x, y: this.view.frame.height - 1}, this.dialog.buttons[i], () => this.select(ci));
            if (i === this.dialog.defaultButton) button.isDefault = true;
            this.view.addSubview(button);
        }
    }
}

/**
 * A dialog displays a new window on the screen with the specified message.  
 * ![Example image](../../images/CCDialog.png)
 * 
 * @example Display a simple alert box and call a function when it finishes.
 * ```ts
 * CCDialog.messageWithOneButton(undefined, "Hello", "Hello World!", () => doSomething());
 * ```
 * ```lua
 * CCDialog:messageWithOneButton(nil, "Hello", "Hello World!", function() doSomething() end)
 * ```
 * 
 * @example Display a dialog with multiple buttons and do something based on the button pressed.
 * ```ts
 * let dialog = new CCDialog();
 * dialog.title = "Confirm";
 * dialog.message = "Are you sure you want to do this?";
 * dialog.buttons = ["No", "Yes"];
 * dialog.defaultButton = 0;
 * dialog.completionHandler = (_, selection) => {
 *     if (selection === 1) this.doThing();
 * };
 * dialog.display(this.view.window);
 * ```
 * ```lua
 * local dialog = LuaWrappers.new(CCDialog)
 * dialog.title = "Confirm"
 * dialog.message = "Are you sure you want to do this?"
 * dialog.buttons = {"No", "Yes"}
 * dialog.defaultButton = 0
 * dialog.completionHandler = function(_, selection)
 *     if selection == 1 then self:doThing() end
 * end
 * dialog:display(self.view.window)
 * ```
 * 
 * @category Windows
 */
export default class CCDialog {
    /** The title for the alert window. */
    public title: string = "Alert";
    /** The message to display in the window. */
    public message: string = "Alert";
    /** The buttons to display in the window, from left to right. */
    public buttons: string[] = ["OK"];
    /** The index of the default button. */
    public defaultButton?: number = 0;
    /** The function to call when the dialog is closed. */
    public completionHandler?: (this: void, sender: CCDialog, selection: number) => void;

    /**
     * Displays the dialog on screen. This returns after creating the window.
     * @param parent The parent window of the dialog, if available
     */
    public display(parent?: CCWindow): void {
        let window = new CCWindow(new CCDialogViewController(this));
        window.parent = parent ?? CCApplication.shared.keyWindow;
        window.title = this.title;
        window.display();
        window.makeKeyAndOrderFront();
    }

    /**
     * Displays a single-use dialog with a single "OK" button. This returns after creating the window.
     * @param parent The parent window to place the dialog under
     * @param title The title for the dialog
     * @param message The message to show
     * @param completionHandler A function to call when the dialog is closed
     */
    public static messageWithOneButton(parent: CCWindow | undefined, title: string, message: string, completionHandler?: (this: void, sender: CCDialog, selection: number) => void): void {
        let dialog = new CCDialog();
        dialog.title = title;
        dialog.message = message;
        dialog.completionHandler = completionHandler;
        dialog.display(parent);
    }
};
