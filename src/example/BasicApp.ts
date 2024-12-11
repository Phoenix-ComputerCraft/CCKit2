import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import CCButton from "CCKit2/CCButton";
import CCEvent from "CCKit2/CCEvent";
import CCLabel from "CCKit2/CCLabel";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCViewController from "CCKit2/CCViewController";
import CCWindowManagerConnection, { CCDefaultWindowManagerConnection } from "CCKit2/CCWindowManagerConnection";

class MyView extends CCView {
    constructor(frame: CCRect) {
        super(frame);
        this.backgroundColor = CCColor.blue;
    }

    public mouseDown(event: CCEvent): void {
        this.backgroundColor = CCColor.red;
    }

    public mouseUp(event: CCEvent): void {
        this.backgroundColor = CCColor.blue;
    }

    public keyDown(event: CCEvent): void {
        this.backgroundColor = CCColor.green;
    }

    public keyUp(event: CCEvent): void {
        this.backgroundColor = CCColor.blue;
    }
}

class ViewController extends CCViewController {
    private label: CCLabel;
    private count: number = 0;

    private increment(): void {
        this.count++;
        this.label.text = "Count: " + this.count;
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
        this.view.window.title = "CCKit2 Demo";
        this.view.backgroundColor = CCColor.white;
        this.label = new CCLabel({x: 2, y: 2}, "Hello World!");
        this.view.addSubview(this.label);
        let v2 = new MyView({x: 5, y: 5, width: 5, height: 5});
        this.view.addSubview(v2);
        let v3 = new MyView({x: 5, y: 5, width: 5, height: 5});
        this.view.addSubview(v3);
        let button = new CCButton({x: 2, y: 3}, "Increment", () => this.increment());
        this.view.addSubview(button);
        let resizingView = new CCView({x: 0, y: 0, width: 0, height: 0});
        resizingView.backgroundColor = CCColor.yellow;
        this.view.addSubview(resizingView);

        CCView.addConstraintsByCode(`
            v2.Top = button.Bottom + 1
            v2.Bottom = rootView.Bottom - 1
            v2.Left = rootView.Left + 1
            v2.Width = v3.Width * 2

            v3.Top = button.Bottom + 1
            v3.Bottom = rootView.Bottom - 1
            v3.Left = v2.Right + 1
            v3.Right = rootView.Right - 1

            resizingView.Top = label.Top
            resizingView.Bottom = label.Bottom
            resizingView.Left = label.Right + 1
            resizingView.Right = rootView.Right - 1
        `, {
            v2: v2,
            v3: v3,
            button: button,
            rootView: this.view,
            resizingView: resizingView,
            label: this.label,
        });
    }
}

class AppDelegate implements CCApplicationDelegate {
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate());
