import CCOutlineView from "CCKit2/CCOutlineView";
import CCView from "CCKit2/CCView";

/**
 * An outline view data source provides the content for an outline view.
 * @typeParam Item - Type of object that the data source provides
 * @category Views
 */
export default interface CCOutlineViewDataSource<Item extends AnyNotNil> {
    /**
     * Returns the child item at the specified index in the parent. If the
     * parent is `undefined`, returns a root-level item.
     * 
     * To maintain expanded status across refreshes, this should return an
     * equivalent object (through `__eq` if necessary) to previous calls with
     * the same parameters. If a new object is returned each time, expanded
     * status will not be preserved across refreshes, so calling `update` on the
     * view will collapse all items.
     * 
     * @param outlineView The view being called on
     * @param index The 0-based index of the item
     * @param parent The parent to query, or `undefined` for root items
     * @returns An opaque object containing info for the data source to use later
     */
    childOfItem(outlineView: CCOutlineView<Item>, index: number, parent?: Item): Item;

    /**
     * Returns the number of children for an item. Negative numbers will hide
     * the disclosure indicator, while 0 will keep it but show no children.
     * @param outlineView The view being called on
     * @param item The item to query (from `childOfItem`), or `undefined` for the number of root items
     * @returns The number of items under the parent
     */
    numberOfChildrenOfItem(outlineView: CCOutlineView<Item>, item?: Item): number;

    /**
     * Returns the number of columns being displayed in the view.
     * @param outlineView The view being called on
     * @returns The number of columns to display
     */
    numberOfColumns(outlineView: CCOutlineView<Item>): number;

    /**
     * Returns the width of a column, overriding the width of the view.
     * If not implemented, the width is determined from the content.
     * @param table The table requesting data
     * @param column The 0-based column to query
     * @return The width of the column
     */
    widthOfColumn?(table: CCOutlineView<Item>, column: number): number;

    /**
     * Returns a view for a column from an item.
     * @param outlineView The view being called on
     * @param item The item to use, from `childOfItem`
     * @param column The 0-based column index to query
     * @returns The view to display for this cell
     */
    viewForItemAtColumn(outlineView: CCOutlineView<Item>, item: Item, column: number): CCView;

    /**
     * Returns the title for the specified column. If unimplemented, the table
     * will not have a header row.
     * @param table The table requesting data
     * @param column The 0-based column to query
     * @return The text showed in the header for the column
     */
    titleForColumn?(table: CCOutlineView<Item>, column: number): string;

    /**
     * Returns whether the specified column is valid for sorting. The
     * application must implement sorting columns on its own, using `sortColumn`
     * on the table view.
     * @param table The table requesting data
     * @param column The 0-based column to query
     * @return Whether the column can be used for sort order in the table
     */
    columnIsSortable?(table: CCOutlineView<Item>, column: number): boolean;
}
