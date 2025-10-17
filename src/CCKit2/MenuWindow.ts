import CCBoxView from "CCKit2/CCBoxView";
import CCTableView from "CCKit2/CCTableView";
import CCTableViewDelegate from "CCKit2/CCTableViewDelegate";
import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCLabel from "CCKit2/CCLabel";
import CCCheckbox from "CCKit2/CCCheckbox";
import CCMenu from "CCKit2/CCMenu";
import { CCSize, CCColor, CCPoint } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCViewController from "CCKit2/CCViewController";
import CCWindow from "CCKit2/CCWindow";
import CCApplication from "CCKit2/CCApplication";
import CCEvent from "CCKit2/CCEvent";

class MenuController extends CCViewController implements CCTableViewDelegate, CCTableViewDataSource {
    private menu: CCMenu;
    private width: number;
    private pos: CCPoint;
    private hasControls: boolean = false;
    public child?: MenuController;
    private parent?: MenuController;
    private noClose: boolean = false;

    public get preferredContentSize(): CCSize {
        return {width: this.width, height: this.menu.length + 2};
    }

    public get preferredStyle(): CCWindow.StyleMask {
        return CCWindow.StyleMask.Borderless;
    }

    public get initialPosition(): CCPoint | undefined {
        return this.pos;
    }

    public constructor(pos: CCPoint, menu: CCMenu, parent?: MenuController) {
        super();
        this.menu = menu;
        this.pos = pos;
        this.parent = parent;
        let width = 2;
        for (let i = 0; i < menu.length; i++) {
            const item = menu.itemAtIndex(i)!;
            if (item.title !== undefined) {
                let iw = item.title.length + 2;
                if (item.checkbox !== undefined || item.radioGroup !== undefined) {
                    this.hasControls = true;
                    iw += 2;
                }
                if (item.submenu !== undefined) iw += 2;
                width = Math.max(width, iw);
            }
        }
        this.width = width;
    }

    public close(up: boolean, down: boolean): void {
        if (this.noClose) return;
        if (down && this.child !== undefined) {
            this.child.close(false, true);
        }
        this.view.window?.close();
        this.view.window = undefined;
        if (this.parent !== undefined) {
            this.parent.child = undefined;
            if (up) return this.parent.close(true, false);
        }
    }

    public prepareClose(up: boolean, down: boolean): void {
        if (down && this.child !== undefined) this.child.prepareClose(false, true);
        this.noClose = false;
        if (up && this.parent !== undefined) return this.parent.prepareClose(true, false);
    }

    public preventClose(): void {
        this.noClose = true;
        if (this.parent !== undefined) return this.parent.preventClose();
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
        let box = new CCBoxView(this.view.frame);
        this.view.addSubview(box);
        let table = new CCTableView({x: 1, y: 1, width: this.view.frame.width - 2, height: this.view.frame.height - 2}, this);
        table.delegate = this;
        table.rowColorB = CCColor.white;
        box.addSubview(table);
    }

    public numberOfRows(table: CCTableView): number {
        return this.menu.length;
    }
    
    public numberOfColumns(table: CCTableView, row: number): number {
        return 1;
    }
    
    public widthOfColumn?(table: CCTableView, row: number, column: number): number {
        return this.width - 2;
    }
    
    public contentsOfCell(table: CCTableView, row: number, column: number): CCView {
        let item = this.menu.itemAtIndex(row)!;
        if (item.title === undefined) {
            let label = new CCLabel({x: 1, y: 1}, string.rep(string.char(0x8C), this.width - 2));
            label.textColor = CCColor.lightGray;
            return label;
        } else if (item.checkbox !== undefined) {
            let checkbox = new CCCheckbox({x: 1, y: 1}, item.title);
            checkbox.checked = item.checkbox;
            checkbox.isEnabled = item.isEnabled;
            checkbox.onStateChange = (_, state) => {
                item.checkbox = state;
                if (item.action !== undefined) item.action(state);
                // close menu?
            };
            return checkbox;
        // TODO: radio group
        } else {
            let title = item.title;
            if (this.hasControls) title = "  " + title;
            if (item.submenu !== undefined) title += string.rep(" ", this.width - title.length - 3) + string.char(16);
            let label = new CCLabel({x: 1, y: 1}, title);
            if (!item.isEnabled) label.textColor = CCColor.gray;
            return label;
        }
    }

    public canSelectRow(table: CCTableView, row: number): boolean {
        let item = this.menu.itemAtIndex(row)!;
        return item.title !== undefined && item.isEnabled && item.checkbox === undefined && item.radioGroup === undefined;
    }

    public onRowSelected(table: CCTableView, row: number): void {
        let item = this.menu.itemAtIndex(row)!;
        if (item.submenu !== undefined) {
            if (this.child !== undefined) {
                this.child.prepareClose(false, true);
                this.child.close(false, true);
            }
            let pt = this.view.window!.convertPointToScreen({x: this.width + 1, y: row + 1});
            let win = new MenuWindow(pt, item.submenu, this);
            win.makeKeyAndOrderFront();
            win.display();
        } else {
            if (item.action !== undefined) item.action();
            this.prepareClose(true, true);
            this.close(true, true);
        }
    }
}

/**
 * This is an internal class for use with context menus. It should not be used.
 * @internal
 * @ignore
 */
export default class MenuWindow extends CCWindow {
    public constructor(pos: CCPoint, menu: CCMenu, parent?: MenuController) {
        let vc = new MenuController(pos, menu, parent);
        super(vc);
        if (parent !== undefined) parent.child = vc;
    }

    public _resignKey(): void {
        super._resignKey();
        //print("Resign", this);
        (this.contentViewController! as MenuController).prepareClose(true, true);
        // TODO: The event fires before _becomeKey is triggered! Need to fix with timers I think. Argh...
        let ev = new CCEvent();
        ev.type = CCEvent.Type.CCKitDefined;
        ev.subtype = 0x1001 as CCEvent.SubType;
        ev.window = this;
        CCApplication.shared.postEvent(ev, true);
    }

    public _becomeKey(): void {
        super._becomeKey();
        //print("Key again", this);
        (this.contentViewController! as MenuController).preventClose();
    }

    public customEvent(event: CCEvent): void {
        //print("Closing", this);
        if (event.type === CCEvent.Type.CCKitDefined && event.subtype === 0x1001 as CCEvent.SubType)
            (this.contentViewController! as MenuController).close(true, true);
        else super.customEvent(event);
    }
}
