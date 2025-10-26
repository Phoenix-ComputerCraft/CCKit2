import * as CCJSX from "CCKit2/CCJSX";
import CCView from "CCKit2/CCView";
import CCLabel from "CCKit2/CCLabel";
import CCButton from "CCKit2/CCButton";
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
        return <CCView frame="1 1 30 15" backgroundColor="white">
            <CCLabel pos="1 1" outlet={this.outlet("label")}>
                Text
                <constraint firstAttribute="Top" relation="Equal" secondItem="superview" secondAttribute="Top" />
            </CCLabel>
            <CCButton pos="1 2" action={this.action(this.pressed)}>
                Press Me
                <constraint firstAttribute="Top" relation="Equal" secondItem={this.outlet("label")} secondAttribute="Bottom" constant="1" />
            </CCButton>
        </CCView>
    }
}

class AppDelegate implements CCApplicationDelegate {
    public applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate(), ...$vararg);
