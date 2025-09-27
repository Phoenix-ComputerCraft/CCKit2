import CCTableView from "CCKit2/CCTableView";
import CCOutlineViewDataSource from "CCKit2/CCOutlineViewDataSource";
import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCControl from "CCKit2/CCControl";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

type ItemInfo = {expanded: boolean, row: number, level: number};

class ExpandButton extends CCControl {
    public expanded: boolean = false;
    public draw(rect: CCRect): void {
        CCGraphicsContext.current!.color = this.isPressed ? CCColor.black : CCColor.gray;
        CCGraphicsContext.current!.drawText(rect, string.char(this.expanded ? 31 : 16));
    }
}

class OutlineDataSource<Item extends AnyNotNil> implements CCTableViewDataSource {
    source: CCOutlineViewDataSource<Item>;
    items: LuaTable<Item, ItemInfo> = new LuaTable<Item, ItemInfo>();
    rowCount: number = 0;
    constructor(source: CCOutlineViewDataSource<Item>) {
        this.source = source;
        if (this.source.widthOfColumn)
            this.widthOfColumn = (table: CCTableView, row: number, column: number): number => source.widthOfColumn!(table as CCOutlineView<Item>, column);
        this.titleForColumn = this.source.titleForColumn;
        this.columnIsSortable = this.source.columnIsSortable;
    }
    private updateItem(view: CCOutlineView<Item>, item: any, row: number, level: number, nextItems: LuaTable<Item, ItemInfo>): number {
        let info = {expanded: false, row: row, level: level};
        if (this.items.has(item)) info.expanded = this.items.get(item).expanded;
        nextItems.set(item, info);
        row++;
        if (info.expanded) {
            const count = this.source.numberOfChildrenOfItem(view, item);
            for (let i = 0; i < count; i++) {
                row = this.updateItem(view, this.source.childOfItem(view, i, item), row, level + 1, nextItems);
            }
        }
        return row;
    }
    update(view: CCOutlineView<Item>): void {
        let nextItems = new LuaTable<Item, ItemInfo>();
        const count = this.source.numberOfChildrenOfItem(view, undefined);
        this.rowCount = 0;
        for (let i = 0; i < count; i++) {
            this.rowCount = this.updateItem(view, this.source.childOfItem(view, i, undefined), this.rowCount, 0, nextItems);
        }
        this.items = nextItems;
    }
    numberOfRows(table: CCTableView): number {
        return this.rowCount;
    }
    numberOfColumns(table: CCTableView, row: number): number {
        return this.source.numberOfColumns(table as CCOutlineView<Item>);
    }
    widthOfColumn?(table: CCTableView, row: number, column: number): number;
    contentsOfCell(table: CCTableView, row: number, column: number): CCView {
        let item: any;
        let info!: ItemInfo;
        for (let [k, v] of this.items) {
            if (v.row === row) {
                item = k;
                info = v;
                break;
            }
        }
        if (column === 0) {
            let innerView = this.source.viewForItemAtColumn(table as CCOutlineView<Item>, item, 0);
            let innerFrame = innerView.frame;
            let outerView = new CCView({x: 1, y: 1, width: innerFrame.width + info.level * 2 + 2, height: innerFrame.height});
            innerView.frame = {x: info.level * 2 + 4, y: 1, width: innerFrame.width, height: innerFrame.height};
            outerView.addSubview(innerView);
            if (this.source.numberOfChildrenOfItem(table as CCOutlineView<Item>, item) >= 0) {
                let button = new ExpandButton({x: info.level * 2 + 2, y: 1, width: 1, height: 1}, button => {
                    let b = button as ExpandButton;
                    b.expanded = !b.expanded;
                    b.setNeedsDisplay();
                    info.expanded = b.expanded;
                    table.update();
                });
                button.expanded = info.expanded;
                outerView.addSubview(button);
            }
            return outerView;
        } else {
            return this.source.viewForItemAtColumn(table as CCOutlineView<Item>, item, column);
        }
    }
    titleForColumn?(table: CCTableView, column: number): string;
    columnIsSortable?(table: CCTableView, column: number): boolean;
}

/**
 * An outline view is a type of table which displays hierarchical data in groups
 * which can be expanded and collapsed.
 * @typeParam Item - Type of object that the data source provides
 * @category Views
 */
export default class CCOutlineView<Item extends AnyNotNil> extends CCTableView {
    /** @deprecated Do not use this field on an outline view. */
    public get dataSource(): CCTableViewDataSource {throw "Cannot access raw data source";}
    public set dataSource(value: CCTableViewDataSource) {throw "Cannot access raw data source";}
    /** The data source for the view. */
    public get outlineDataSource(): CCOutlineViewDataSource<Item> {return (super.dataSource as OutlineDataSource<Item>).source;}
    public set outlineDataSource(value: CCOutlineViewDataSource<Item>) {
        let source = new OutlineDataSource(value);
        source.update(this);
        super.dataSource = source;
    }
    /** Called when an item is selected. */
    public onItemSelected?: (this: void, table: CCOutlineView<Item>, item: Item) => void;
    /** Called when an item is double-clicked. */
    public onItemDoubleClicked?: (this: void, table: CCOutlineView<Item>, item: Item) => void;
    /** The currently selected item or items. */
    public get selectedItem(): Item | Item[] | null {
        let rows = super.selectedRow;
        if (rows === null) return null;
        else if (typeof rows === "number") return this.getItemByRow(rows);
        else return rows.map(row => this.getItemByRow(row));
    }
    public set selectedItem(value: Item | Item[] | null) {
        if (value === null) super.selectedRow = null;
        else if ((value as Item[])[0] !== undefined) super.selectedRow = (value as Item[]).map(item => this.getRowByItem(item));
        else super.selectedRow = this.getRowByItem(value as Item);
    }

    /**
     * Creates a new outline view.
     * @param frame The frame for the view
     * @param data The data source for the view
     */
    public constructor(frame: CCRect, data: CCOutlineViewDataSource<Item>) {
        let source = new OutlineDataSource(data);
        super(frame, source);
        source.update(this);
        this.onRowSelected = (table, row) => {
            if (!this.onItemSelected) return;
            return this.onItemSelected(table as CCOutlineView<Item>, this.getItemByRow(row));
        };
        this.onRowDoubleClicked = (table, row) => {
            if (!this.onItemDoubleClicked) return;
            return this.onItemDoubleClicked(table as CCOutlineView<Item>, this.getItemByRow(row));
        };
    }

    public update(): void {
        (super.dataSource as OutlineDataSource<Item>).update(this);
        super.update();
    }

    private getItemByRow(row: number): Item {
        let item!: Item;
        for (let [k, v] of (super.dataSource as OutlineDataSource<Item>).items) {
            if (v.row === row) {
                item = k;
                break;
            }
        }
        return item;
    }

    private getRowByItem(item: Item): number {
        return (super.dataSource as OutlineDataSource<Item>).items.get(item).row;
    }
}
