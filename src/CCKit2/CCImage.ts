import { CCSize } from "CCKit2/CCTypes";

type BIMG = {
    version: string,
    author?: string,
    title?: string,
    description?: string,
    creator?: string,
    date?: string,
    width?: number,
    height?: number,
    animated: boolean,
    secondsPerFrame?: number,
    palette?: (number | [number, number, number])[]
} & ([string, string, string][] & {duration?: number, palette?: (number | [number, number, number])[]})[];

/**
 * A CCImage represents an image that can be displayed on screen.
 * @category Core
 */
export default class CCImage {
    /** The size of the image in characters. */
    public size!: CCSize;
    /** The blit image representation of the image, if available. */
    public bimgRepresentation?: [string, string, string][];
    /** The graphical buffer representation of the image. */
    public pixelRepresentation!: (number | undefined)[][];
    /** The palette associated with the image, if required. */
    public palette?: number[];

    private constructor() {}

    /**
     * Create a new CCImage object from a blit image (BIMG) file/data.
     * @param image The blit image to load (already unserialized)
     * @param frame The *0-indexed* frame number to load (defaults to the first frame)
     * @returns The newly loaded image
     * @typecheck
     */
    public static createFromBlitImage(image: object, frame: number = 0): CCImage {
        let bimg = image as BIMG;
        //if (typeof bimg.version !== "string") throw "Not BIMG data";
        if (typeof bimg[frame] !== "object") throw "Invalid frame number";
        let retval = new CCImage();
        if (bimg.width !== undefined && bimg.height !== undefined)
            retval.size = {width: bimg.width, height: bimg.height};
        else
            retval.size = {width: bimg[frame][0][0].length, height: bimg[frame].length};
        retval.bimgRepresentation = bimg[frame];
        let palette: (number | [number, number, number])[] | undefined = undefined;
        if (bimg[frame].palette !== undefined) palette = bimg[frame].palette;
        else if (bimg.palette !== undefined) palette = bimg.palette;
        if (palette !== undefined) {
            retval.palette = [];
            for (let i = -1; i < 14; i++) {
                if (typeof palette[i] === "object") {
                    let [r, g, b] = palette[i] as [number, number, number];
                    retval.palette[i+1] = r * 255 * 65536 + g * 255 * 256 + b * 255;
                } else retval.palette[i+1] = palette[i] as number;
            }
        }
        retval.pixelRepresentation = [];
        for (let y = 0; y < retval.bimgRepresentation.length; y++) {
            let src = retval.bimgRepresentation[y];
            let line1: (number | undefined)[] = [];
            let line2: (number | undefined)[] = [];
            let line3: (number | undefined)[] = [];
            for (let x = 0; x < src.length; x++) {
                let ch = src[0].charCodeAt(x);
                let fg = tonumber(src[1].charAt(x), 16);
                let bg = tonumber(src[2].charAt(x), 16);
                let a = (ch & 1) !== 0 ? fg : bg, b = (ch & 2) !== 0 ? fg : bg,
                    c = (ch & 4) !== 0 ? fg : bg, d = (ch & 8) !== 0 ? fg : bg,
                    e = (ch & 16) !== 0 ? fg : bg;
                line1[x*6] = a;
                line1[x*6+1] = a;
                line1[x*6+2] = a;
                line1[x*6+3] = b;
                line1[x*6+4] = b;
                line1[x*6+5] = b;
                line2[x*6] = c;
                line2[x*6+1] = c;
                line2[x*6+2] = c;
                line2[x*6+3] = d;
                line2[x*6+4] = d;
                line2[x*6+5] = d;
                line3[x*6] = e;
                line3[x*6+1] = e;
                line3[x*6+2] = e;
                line3[x*6+3] = bg;
                line3[x*6+4] = bg;
                line3[x*6+5] = bg;
            }
            retval.pixelRepresentation[y*9] = line1;
            retval.pixelRepresentation[y*9+1] = line1;
            retval.pixelRepresentation[y*9+2] = line1;
            retval.pixelRepresentation[y*9+3] = line2;
            retval.pixelRepresentation[y*9+4] = line2;
            retval.pixelRepresentation[y*9+5] = line2;
            retval.pixelRepresentation[y*9+6] = line3;
            retval.pixelRepresentation[y*9+7] = line3;
            retval.pixelRepresentation[y*9+8] = line3;
        }
        return retval;
    }

    /**
     * Creates a new CCImage object from an NFP file.
     * @param image The NFP image data to load
     * @return The newly created image
     * @typecheck
     */
    public static createFromNFP(image: string): CCImage {
        let lines = image.split("\n").flatMap(str => string.gsub(str, "%X", "")[0]);
        if (lines[lines.length-1] === "") delete lines[lines.length-1];
        let retval = new CCImage();
        retval.size = {width: 0, height: lines.length};
        for (let line of lines) retval.size.width = Math.max(retval.size.width, line.length);
        retval.bimgRepresentation = [];
        retval.pixelRepresentation = [];
        for (let line of lines) {
            if (line.length < retval.size.width) line += string.rep(" ", retval.size.width - line.length);
            retval.bimgRepresentation[retval.bimgRepresentation.length] = [
                string.rep(" ", retval.size.width),
                string.rep(" ", retval.size.width),
                line
            ];
            let pixels = line.split("").flatMap(c => {let n = tonumber(c, 16); if (n === undefined) throw "Invalid NFP"; return [n, n, n, n, n, n]});
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
            retval.pixelRepresentation[retval.pixelRepresentation.length] = pixels;
        }
        return retval;
    }

    /**
     * Creates a new CCImage object from a pixel buffer.
     * @param pixels The pixel data to load
     * @return The newly created image
     * @typecheck
     */
    public static createFromPixels(pixels: (number[] | string)[]): CCImage {
        let retval = new CCImage();
        retval.size = {width: 0, height: pixels.length / 9};
        retval.pixelRepresentation = [];
        for (let line of pixels) {
            retval.size.width = Math.max(retval.size.width, line.length / 6);
            if (typeof line === "string")
                retval.pixelRepresentation[retval.pixelRepresentation.length] = line.split("").map(c => c.charCodeAt(0));
            else retval.pixelRepresentation[retval.pixelRepresentation.length] = line as number[];
        }
        return retval;
    }
}
