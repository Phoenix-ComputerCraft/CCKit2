import * as CCJSX from "CCKit2/CCJSX";
import {JSX as CCViewJSX} from "CCKit2/CCView";
import {JSX as CCLabelJSX, default as CCLabel} from "CCKit2/CCLabel";
import {JSX as CCButtonJSX, default as CCButton} from "CCKit2/CCButton";
import CCViewController from "CCKit2/CCViewController";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplication from "CCKit2/CCApplication";
import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";
import CCDefaultWindowManagerConnection from "CCKit2/CCDefaultWindowManagerConnection";
import CCApplicationMain from "CCKit2/CCApplicationMain";

class ViewController extends CCViewController {
    public label!: CCLabel;
    public button!: CCButton;
    private count = 0;

    public pressed(): void {
        this.label.text = (this.count++).toString();
    }

    public get constructedView(): CCJSX.JSX.Element {
        let v = <constraint firstAttribute="Top" relation="Equal" secondItem="superview" secondAttribute="Top" />
        return <CCViewJSX frame="1 1 30 15" backgroundColor="white">
            <CCLabelJSX pos="1 1" outlet={this.outlet("label")}>
                Text
                <constraint firstAttribute="Top" relation="Equal" secondItem="superview" secondAttribute="Top" />
            </CCLabelJSX>
            <CCButtonJSX pos="1 2" action={this.action(this.pressed)}>
                Press Me
                <constraint firstAttribute="Top" relation="Equal" secondItem={this.outlet("label")} secondAttribute="Bottom" constant="1" />
            </CCButtonJSX>
        </CCViewJSX>
    }
}

class AppDelegate implements CCApplicationDelegate {
    public applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate(), ...$vararg);
