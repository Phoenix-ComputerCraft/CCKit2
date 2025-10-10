import CCOutlineView from "CCKit2/CCOutlineView";
import CCMenu from "CCKit2/CCMenu";

/**
 * Use this interface to receive messages on certain events from an outline view.
 * @typeParam Item - Type of object that the data source provides
 * @category Views
 */
export default interface CCOutlineViewDelegate<Item extends AnyNotNil> {
    /**
     * Called to determine whether an item is selectable.
     * @param table The table being called on
     * @param item The item that may be selected
     * @returns Whether the item can be selected (will trigger `onItemSelected`)
     */
    canSelectItem?(table: CCOutlineView<Item>, item: Item): boolean;

    /**
     * Called when an item is selected.
     * @param table The table being called on
     * @param item The item that was selected
     */
    onItemSelected?(table: CCOutlineView<Item>, item: Item): void;

    /**
     * Called when an item is double-clicked.
     * @param table The table being called on
     * @param item The item that was selected
     */
    onItemDoubleClicked?(table: CCOutlineView<Item>, item: Item): void;

    /**
     * Called when an item is right-clicked to get its context menu.
     * @param table The table being called on
     * @param item The item that was selected
     * @returns A menu to display, or `nil` for no menu
     */
    menuForItem?(table: CCOutlineView<Item>, item: Item): CCMenu | undefined;
}
