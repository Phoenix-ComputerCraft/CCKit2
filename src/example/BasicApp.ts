import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import CCButton from "CCKit2/CCButton";
import CCEvent from "CCKit2/CCEvent";
import CCLabel from "CCKit2/CCLabel";
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
        this.view.backgroundColor = CCColor.white;
        this.label = new CCLabel({x: 2, y: 2}, "Hello World!");
        this.view.addSubview(this.label);
        let v2 = new MyView({x: 5, y: 5, width: 5, height: 5});
        this.view.addSubview(v2);
        let button = new CCButton({x: 2, y: 3}, "Increment", () => this.increment());
        this.view.addSubview(button);
    }
}

class AppDelegate implements CCApplicationDelegate {
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate());
