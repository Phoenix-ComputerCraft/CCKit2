import CCTableView from "CCKit2/CCTableView";
import CCOutlineViewDataSource from "CCKit2/CCOutlineViewDataSource";
import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCControl from "CCKit2/CCControl";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

type Item = {expanded: boolean, row: number, level: number};

class ExpandButton extends CCControl {
    public expanded: boolean = false;
    public draw(rect: CCRect): void {
        CCGraphicsContext.current!.color = this.isPressed ? CCColor.gray : CCColor.lightGray;
        CCGraphicsContext.current!.drawText(rect, string.char(this.expanded ? 31 : 16));
    }
}

class OutlineDataSource implements CCTableViewDataSource {
    source: CCOutlineViewDataSource;
    items: LuaTable<any, Item> = new LuaTable<any, Item>();
    rowCount: number = 0;
    constructor(source: CCOutlineViewDataSource) {
        this.source = source;
        if (this.source.widthOfColumn)
            this.widthOfColumn = (table: CCTableView, row: number, column: number): number => source.widthOfColumn!(table as CCOutlineView, column);
    }
    private updateItem(view: CCOutlineView, item: any, row: number, level: number, nextItems: LuaTable<any, Item>): number {
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
    update(view: CCOutlineView): void {
        let nextItems = new LuaTable<any, Item>();
        const count = this.source.numberOfChildrenOfItem(view, undefined);
        for (let i = 0; i < count; i++) {
            this.rowCount = this.updateItem(view, this.source.childOfItem(view, i, undefined), this.rowCount, 0, nextItems);
        }
        this.items = nextItems;
    }
    numberOfRows(table: CCTableView): number {
        return this.rowCount;
    }
    numberOfColumns(table: CCTableView, row: number): number {
        return this.source.numberOfColumns(table as CCOutlineView);
    }
    widthOfColumn?(table: CCTableView, row: number, column: number): number;
    contentsOfCell(table: CCTableView, row: number, column: number): CCView {
        let item: any;
        let info!: Item;
        for (let [k, v] of this.items) {
            if (v.row === row) {
                item = k;
                info = v;
                break;
            }
        }
        if (column === 0) {
            let innerView = this.source.viewForItemAtColumn(table as CCOutlineView, item, 0);
            let innerFrame = innerView.frame;
            let outerView = new CCView({x: 1, y: 1, width: innerFrame.width + info.level * 2 + 2, height: innerFrame.height});
            innerView.frame = {x: info.level * 2 + 3, y: 1, width: innerFrame.width, height: innerFrame.height};
            outerView.addSubview(innerView);
            let button = new ExpandButton({x: info.level * 2 + 1, y: 1, width: 1, height: 1}, button => {
                let b = button as ExpandButton;
                b.expanded = !b.expanded;
                b.setNeedsDisplay();
                info.expanded = b.expanded;
                table.update();
            });
            outerView.addSubview(button);
            return outerView;
        } else {
            return this.source.viewForItemAtColumn(table as CCOutlineView, item, column);
        }
    }
}

/**
 * An outline view is a type of table which displays hierarchical data in groups
 * which can be expanded and collapsed.
 * @category Views
 */
export default class CCOutlineView extends CCTableView {
    /** @deprecated Do not use this field on an outline view. */
    public get dataSource(): CCTableViewDataSource {throw "Cannot access raw data source";}
    public set dataSource(value: CCTableViewDataSource) {throw "Cannot access raw data source";}
    /** The data source for the view. */
    public get outlineDataSource(): CCOutlineViewDataSource {return (super.dataSource as OutlineDataSource).source;}
    public set outlineDataSource(value: CCOutlineViewDataSource) {
        let source = new OutlineDataSource(value);
        source.update(this);
        super.dataSource = source;
    }

    /**
     * Creates a new outline view.
     * @param frame The frame for the view
     * @param data The data source for the view
     */
    public constructor(frame: CCRect, data: CCOutlineViewDataSource) {
        let source = new OutlineDataSource(data);
        super(frame, source);
        source.update(this);
    }

    public update(): void {
        (super.dataSource as OutlineDataSource).update(this);
        super.update();
    }
}
