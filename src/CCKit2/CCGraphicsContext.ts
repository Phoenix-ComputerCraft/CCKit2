import { CCColor, CCPoint, CCRect, CCSize } from "CCKit2/CCTypes";
import { CCWindowManagerFramebuffer, CCWindowManagerGraphicsFramebuffer } from "CCKit2/CCWindowManagerConnection";
import CCImage from "CCKit2/CCImage";

type GCState = CCRect & {
    color: CCColor;
    scale: CCSize;
};

const floor = math.floor;
const min = math.min;
const max = math.max;

/**
 * The CCGraphicsContext class is used to draw onto a surface with various
 * transformations applied on top.
 */
export default class CCGraphicsContext {
    private target?: CCWindowManagerFramebuffer;
    private gfxTarget?: CCWindowManagerGraphicsFramebuffer;
    private nativeSize: CCSize;

    private state: GCState = {x: 0, y: 0, width: 0, height: 0, scale: {width: 1, height: 1}, color: CCColor.black};
    private stack: GCState[] = [];

    /** The current context being used for drawing. */
    public static current?: CCGraphicsContext;

    /** The color to use for drawing. */
    public get color(): CCColor {
        return this.state.color;
    }
    public set color(value: CCColor) {
        this.state.color = value;
        if (this.target !== undefined) this.target!.setBackgroundColor(value as Color);
    }

    /**
     * Creates a new graphics context. This is not intended to be used by user
     * programs - use `CCGraphicsContext.current instead`.
     * @package
     */
    public constructor(target: CCWindowManagerFramebuffer|CCWindowManagerGraphicsFramebuffer) {
        if ("write" in target) {
            this.target = target as CCWindowManagerFramebuffer;
            this.gfxTarget = undefined;
            [this.state.width, this.state.height] = this.target.getSize();
            this.nativeSize = {width: this.state.width, height: this.state.height};
        } else if ("setPixel" in target) {
            this.target = undefined;
            this.gfxTarget = target as CCWindowManagerGraphicsFramebuffer;
            [this.state.width, this.state.height] = this.gfxTarget.getSize();
            this.nativeSize = {width: this.state.width, height: this.state.height};
            this.state.width /= 6;
            this.state.height /= 9;
        } else {
            throw "Invalid argument";
        }
    }

    private pointToTargetSpace(point: CCPoint): CCPoint {
        return {
            x: min(max(floor((min(max(point.x, 1), this.state.width) - 1) / this.state.scale.width + this.state.x + 1), 1), this.nativeSize.width),
            y: min(max(floor((min(max(point.y, 1), this.state.height) - 1) / this.state.scale.height + this.state.y + 1), 1), this.nativeSize.height)
        }
    }

    /**
     * Saves the current state of the context to a stack.
     */
    public pushState(): void {
        this.stack.push({
            x: this.state.x,
            y: this.state.y,
            width: this.state.width,
            height: this.state.height,
            scale: {
                width: this.state.scale.width,
                height: this.state.scale.height
            },
            color: this.state.color
        });
    }

    /**
     * Restores the previous state of the graphics context from the stack.
     */
    public popState(): void {
        if (this.stack.length === 0) return;
        this.state = this.stack.pop()!;
    }

    /** Returns the size of the context, in virtual pixels. */
    public get size(): CCSize {
        return {
            width: this.state.width,
            height: this.state.height
        }
    }

    /**
     * Moves the origin point of the context, resizing the context.
     * @param point The point to relocate to, relative to the current origin
     */
    public setOrigin(point: CCPoint): void {
        const changeX = min(max(point.x - 1, 0), this.state.width);
        const changeY = min(max(point.y - 1, 0), this.state.height);
        this.state.x += changeX / this.state.scale.width;
        this.state.y += changeY / this.state.scale.height;
        this.state.width -= changeX;
        this.state.height -= changeY;
    }

    /**
     * Resizes the context without moving the origin.
     * @param size The new size of the context. Resizing larger will have no effect.
     */
    public setSize(size: CCSize): void {
        this.state.width = min(max(size.width, 0), this.state.width);
        this.state.height = min(max(size.height, 0), this.state.height);
    }

    /**
     * Repositions the context to a target rectangle, changing both origin and size.
     * @param rect The rectangle to reposition to
     */
    public setRect(rect: CCRect): void {
        const changeX = min(max(rect.x - 1, 0), this.state.width);
        const changeY = min(max(rect.y - 1, 0), this.state.height);
        this.state.x += changeX / this.state.scale.width;
        this.state.y += changeY / this.state.scale.height;
        this.state.width = min(max(rect.width, 0), this.state.width - changeX);
        this.state.height = min(max(rect.height, 0), this.state.height - changeY);
    }

    /**
     * Sets the virtual size of the context. This causes all future points to
     * be scaled to fit inside this size.
     * @param size The new virtual size of the context
     */
    public setVirtualSize(size: CCSize): void {
        this.state.width = size.width;
        this.state.height = size.height;
        this.state.scale.width = size.width / this.state.scale.width;
        this.state.scale.height = size.height / this.state.scale.height;
    }

    /**
     * Draws a point with the current color.
     * @param point The point to draw at
     */
    public drawPoint(point: CCPoint): void {
        const realPoint = this.pointToTargetSpace(point);
        if (this.gfxTarget) {
            // TODO
        } else {
            this.target!.setCursorPos(realPoint.x, realPoint.y);
            this.target!.write(" ");
        }
    }

    /**
     * Draw a line between two points using the current color.
     * @param start The point to start the line at
     * @param end The point to end the line at
     */
    public drawLine(start: CCPoint, end: CCPoint): void {
        if (start.y === end.y) {
            const startReal = this.pointToTargetSpace(start), endReal = this.pointToTargetSpace(end);
            const width = endReal.x - startReal.x;
            if (this.gfxTarget) {
                // TODO
            } else if (this.target) {
                this.target.setCursorPos(startReal.x, startReal.y);
                this.target.write(string.rep(" ", width));
            }
            return;
        }
        if (math.abs(end.y - start.y) < math.abs(end.x - start.x)) {
            if (start.x > end.x) {
                const a = end;
                end = start;
                start = a;
            }
            let dx = end.x - start.x, dy = end.y - start.y, yi = 1;
            if (dy < 0) {yi = -1; dy = -dy;}
            let D = 2*dy - dx, y = start.y;
            if (yi < 0) {
                y = end.y;
                for (let x = end.x; x >= start.x; x--) {
                    this.drawPoint({x: x, y: y});
                    if (D > 0) {
                        y = y + 1;
                        D = D + 2*(dy - dx);
                    } else {
                        D = D + 2*dy;
                    }
                }
            } else {
                for (let x = start.x; x <= end.x; x++) {
                    this.drawPoint({x: x, y: y});
                    if (D > 0) {
                        y = y + 1;
                        D = D + 2*(dy - dx);
                    } else {
                        D = D + 2*dy;
                    }
                }
            }
        } else {
            if (start.y > end.y) {
                const a = end;
                end = start;
                start = a;
            }
            let dx = end.x - start.x, dy = end.y - start.y, xi = 1;
            if (dx < 0) {xi = -1; dx = -dx;}
            let D = 2*dx - dy, x = start.x;
            for (let y = start.y; y <= end.y; y++) {
                this.drawPoint({x: x, y: y});
                if (D > 0) {
                    x = x + xi;
                    D = D + 2*(dx - dy);
                } else {
                    D = D + 2*dx;
                }
            }
        }
    }

    /** 
     * Draw a rectangle outline using the current color.
     * @param rect The rectangle to draw
     */
    public drawRectangle(rect: CCRect): void {
        const startReal = this.pointToTargetSpace(rect), endReal = this.pointToTargetSpace({x: rect.x + rect.width - 1, y: rect.y + rect.height - 1});
        const width = endReal.x - startReal.x + 1;
        if (this.gfxTarget) {
            // TODO
        } else if (this.target) {
            this.target.setCursorPos(startReal.x, startReal.y);
            this.target.write(string.rep(" ", width));
            this.target.setCursorPos(endReal.x, endReal.y);
            this.target.write(string.rep(" ", width));
            for (let y = startReal.y + 1; y <= endReal.y - 1; y++) {
                this.target.setCursorPos(startReal.x, y);
                this.target.write(" ");
                this.target.setCursorPos(endReal.x, y);
                this.target.write(" ");
            }
        }
    }

    /** 
     * Draw a filled rectangle using the current color.
     * @param rect The rectangle to draw
     */
    public drawFilledRectangle(rect: CCRect): void {
        const startReal = this.pointToTargetSpace(rect), endReal = this.pointToTargetSpace({x: rect.x + rect.width - 1, y: rect.y + rect.height - 1});
        const width = endReal.x - startReal.x + 1;
        if (this.gfxTarget) {
            // TODO
        } else if (this.target) {
            for (let y = startReal.y; y <= endReal.y; y++) {
                this.target.setCursorPos(startReal.x, y);
                this.target.write(string.rep(" ", width));
            }
        }
    }

    /**
     * Draw text at the specified point on top of existing content.
     * This does not wrap text - any overflow will be clipped.
     * @param point The leftmost point to draw at
     * @param text The text to draw
     */
    public drawText(start: CCPoint, text: string): void {
        const startReal = this.pointToTargetSpace(start);
        if (this.gfxTarget) {
            // TODO: font renderer
        } else if (this.target) {
            this.target.setCursorPos(startReal.x, startReal.y);
            if (text.length > this.state.width / this.state.scale.width)
                text = text.substring(0, floor(this.state.width / this.state.scale.width));
            const [ogtext, fg, bg] = this.target.getLine(startReal.y);
            if (text.length > ogtext!.length - startReal.x + 1)
                text = text.substring(0, ogtext!.length - startReal.x + 1);
            this.target.blit(text, string.rep(string.format("%x", this.state.color), text.length), bg!.substring(startReal.x - 1, startReal.x - 1 + text.length));
            this.target.setBackgroundColor(this.state.color as Color);
        }
    }

    /**
     * Draw text at the specified point with a background.
     * This does not wrap text - any overflow will be clipped.
     * @param point The leftmost point to draw at
     * @param text The text to draw
     */
    public drawTextWithBackground(start: CCPoint, text: string, background: CCColor): void {
        const startReal = this.pointToTargetSpace(start);
        if (this.gfxTarget) {
            // TODO: font renderer
        } else if (this.target) {
            this.target.setCursorPos(startReal.x, startReal.y);
            if (text.length > this.state.width / this.state.scale.width)
                text = text.substring(0, floor(this.state.width / this.state.scale.width - (startReal.x - 1)));
            this.target.blit(text, string.rep(string.format("%x", this.state.color), text.length), string.rep(string.format("%x", background), text.length));
            this.target.setBackgroundColor(this.state.color as Color);
        }
    }

    /**
     * Draw an image at the specified location.
     * @param image The image to draw
     * @param pos The position to draw the image at
     */
    public drawImage(image: CCImage, pos: CCPoint): void {
        const startReal = this.pointToTargetSpace(pos);
        if (this.gfxTarget) {
            // TODO: pixel drawing
        } else if (this.target) {
            if (image.bimgRepresentation === undefined) {
                // TODO: handle this better
                throw "Image has no text representation";
            }
            for (let y = 0; y < image.bimgRepresentation.length; y++) {
                let [text, fg, bg] = image.bimgRepresentation[y];
                if (text.length > this.state.width / this.state.scale.width)
                    text = text.substring(0, floor(this.state.width / this.state.scale.width - (startReal.x - 1)));
                if (fg.length > this.state.width / this.state.scale.width)
                    fg = fg.substring(0, floor(this.state.width / this.state.scale.width - (startReal.x - 1)));
                if (bg.length > this.state.width / this.state.scale.width)
                    bg = bg.substring(0, floor(this.state.width / this.state.scale.width - (startReal.x - 1)));
                this.target.setCursorPos(startReal.x, startReal.y + y);
                this.target.blit(text, fg, bg);
            }
            this.target.setBackgroundColor(this.state.color as Color);
        }
        // TODO: handle palettes
    }
}
