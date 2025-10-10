import CCResponder from "CCKit2/CCResponder";
import { CCSize, CCPoint } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCWindow from "CCKit2/CCWindow";

/**
 * The CCViewController class is the primary way to design behavior for a view
 * or window. It owns a root view which is tied to the view controller, whose
 * lifecycle is defined by the view controller.
 * @category View Controllers
 */
export default class CCViewController extends CCResponder {
    /** The root view of the view controller. */
    public view!: CCView;
    /** Whether the view has been loaded yet. */
    public get isViewLoaded(): boolean {return this.view != undefined;}
    /** A string which describes the view this controller holds. */
    public title?: string = undefined;

    /**
     * Returns the preferred size of the content, in characters.
     */
    public get preferredContentSize(): CCSize {
        return {width: 30, height: 10};
    }

    /**
     * Returns the preferred options for the window.
     */
    public get preferredStyle(): CCWindow.StyleMask {
        return 0x1C as CCWindow.StyleMask; // needs to be constant to avoid dependency cycles
    }

    /**
     * Returns the initial position of the window.
     */
    public get initialPosition(): CCPoint | undefined {
        return undefined;
    }

    /**
     * Loads the root view into memory.
     */
    public loadView(): void {
        const size = this.preferredContentSize;
        this.view = new CCView({x: 1, y: 1, width: size.width, height: size.height});
        this.view.nextResponder = this;
        this.viewDidLoad();
    }

    /**
     * Called after the view has been loaded into memory.
     */
    public viewDidLoad(): void {

    }

    /**
     * Loads the view if it hasn't been loaded yet.
     */
    public loadViewIfNeeded(): void {
        if (this.view == undefined) this.loadView();
    }

    /**
     * Called when the view is about to appear on screen.
     * @param animated Whether the view is being animated.
     */
    public viewWillAppear(animated: boolean) {

    }

    /**
     * Called when the view is being added to the view hierarchy.
     * @param animated Whether the view is being animated.
     */
    public viewIsAppearing(animated: boolean) {

    }

    /**
     * Called when the view has just appeared on screen.
     * @param animated Whether the view is being animated.
     */
    public viewDidAppear(animated: boolean) {

    }

    /**
     * Called when the view is about to disappear from the screen.
     * @param animated Whether the view is being animated.
     */
    public viewWillDisappear(animated: boolean) {

    }

    /**
     * Called when the view has just disappeared from the screen.
     * @param animated Whether the view is being animated.
     */
    public viewDidDisappear(animated: boolean) {

    }

    /**
     * Presents a new view controller in place of this one.
     * @param vc The view controller to present
     */
    public present(vc: CCViewController): void {
        if (this.view.window === null) throw "Presenting view controller is not currently displayed";
        if (vc.view !== null && vc.view.window !== null) throw "Presented view controller is already displayed";
        vc.loadViewIfNeeded();
        this.viewWillDisappear(false);
        vc.view.window = this.view.window;
        if (vc.view.window!.contentViewController === this)
            vc.view.window!.contentViewController = vc;
        vc.view.didMoveToSuperview();
        this.view.window = undefined;
        this.view.didMoveToSuperview();
        vc.viewWillAppear(false);
        vc.view.window!.display();
        vc.viewDidAppear(false);
    }
}
