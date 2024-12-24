import CCGraphicsContext from "CCKit2/CCGraphicsContext";
import { CCColor, CCRect } from "CCKit2/CCTypes";
import CCView from "CCKit2/CCView";

/**
 * A CCProgressIndicator displays a progress bar or wheel.
 */
class CCProgressIndicator extends CCView {
    /** The color of the active part of the progress bar. */
    public get activeColor(): CCColor {return this._activeColor;}
    public set activeColor(value: CCColor) {
        this._activeColor = value;
        this.setNeedsDisplay();
    }
    private _activeColor: CCColor = CCColor.blue;
    /** The color of the inactive part of the progress bar. */
    public get inactiveColor(): CCColor {return this._inactiveColor;}
    public set inactiveColor(value: CCColor) {
        this._inactiveColor = value;
        this.setNeedsDisplay();
    }
    private _inactiveColor: CCColor = CCColor.lightGray;
    /** The current value of the progress indicator, from 0.0 to 1.0. */
    public get progress(): number | undefined {return this._progress;}
    public set progress(value: number | undefined) {
        this._progress = value !== undefined ? Math.min(Math.max(value, 0), 1) : undefined;
        this.setNeedsDisplay();
    }
    private _progress: number | undefined = undefined;
    /** The style of the progress indicator. */
    public get style(): CCProgressIndicator.Style {return this._style;}
    public set style(value: CCProgressIndicator.Style) {
        this._style = value;
        this.setNeedsDisplay();
    }
    private _style: CCProgressIndicator.Style;

    /**
     * Creates a new CCProgressIndicator with the specified style.
     * @param frame The position and size of the indicator
     * @param style The style for the indicator
     */
    public constructor(frame: CCRect, style: CCProgressIndicator.Style) {
        super(frame)
        this._style = style;
    }

    public draw(frame: CCRect): void {
        // TODO: dirty rect
        const context = CCGraphicsContext.current!;
        switch (this._style) {
            case CCProgressIndicator.Style.Spinning:
                // TODO: animate
                context.drawText({x: 1, y: 1}, "/");
                break;
            case CCProgressIndicator.Style.ThickBar: {
                if (this._progress === undefined) {
                    context.color = this._activeColor;
                    for (let y = 0; y < this.frame.height; y++) {
                        context.drawText({x: 1, y: y + 1}, string.rep(string.char(0x7F), this.frame.width));
                    }
                } else {
                    let width = Math.floor(this._progress * this.frame.width);
                    context.color = this._activeColor;
                    context.drawFilledRectangle({x: 1, y: 1, width: width, height: this.frame.height});
                    context.color = this._inactiveColor;
                    for (let y = 0; y < this.frame.height; y++) {
                        context.drawText({x: width + 1, y: y + 1}, string.rep(string.char(0x7F), this.frame.width - width));
                    }
                }
                break;
            } case CCProgressIndicator.Style.ThinBar: {
                if (this._progress === undefined) {
                    for (let x = frame.x; x < frame.x + frame.width; x++) {
                        context.color = x % 2 === 0 ? this._activeColor : this._inactiveColor;
                        context.drawText({x: x, y: 1}, string.char(0x8C));
                    }
                } else {
                    let width = Math.floor(this._progress * this.frame.width);
                    context.color = this._activeColor;
                    context.drawText({x: 1, y: 1}, string.rep(string.char(0x8C), width));
                    context.color = this._inactiveColor;
                    context.drawText({x: width + 1, y: 1}, string.rep(string.char(0x8C), this.frame.width - width));
                }
                break;
            }
        }
    }

    // TODO: animation
}

namespace CCProgressIndicator {
    /** Styles for CCProgressIndicator display. */
    export enum Style {
        Spinning,  /** Spinning loading wheel */
        ThickBar,  /** Thick bar with shaded inactive area */
        ThinBar    /** Thin centered bar */
    }
}

export default CCProgressIndicator;
