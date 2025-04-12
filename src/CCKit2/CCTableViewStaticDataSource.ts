import CCTableViewDataSource from "CCKit2/CCTableViewDataSource";
import CCTableView from "CCKit2/CCTableView";
import CCView from "CCKit2/CCView";
import CCLabel from "CCKit2/CCLabel";

/**
 * This class defines a default instance of `CCTableViewDataSource` which reads
 * data from a 2D array of strings or numbers.
 * @category Views
 */
export default class CCTableViewStaticDataSource implements CCTableViewDataSource {
    /** The array storing the data for the table. */
    public get data(): (string | number)[][] {return this._data;}
    public set data(value: (string | number)[][]) {
        this._data = value;
        this.update();
    }
    private _data: (string | number)[][];

    private tables: LuaMap<CCTableView, boolean> = new LuaMap<CCTableView, boolean>();
    private columnWidths: number[] = [];

    /**
     * Creates a new data source.
     * @param data The data array to provide, in data[row][column] format
     */
    public constructor(data: (string | number)[][]) {
        this._data = data;
        setmetatable(this.tables, {__mode: "k"});
        this.update();
    }

    /**
     * Updates all known table views with new data.
     */
    public update(): void {
        for (let column = 0;; column++) {
            let max = 0;
            for (let row = 0; row < this._data.length; row++) {
                if (column < this._data[row].length) {
                    max = Math.max(max, tostring(this._data[row][column]).length);
                }
            }
            if (max > 0) this.columnWidths[column] = max + 1;
            else break;
        }
        for (const [table, _] of this.tables) table.update();
    }

    public numberOfRows(table: CCTableView): number {
        this.tables.set(table, true);
        return this._data.length;
    }
    
    public numberOfColumns(table: CCTableView, row: number): number {
        this.tables.set(table, true);
        row = Math.floor(row);
        if (row < 0 || row >= this._data.length) return 0;
        return this._data[row].length;
    }

    public widthOfColumn(table: CCTableView, row: number, column: number): number {
        this.tables.set(table, true);
        return this.columnWidths[column];
    }
    
    public contentsOfCell(table: CCTableView, row: number, column: number): CCView {
        this.tables.set(table, true);
        return new CCLabel({x: 1, y: 1}, tostring(this._data[row][column]));
    }
}
