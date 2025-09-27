import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import CCButton from "CCKit2/CCButton";
import CCCheckbox from "CCKit2/CCCheckbox";
import CCComboBox from "CCKit2/CCComboBox";
import CCDefaultWindowManagerConnection from "CCKit2/CCDefaultWindowManagerConnection";
import CCDialog from "CCKit2/CCDialog";
import CCEvent from "CCKit2/CCEvent";
import CCImage from "CCKit2/CCImage";
import CCImageView from "CCKit2/CCImageView";
import CCLabel from "CCKit2/CCLabel";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";
import CCProgressIndicator from "CCKit2/CCProgressIndicator";
import CCRadioButton from "CCKit2/CCRadioButton";
import CCScrollView from "CCKit2/CCScrollView";
import CCSlider from "CCKit2/CCSlider";
import CCStackView from "CCKit2/CCStackView";
import CCTableView from "CCKit2/CCTableView";
import CCTableViewStaticDataSource from "CCKit2/CCTableViewStaticDataSource";
import CCTabView from "CCKit2/CCTabView";
import CCTextField from "CCKit2/CCTextField";
import CCTextView from "CCKit2/CCTextView";
import { CCColor, CCRect, CCSize } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";
import CCViewController from "CCKit2/CCViewController";
import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";

const tableData: (string | number)[][] = [
    ["Name", "Address", "Phone", "Age"],
    ["John Doe", "123 Apple Way", "555-1234", 49],
    ["Phillip Gonzalez", "2568 Weekley Street", "302-9163", 23],
    ["Herbert Rodriguez", "3208 Hood Avenue", "755-6449", 71],
    ["Johnnie Wooding", "159 Heavens Way", "241-7892", 76],
    ["Mary McDonald", "802 Star Route", "590-2842", 27],
    ["Donna Cook", "320 Westfall Avenue", "954-0272", 43],
    ["Alberto Powers", "4826 Stone Lane", "350-1833", 22],
    ["Minnie Cortez", "2230 Comfort Court", "255-9970", 59],
    ["Shane Moore", "4258 Ocello Street", "893-5070", 76],
];

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

    public get preferredContentSize(): CCSize {
        return {width: 30, height: 11};
    }

    private increment(): void {
        this.count++;
        this.label.text = "Count: " + this.count;
        this.progress.progress = this.count / 100;
    }

    public viewDidLoad(): void {
        super.viewDidLoad();
        this.view.backgroundColor = CCColor.white;
        let tabView = new CCTabView({x: 1, y: 1, width: this.view.frame.width, height: this.view.frame.height - 1}, ["Basic", "Table", "Stack"]);
        this.view.addSubview(tabView);
        let basicView = tabView.contentViewAt(0);
        basicView.backgroundColor = CCColor.white;

        this.label = new CCLabel({x: 1, y: 1}, "Hello World!");
        basicView.addSubview(this.label);
        let button = new CCButton({x: 1, y: 2}, "Increment", () => this.increment());
        basicView.addSubview(button);

        let scrollView = new CCScrollView({x: 17, y: 1, width: 12, height: 4}, {width: 11, height: 20});
        basicView.addSubview(scrollView);
        let image = CCImage.createFromNFP(
`ffff0123
eeee4567
dddd89ab
bbbbcdef`);
        let imageView = new CCImageView({x: 1, y: 1}, image);
        scrollView.addSubview(imageView);
        let textView = new CCTextView({x: 1, y: 5, width: 11, height: 16});
        textView.text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
        scrollView.addSubview(textView);
        let checkbox = new CCCheckbox({x: 2, y: 3}, "Enabled");
        checkbox.checked = true;
        checkbox.onStateChange = (_, state) => button.isEnabled = state;
        basicView.addSubview(checkbox);
        this.progress = new CCProgressIndicator({x: 1, y: 4, width: 11, height: 1}, CCProgressIndicator.Style.ThinBar);
        basicView.addSubview(this.progress);
        let slider = new CCSlider({x: 1, y: 5, width: 11, height: 1});
        basicView.addSubview(slider);
        let sliderText = new CCLabel({x: 13, y: 5}, "0.0");
        slider.action = (_, position) => {
            sliderText.text = string.format("%.1f", position);
        }
        basicView.addSubview(sliderText);
        let textBox = new CCTextField({x: 1, y: 6, width: 11, height: 1});
        textBox.placeholderText = "Text...";
        basicView.addSubview(textBox);
        let radioCallback: (this: void, sender: CCRadioButton) => void = (sender) => {

        };
        let radioA = new CCRadioButton({x: 21, y: 5}, "Opt 1");
        radioA.onStateChange = radioCallback;
        basicView.addSubview(radioA);
        let radioB = new CCRadioButton({x: 21, y: 6}, "Opt 2");
        radioB.onStateChange = radioCallback;
        basicView.addSubview(radioB);
        let radioC = new CCRadioButton({x: 21, y: 7}, "Opt 3");
        radioC.onStateChange = radioCallback;
        basicView.addSubview(radioC);
        let popupButton = new CCButton({x: 2, y: 7}, "Dialog", () => CCDialog.messageWithOneButton(this.view.window, "Alert", "This is a test of the dialog box and text view functionality, showing word wrapping."));
        basicView.addSubview(popupButton);
        let comboBox = new CCComboBox({x: 2, y: 8, width: 11, height: 1}, ["Pick Me", "Choose Me", "Select Me"]);
        basicView.addSubview(comboBox);

        /*let v2 = new MyView({x: 5, y: 5, width: 5, height: 5});
        basicView.addSubview(v2);
        let v3 = new MyView({x: 5, y: 5, width: 5, height: 5});
        basicView.addSubview(v3);
        let resizingView = new CCView({x: 0, y: 0, width: 0, height: 0});
        resizingView.backgroundColor = CCColor.yellow;
        basicView.addSubview(resizingView);
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

        let tableContainer = tabView.contentViewAt(1);
        let tableView = new CCTableView({x: 1, y: 1, width: tableContainer.frame.width, height: tableContainer.frame.height}, new CCTableViewStaticDataSource(tableData));
        tableView.canSelectRow = true;
        tableContainer.addSubview(tableView);

        let stackContainer = tabView.contentViewAt(2);
        let stackView = new CCStackView({x: 1, y: 1, width: stackContainer.frame.width, height: stackContainer.frame.height});
        stackContainer.addSubview(stackView);
        stackView.addConstraints([
            new CCLayoutConstraint(stackView, CCLayoutConstraint.Attribute.Top, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Top, 1, 0),
            new CCLayoutConstraint(stackView, CCLayoutConstraint.Attribute.Bottom, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Bottom, 1, 0),
            new CCLayoutConstraint(stackView, CCLayoutConstraint.Attribute.Left, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Left, 1, 0),
            new CCLayoutConstraint(stackView, CCLayoutConstraint.Attribute.Right, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Right, 1, 0)
        ]);
        stackView.spacing = 1;
        stackView.arrangedHorizontally = true;
        stackView.addSubview(new MyView({x: 1, y: 1, width: 10, height: 10}), 2);
        stackView.addSubview(new MyView({x: 1, y: 1, width: 10, height: 10}), 1);
        stackView.addSubview(new MyView({x: 1, y: 1, width: 10, height: 10}), 3);

        let quit = new CCButton({x: 1, y: 1}, "Quit", () => this.view.window!.close());
        this.view.addSubview(quit);
        CCView.addConstraintsByCode(`
            quit.CenterX = superview.CenterX
            quit.Bottom = superview.Bottom
            quit.Width = 6
            quit.Height = 1

            tabView.Top = superview.Top
            tabView.Bottom = superview.Bottom - 1
            tabView.Left = superview.Left
            tabView.Right = superview.Right
        `, {quit: quit, superview: this.view, tabView: tabView});
    }

    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        this.view.window!.title = "CCKit2 Demo";
    }
}

class AppDelegate implements CCApplicationDelegate {
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }

    applicationDidFinishLaunching(app: CCApplication, launchOptions: CCApplication.LaunchOptions): void {
        if (app.wmConnection.setAppMetadata) app.wmConnection.setAppMetadata("BasicApp", CCImage.createFromBlitImage([[[string.char(1, 2), "22", "00"]]]));
    }
}

CCApplicationMain(ViewController, new AppDelegate(), ...$vararg);
