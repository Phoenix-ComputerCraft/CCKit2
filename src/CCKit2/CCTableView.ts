import CCScrollView from "CCKit2/CCScrollView";
import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCEvent from "CCKit2/CCEvent";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import CCControl from "CCKit2/CCControl";
import CCTableViewDelegate from "CCKit2/CCTableViewDelegate";
import CCMenu from "./CCMenu";

class RowView extends CCView {
    private table: CCTableView;
    private row: number;
    private lastClick: number = 0;

    public constructor(frame: CCRect, table: CCTableView, row: number) {
        super(frame);
        this.table = table;
        this.row = row;
    }

    public menuForEvent(event: CCEvent): CCMenu | undefined {
        if (this.table.delegate !== undefined && this.table.delegate.menuForRow !== undefined)
            return this.table.delegate.menuForRow(this.table, this.row);
        return undefined;
    }

    public mouseDown(event: CCEvent): void {
        if (this.table.delegate !== undefined && this.table.delegate.canSelectRow !== undefined && !this.table.delegate.canSelectRow(this.table, this.row)) {
            this.table.selectedRow = null;
            return;
        }
        let dbl = false, single = false;
        if (os.time() - this.lastClick < 0.5 && this.table.isRowSelected(this.row) && this.table.delegate !== undefined && this.table.delegate.onRowDoubleClicked) {
            dbl = true;
        }
        if (!this.table.isRowSelected(this.row) && this.table.delegate !== undefined && this.table.delegate.onRowSelected) {
            single = true;
        }
        this.table.selectedRow = this.row;
        this.lastClick = os.time();
        if (dbl) this.table.delegate!.onRowDoubleClicked!(this.table, this.row);
        if (single) this.table.delegate!.onRowSelected!(this.table, this.row);
    }
}

class HeaderCellView extends CCControl {
    private table: CCTableView;
    private column: number;
    private text: string;
    private sortable: boolean;
    public selected: boolean = false;
    public direction: boolean = false;

    public constructor(frame: CCRect, table: CCTableView, column: number, text: string, sortable: boolean) {
        super(frame, () => this.click());
        this.table = table;
        this.column = column;
        this.text = text;
        this.sortable = sortable;
    }

    public draw(rect: CCRect): void {
        let ctx = CCGraphicsContext.current!;
        ctx.color = this.selected ? this.table.selectedRowColor : this.table.rowColorB;
        ctx.drawFilledRectangle(rect);
        ctx.color = this.selected ? CCColor.white : CCColor.black;
        ctx.drawText({x: 2, y: 1}, this.text);
        if (this.sortable) ctx.drawText({x: this.frame.width - 1, y: 1}, string.char(this.direction ? 24 : 25));
    }

    public click(): void {
        if (this.sortable) {
            if (this.selected) this.direction = !this.direction;
            else this.table.sortColumn = this.column;
            this.table.sortDirection = this.direction;
        }
    }
}

/**
 * A table view displays rows of content separated into columns, with the ability
 * to select one or more rows. Data is sourced from an external object
 * (`CCTableViewDataSource`), which is used to precisely set up the configuration
 * of each row, column and cell. The view is kept in a scroll view, which allows
 * automatic overflow control.
 * @see CCTableViewDataSource
 * @category Views
 */
export default class CCTableView extends CCScrollView {
    /** @deprecated Do not use this field on a table view. */
    public get contentView(): CCView {throw "Cannot access content view of table";}
    /** The object which receives events such as selections. */
    public delegate?: CCTableViewDelegate;
    /** The data source being used for the table. */
    public get dataSource(): CCTableViewDataSource {return this._dataSource;}
    public set dataSource(value: CCTableViewDataSource) {
        this._dataSource = value;
        this.update();
    }
    private _dataSource: CCTableViewDataSource;
    /** Whether a row can be selected. */
    public canSelectRow: boolean = false;
    /** Whether multiple rows can be selected. */
    public canSelectMultipleRows: boolean = false;
    /** The currently selected row or rows. */
    public get selectedRow(): number | number[] | null {
        if (this.canSelectMultipleRows) {
            return this._selectedRows;
        } else if (this._selectedRows.length === 0) {
            return null;
        } else {
            return this._selectedRows[0];
        }
    }
    public set selectedRow(value: number | number[] | null) {
        for (const row of this._selectedRows)
            this.rowViews[row].backgroundColor = row % 2 == 1 ? this._rowColorB : this._rowColorA;
        if (typeof value === "number")
            this._selectedRows = [value];
        else if (value === null)
            this._selectedRows = [];
        else this._selectedRows = value;
        for (const row of this._selectedRows)
            this.rowViews[row].backgroundColor = this._selectedRowColor;
    }
    private _selectedRows: number[] = [];
    /** The primary color for alternating rows. */
    public get rowColorA(): CCColor {return this._rowColorA;}
    public set rowColorA(value: CCColor) {
        this._rowColorA = value;
        this.update();
    }
    private _rowColorA: CCColor = CCColor.white;
    /** The secondary color for alternating rows. */
    public get rowColorB(): CCColor {return this._rowColorB;}
    public set rowColorB(value: CCColor) {
        this._rowColorB = value;
        this.update();
    }
    private _rowColorB: CCColor = CCColor.lightGray;
    /** The color for selected rows. */
    public get selectedRowColor(): CCColor {return this._selectedRowColor;}
    public set selectedRowColor(value: CCColor) {
        this._selectedRowColor = value;
        this.update();
    }
    private _selectedRowColor: CCColor = CCColor.blue;
    /** Stores the 0-based index of the column determining sort order. */
    public get sortColumn(): number | undefined {return this._sortColumn;}
    public set sortColumn(value: number | undefined) {
        this._sortColumn = value;
        for (let [i, view] of ipairs(this.headerViews)) {
            view.selected = (i-1) === value;
            view.setNeedsDisplay();
        }
        this.update();
    }
    private _sortColumn?: number;
    /** Stores the direction of sorting. Typically, false = A-Z, and true = Z-A. */
    public get sortDirection(): boolean {return this._sortDirection;}
    public set sortDirection(value: boolean) {
        this._sortDirection = value;
        if (this._sortColumn !== undefined && this._sortColumn >= 0 && this._sortColumn < this.headerViews.length) {
            this.headerViews[this._sortColumn].direction = value;
            this.headerViews[this._sortColumn].setNeedsDisplay();
        }
        this.update();
    }
    private _sortDirection: boolean = false;

    private rowViews: CCView[] = [];
    private headerViews: HeaderCellView[] = [];

    /**
     * Creates a new table view.
     * @param frame The frame for the view
     * @param data The data source for the view
     */
    public constructor(frame: CCRect, data: CCTableViewDataSource) {
        super(frame, {width: frame.width, height: frame.height});
        this._dataSource = data;
        this.update();
    }

    /**
     * Updates the displayed data from the data source.
     */
    public update(): void {
        for (let view of this.rowViews) view.removeFromSuperview();
        this.rowViews = [];
        this._selectedRows = [];
        const rowCount = this._dataSource.numberOfRows(this);
        let totalWidth = 0, totalHeight = 0, offset = 1;
        let headerWidths: number[] = [];
        if (this._dataSource.titleForColumn !== undefined) {totalHeight = 1; offset = 2;}
        else for (let view of this.headerViews) view.removeFromSuperview();
        for (let row = 0; row < rowCount; row++) {
            const colCount = this._dataSource.numberOfColumns(this, row);
            let views: CCView[] = [];
            let widths: number[] = [];
            let width = 0, height = 1;
            for (let col = 0; col < colCount; col++) {
                let view = this._dataSource.contentsOfCell(this, row, col);
                views.push(view);
                let w: number;
                if (this._dataSource.widthOfColumn) w = this._dataSource.widthOfColumn(this, row, col);
                else w = view.frame.width + 1;
                widths.push(w);
                width += w;
                height = Math.max(height, view.frame.height);
            }
            totalWidth = Math.max(totalWidth, width);
            totalHeight += height;
            let rowView = new RowView({x: 1, y: row + offset, width: width, height: height}, this, row);
            rowView.backgroundColor = row % 2 == 1 ? this._rowColorB : this._rowColorA;
            for (let col = 0, x = 1; col < colCount; col++) {
                views[col].frame.x = x;
                views[col].frame.y = 1;
                rowView.addSubview(views[col]);
                x += widths[col];
            }
            if (row === 0) headerWidths = widths;
            this.subviews[0].addSubview(rowView);
            this.rowViews.push(rowView);
        }
        this.resizeContentView({width: totalWidth, height: totalHeight});
        if (this._dataSource.titleForColumn !== undefined) {
            if (this.subviews.length === 1) {
                CCView.prototype.addSubview.apply(this, [new CCView({x: 1, y: 1, width: totalWidth, height: 1})]);
            }
            if (this.headerViews.length < headerWidths.length) {
                let x = 1;
                for (let i = 0; i < this.headerViews.length; i++) x += headerWidths[i];
                for (let i = this.headerViews.length; i < headerWidths.length; i++) {
                    let sortable = this._dataSource.columnIsSortable ? this._dataSource.columnIsSortable(this, i) : false;
                    let view = new HeaderCellView({x: x, y: 1, width: headerWidths[i], height: 1}, this, i, this._dataSource.titleForColumn!(this, i), sortable);
                    this.subviews[1].addSubview(view);
                    this.headerViews.push(view);
                    x += headerWidths[i];
                }
            }
        }
        for (let row = 0; row < rowCount; row++)
            this.rowViews[row].frame.width = totalWidth;
        this.setNeedsDisplay();
    }

    /**
     * Returns whether the given row is selected.
     * @param row The row to check
     * @return Whether the row is selected
     */
    public isRowSelected(row: number): boolean {
        for (const r of this._selectedRows)
            if (r == row) return true;
        return false;
    }
}
