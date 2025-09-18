import CCTableView from "CCKit2/CCTableView";
import CCView from "CCKit2/CCView";

/**
 * A table view data source provides the information necessary to construct a
 * `CCTableView`. It reports the number of rows and columns in the table, as well
 * as the size of columns and contents of each cell. A default implementation
 * for basic data is available in `CCTableViewStaticDataSource`.
 * @see CCTableViewStaticDataSource
 * @category Views
 */
export default interface CCTableViewDataSource {
    /**
     * Returns the number of rows in the table.
     * @param table The table requesting data
     * @return The number of rows in the table
     */
    numberOfRows(table: CCTableView): number;

    /**
     * Returns the number of columns in the table at the specified row.
     * @param table The table requesting data
     * @param row The 0-based row being queried
     * @return The number of columns in the row
     */
    numberOfColumns(table: CCTableView, row: number): number;

    /**
     * Returns the width of a column in a row, overriding the width of the view.
     * If not implemented, the width is determined from the content.
     * @param table The table requesting data
     * @param row The 0-based row to query
     * @param column The 0-based column to query
     * @return The width of the column
     */
    widthOfColumn?(table: CCTableView, row: number, column: number): number;

    /**
     * Returns the content view for a cell.
     * @param table The table requesting data
     * @param row The 0-based row of the cell to get
     * @param column The 0-based column of the cell to get
     * @return The view to display in the table; its position will be modified
     */
    contentsOfCell(table: CCTableView, row: number, column: number): CCView;
}
