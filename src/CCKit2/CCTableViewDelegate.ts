import CCTableView from "CCKit2/CCTableView";
import CCMenu from "CCKit2/CCMenu";

/**
 * Use this interface to receive messages on certain events from a table view.
 * @category Views
 */
export default interface CCTableViewDelegate {
    /**
     * Called to determine whether a row is selectable.
     * @param table The table being called on
     * @param row The row that may be selected
     * @returns Whether the row can be selected (will trigger `onRowSelected`)
     */
    canSelectRow?(table: CCTableView, row: number): boolean;

    /**
     * Called when a row is selected.
     * @param table The table being called on
     * @param row The row that was selected
     */
    onRowSelected?(table: CCTableView, row: number): void;

    /**
     * Called when a row is double-clicked.
     * @param table The table being called on
     * @param row The row that was selected
     */
    onRowDoubleClicked?(table: CCTableView, row: number): void;

    /**
     * Called when a row is right-clicked to get its context menu.
     * @param table The table being called on
     * @param row The row that was selected
     * @returns A menu to display, or `nil` for no menu
     */
    menuForRow?(table: CCTableView, row: number): CCMenu | undefined;
}
