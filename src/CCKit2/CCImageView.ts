import CCView from "CCKit2/CCView";
import CCImage from "CCKit2/CCImage";
import { CCPoint, CCRect } from "CCKit2/CCTypes";
import { JSX } from "CCKit2/CCJSX";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A CCImageView displays images on the screen.  
 * ![Example image](../../images/CCImageView.png)
 * @category Views
 */
export default class CCImageView extends CCView {
    /** The image to draw. */
    public get image(): CCImage {return this._image;}
    public set image(value: CCImage) {
        this._image = value;
        this.frame = {x: this.frame.x, y: this.frame.y, width: value.size.width, height: value.size.height};
    }
    private _image: CCImage;

    /**
     * Creates a new CCImageView at the specified position.
     * @param pos The position of the view
     * @param image The image for the view
     */
    public constructor(pos: CCPoint, image: CCImage) {
        super({x: pos.x, y: pos.y, width: image.size.width, height: image.size.height});
        this._image = image;
    }

    public draw(rect: CCRect): void {
        CCGraphicsContext.current!.drawImage(this._image, {x: 1, y: 1});
    }
}

/**
 * Creates a new JSX element.
 * @param attrs The attributes for the element
 * @returns The new element
 */
export function JSX(attrs: JSX.AttributesFor<CCImageView, {pos: JSX.AttributeValues<CCPoint>, image: CCImage}>, text: string | undefined, parameters: JSX.ParameterElements[]): CCView {
    const pos: number[] = attrs.pos.split(" ").map(n => tonumber(n)) as number[];
    if (pos.length < 2) throw "Bad pos attribute in JSX code";
    let retval = new CCImageView({x: pos[0], y: pos[1]}, attrs.image);
    retval.loadJSXAttributes(attrs);
    return retval;
}
