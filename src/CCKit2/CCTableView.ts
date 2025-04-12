import CCScrollView from "CCKit2/CCScrollView";
import CCView from "CCKit2/CCView";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCEvent from "CCKit2/CCEvent";

class RowView extends CCView {
    private table: CCTableView;
    private row: number;
    private lastClick: number = 0;

    public constructor(frame: CCRect, table: CCTableView, row: number) {
        super(frame);
        this.table = table;
        this.row = row;
    }

    public mouseDown(event: CCEvent): void {
        let dbl = false, single = false;
        if (os.time() - this.lastClick < 0.5 && this.table.isRowSelected(this.row) && this.table.onRowDoubleClicked) {
            dbl = true;
        }
        if (!this.table.isRowSelected(this.row) && this.table.onRowSelected) {
            single = true;
        }
        this.table.selectedRow = this.row;
        this.lastClick = os.time();
        if (dbl) this.table.onRowDoubleClicked!(this.table, this.row);
        if (single) this.table.onRowSelected!(this.table, this.row);
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

    private _rowColorA: CCColor = CCColor.white;

    private _rowColorB: CCColor = CCColor.lightGray;

    private _selectedRowColor: CCColor = CCColor.blue;
    /** Called when a row is selected. */
    public onRowSelected?: (this: void, table: CCTableView, row: number) => void;
    /** Called when a row is double-clicked. */
    public onRowDoubleClicked?: (this: void, table: CCTableView, row: number) => void;

    private rowViews: CCView[] = [];

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
        let totalWidth = 0, totalHeight = 0;
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
            let rowView = new RowView({x: 1, y: row + 1, width: width, height: height}, this, row);
            rowView.backgroundColor = row % 2 == 1 ? this._rowColorB : this._rowColorA;
            for (let col = 0, x = 1; col < colCount; col++) {
                views[col].frame.x = x;
                views[col].frame.y = 1;
                rowView.addSubview(views[col]);
                x += widths[col];
            }
            this.subviews[0].addSubview(rowView);
            this.rowViews.push(rowView);
        }
        this.resizeContentView({width: totalWidth, height: totalHeight});
        for (let row = 0; row < rowCount; row++)
            this.rowViews[row].frame.width = totalWidth;
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
