export type CCPoint = {
    x: number;
    y: number;
}

export type CCSize = {
    width: number;
    height: number;
}

export type CCRect = CCPoint & CCSize;

export type CCColor = number;
export const CCColor: {[name: string]: CCColor} = {
    white: 0,
    orange: 1,
    magenta: 2,
    lightBlue: 3,
    yellow: 4,
    lime: 5,
    pink: 6,
    gray: 7,
    grey: 7,
    lightGray: 8,
    lightGrey: 8,
    cyan: 9,
    purple: 10,
    blue: 11,
    brown: 12,
    green: 13,
    red: 14,
    black: 15
}
export type CCColour = CCColor;
export const CCColour = CCColor;

export class WeakRef<T> {
    public value?: T;
    constructor(obj?: T) {this.value = obj;}
}
WeakRef.prototype["__mode"] = "v";

export type CCError = string | {
    code: number,
    domain: string,
    message: string,
    description?: string
}


export function CCRectIntersection(a: CCRect, b: CCRect): CCRect {
    const ax2 = a.x + a.width;
    const ay2 = a.y + a.height;
    const bx2 = b.x + b.width;
    const by2 = b.y + b.height;
    let retval = {x: math.max(a.x, b.x), y: math.max(a.y, b.y), width: 0, height: 0}
    retval.width = math.min(ax2, bx2) - retval.x;
    retval.height = math.min(ay2, by2) - retval.y;
    return retval;
}