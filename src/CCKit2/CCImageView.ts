import CCView from "CCKit2/CCView";
import CCImage from "CCKit2/CCImage";
import { CCPoint, CCRect } from "CCKit2/CCTypes";
import CCGraphicsContext from "CCKit2/CCGraphicsContext";

/**
 * A CCImageView displays images on the screen.
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
        CCGraphicsContext.current.drawImage(this._image, {x: 1, y: 1});
    }
}
