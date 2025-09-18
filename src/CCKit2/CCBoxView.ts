import CCGraphicsContext from "./CCGraphicsContext";
import { CCColor, CCPoint, CCRect, CCRectIntersection } from "./CCTypes";
import CCView from "./CCView";

/**
 * A box view displays its contents inset inside a rectangular box.
 * @category Views
 */
export default class CCBoxView extends CCView {
    /** The color of the border. */
    public get borderColor(): CCColor {return this._borderColor;}
    public set borderColor(value: CCColor) {
        this._borderColor = value;
        this.setNeedsDisplay();
    }
    private _borderColor: CCColor = CCColor.lightGray;

    public display(rect: CCRect): void {
        const needsDraw = this.needsDraw;
        if (needsDraw) {
            this.needsDraw = false;
            this.draw(rect);
        }
        CCGraphicsContext.current!.pushState();
        let boxrect = {x: 2, y: 2, width: this.frame.width - 2, height: this.frame.height - 2};
        CCGraphicsContext.current!.setRect(boxrect);
        rect = CCRectIntersection(boxrect, rect);
        rect.x--; rect.y--;
        for (let view of this.subviews) {
            if (needsDraw) view.needsDraw = true;
            let vr = CCRectIntersection(view.frame, rect);
            vr.x = vr.x - view.frame.x + 1;
            vr.y = vr.y - view.frame.y + 1;
            if (vr.width > 0 && vr.height > 0) {
                CCGraphicsContext.current!.pushState();
                CCGraphicsContext.current!.setRect(view.frame);
                view.display(vr);
                CCGraphicsContext.current!.popState();
            }
        }
        CCGraphicsContext.current!.popState();
    }

    public draw(rect: CCRect): void {
        super.draw(rect);
        let ctx = CCGraphicsContext.current!;
        ctx.color = this._borderColor;
        ctx.drawText({x: 1, y: 1}, string.char(0x9C) + string.rep(string.char(0x8C), this.frame.width - 2));
        ctx.drawTextInverted({x: this.frame.width, y: 1}, string.char(0x93));
        ctx.drawText({x: 1, y: this.frame.height}, string.char(0x8D) + string.rep(string.char(0x8C), this.frame.width - 2) + string.char(0x8E));
        for (let y = 2; y < this.frame.height; y++) {
            ctx.drawText({x: 1, y: y}, string.char(0x95));
            ctx.drawTextInverted({x: this.frame.width, y: y}, string.char(0x95));
        }
    }

    public convertToWindowSpace(point: CCPoint): CCPoint {
        if (this.superview === undefined) return {x: point.x + 1, y: point.y + 1};
        return this.superview.convertToWindowSpace({x: this.frame.x + point.x, y: this.frame.y + point.y});
    }

    public hitTest(point: CCPoint): CCView | undefined {
        const frame = this.frame;
        if (!(point.x >= frame.x + 1 && point.y >= frame.y + 1 && point.x < frame.x + frame.width - 1 && point.y < frame.y + frame.height - 1))
            return undefined;
        return super.hitTest({x: point.x - 1, y: point.y - 1});
    }
}
