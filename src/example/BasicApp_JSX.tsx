import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import { JSX as CCButtonJSX, default as CCButton } from "CCKit2/CCButton";
import { JSX as CCCheckbox } from "CCKit2/CCCheckbox";
import { JSX as CCComboBox } from "CCKit2/CCComboBox";
import CCDefaultWindowManagerConnection from "CCKit2/CCDefaultWindowManagerConnection";
import CCDialog from "CCKit2/CCDialog";
import CCEvent from "CCKit2/CCEvent";
import CCImage from "CCKit2/CCImage";
import { JSX as CCImageView } from "CCKit2/CCImageView";
import { JSX as CCLabelJSX, default as CCLabel } from "CCKit2/CCLabel";
import CCLayoutConstraint from "CCKit2/CCLayoutConstraint";
import { JSX as CCProgressIndicatorJSX, default as CCProgressIndicator } from "CCKit2/CCProgressIndicator";
import { JSX as CCRadioButtonJSX, default as CCRadioButton } from "CCKit2/CCRadioButton";
import { JSX as CCScrollView } from "CCKit2/CCScrollView";
import { JSX as CCSlider } from "CCKit2/CCSlider";
import { JSX as CCStackView } from "CCKit2/CCStackView";
import { JSX as CCTableView } from "CCKit2/CCTableView";
import CCTableViewStaticDataSource from "CCKit2/CCTableViewStaticDataSource";
import { JSX as CCTabView } from "CCKit2/CCTabView";
import { JSX as CCTextField } from "CCKit2/CCTextField";
import { JSX as CCTextView } from "CCKit2/CCTextView";
import { CCColor, CCRect, CCSize } from "CCKit2/CCTypes";
import { JSX as CCViewJSX, GenericJSX, default as CCView } from "CCKit2/CCView";
import CCViewController from "CCKit2/CCViewController";
import CCWindowManagerConnection from "CCKit2/CCWindowManagerConnection";
import * as CCJSX from "CCKit2/CCJSX";

const tableData: (string | number)[][] = [
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
    public label!: CCLabel;
    private count: number = 0;
    public progress!: CCProgressIndicator;
    public button!: CCButton;
    public sliderText!: CCLabel;

    public get preferredContentSize(): CCSize {
        return {width: 30, height: 11};
    }

    private increment(): void {
        this.count++;
        this.label.text = "Count: " + this.count;
        this.progress.progress = this.count / 100;
    }

    public get constructedView(): CCJSX.JSX.Element {
        let radioCallback: (this: void, sender: CCRadioButton) => void = (sender) => {

        };
        return <CCViewJSX frame="1 1 30 11" backgroundColor="white">
            <CCTabView frame="1 1 30 10">
                <tab name="Basic" backgroundColor="white">
                    <CCLabelJSX pos="1 1" outlet={this.outlet("label")}>Hello World!</CCLabelJSX>
                    <CCButtonJSX pos="1 1" action={this.action(this.increment)} outlet={this.outlet("button")}>Increment</CCButtonJSX>
                    <CCScrollView frame="17 1 12 4" innerSize="11 20">
                        <CCImageView pos="1 1" image={CCImage.createFromNFP(
`ffff0123
eeee4567
dddd89ab
bbbbcdef`)} />
                        <CCTextView frame="1 5 11 16">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </CCTextView>
                    </CCScrollView>
                    <CCCheckbox pos="2 3" onStateChange={(_, state) => this.button.isEnabled = state} checked>Enabled</CCCheckbox>
                    <CCProgressIndicatorJSX frame="1 4 11 1" style="ThinBar" outlet={this.outlet("progress")} />
                    <CCSlider frame="1 5 11 1" action={(_, position) => {
                        this.sliderText.text = string.format("%.1f", position);
                    }} />
                    <CCLabelJSX pos="13 5" outlet={this.outlet("sliderText")}>0.0</CCLabelJSX>
                    <CCTextField frame="1 6 11 1" placeholderText="Text..."></CCTextField>
                    <CCRadioButtonJSX pos="21 5" onStateChange={radioCallback}>Opt 1</CCRadioButtonJSX>
                    <CCRadioButtonJSX pos="21 6" onStateChange={radioCallback}>Opt 2</CCRadioButtonJSX>
                    <CCRadioButtonJSX pos="21 7" onStateChange={radioCallback}>Opt 3</CCRadioButtonJSX>
                    <CCButtonJSX pos="2 7" action={() => CCDialog.messageWithOneButton(this.view.window, "Alert", "This is a test of the dialog box and text view functionality, showing word wrapping.")}>Dialog</CCButtonJSX>
                    <CCComboBox frame="2 8 11 1">
                        <selection>Pick Me</selection>
                        <selection>Choose Me</selection>
                        <selection>Select Me</selection>
                    </CCComboBox>
                </tab>
                <tab name="Table">
                    <CCTableView frame="1 1 28 8" dataSource={new CCTableViewStaticDataSource(tableData, ["Name", "Address", "Phone", "Age"])} canSelectRow />
                </tab>
                <tab name="Stack">
                    <CCStackView frame="1 1 28 8" spacing="1" arrangedHorizontally>
                        <constraint firstAttribute="Top" relation="Equal" secondItem="superview" secondAttribute="Top" />
                        <constraint firstAttribute="Bottom" relation="Equal" secondItem="superview" secondAttribute="Bottom" />
                        <constraint firstAttribute="Left" relation="Equal" secondItem="superview" secondAttribute="Left" />
                        <constraint firstAttribute="Right" relation="Equal" secondItem="superview" secondAttribute="Right" />

                        <GenericJSX type={MyView} frame="1 1 10 10" weight="2" />
                        <GenericJSX type={MyView} frame="1 1 10 10" weight="1" />
                        <GenericJSX type={MyView} frame="1 1 10 10" weight="3" />
                    </CCStackView>
                </tab>
                <constraint firstAttribute="Top" relation="Equal" secondItem="superview" secondAttribute="Top" />
                <constraint firstAttribute="Bottom" relation="Equal" secondItem="superview" secondAttribute="Bottom" constant="-1" />
                <constraint firstAttribute="Left" relation="Equal" secondItem="superview" secondAttribute="Left" />
                <constraint firstAttribute="Right" relation="Equal" secondItem="superview" secondAttribute="Right" />
            </CCTabView>
            <CCButtonJSX pos="1 1" action={() => this.view.window!.close()}>
                Quit
                <constraint firstAttribute="CenterX" relation="Equal" secondItem="superview" secondAttribute="CenterX" />
                <constraint firstAttribute="Bottom" relation="Equal" secondItem="superview" secondAttribute="Bottom" />
                <constraint firstAttribute="Width" relation="Equal" constant="6" />
                <constraint firstAttribute="Height" relation="Equal" constant="1" />
            </CCButtonJSX>
        </CCViewJSX>;
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
