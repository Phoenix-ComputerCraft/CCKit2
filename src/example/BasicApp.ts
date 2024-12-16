import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import CCButton from "CCKit2/CCButton";
import CCCheckbox from "CCKit2/CCCheckbox";
import CCEvent from "CCKit2/CCEvent";
import CCImage from "CCKit2/CCImage";
import CCImageView from "CCKit2/CCImageView";
import CCLabel from "CCKit2/CCLabel";
import CCProgressIndicator from "CCKit2/CCProgressIndicator";
import CCSlider from "CCKit2/CCSlider";
import CCTextField from "CCKit2/CCTextField";
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
    private label!: CCLabel;
    private count: number = 0;
    private progress!: CCProgressIndicator;

    private increment(): void {
        this.count++;
        this.label.text = "Count: " + this.count;
        this.progress.progress = this.count / 100;
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
        this.view.window!.title = "CCKit2 Demo";
        this.view.backgroundColor = CCColor.white;
        this.label = new CCLabel({x: 2, y: 2}, "Hello World!");
        this.view.addSubview(this.label);
        let button = new CCButton({x: 2, y: 3}, "Increment", () => this.increment());
        this.view.addSubview(button);

        let image = CCImage.createFromNFP(
`ffff0123
eeee4567
dddd89ab
bbbbcdef`);
        let imageView = new CCImageView({x: 22, y: 2}, image);
        this.view.addSubview(imageView);
        let checkbox = new CCCheckbox({x: 3, y: 4}, "Enabled");
        checkbox.checked = true;
        checkbox.onStateChange = (_, state) => button.isEnabled = state;
        this.view.addSubview(checkbox);
        this.progress = new CCProgressIndicator({x: 2, y: 5, width: 11, height: 1}, CCProgressIndicator.Style.ThinBar);
        this.view.addSubview(this.progress);
        let slider = new CCSlider({x: 2, y: 6, width: 11, height: 1});
        this.view.addSubview(slider);
        let sliderText = new CCLabel({x: 14, y: 6}, "0.0");
        slider.action = function(this: void, sender: CCView, position: number): void {
            sliderText.text = string.format("%.1f", position);
        }
        this.view.addSubview(sliderText);
        let textBox = new CCTextField({x: 2, y: 7, width: 11, height: 1});
        textBox.placeholderText = "Text...";
        this.view.addSubview(textBox);

        /*let v2 = new MyView({x: 5, y: 5, width: 5, height: 5});
        this.view.addSubview(v2);
        let v3 = new MyView({x: 5, y: 5, width: 5, height: 5});
        this.view.addSubview(v3);
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
        });*/
    }
}

class AppDelegate implements CCApplicationDelegate {
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate());
