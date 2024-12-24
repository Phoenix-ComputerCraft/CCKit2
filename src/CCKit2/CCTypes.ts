/**
 * A point in space.
 * @category Types
 */
export type CCPoint = {
    x: number;
    y: number;
}

/**
 * A size with width and height.
 * @category Types
 */
export type CCSize = {
    width: number;
    height: number;
}

/**
 * A rectangle has both a position and size.
 * @category Types
 */
export type CCRect = CCPoint & CCSize;

/**
 * Represents a color on screen, which can be modified with palettes.
 * @category Types
 */
export type CCColor = number;
/**
 * Represents a color on screen, which can be modified with palettes.
 * @category Types
 */
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
/**
 * Represents a color on screen, which can be modified with palettes.
 * @category Types
 */
export type CCColour = CCColor;
/**
 * Represents a color on screen, which can be modified with palettes.
 * @category Types
 */
export const CCColour = CCColor;

/**
 * Holds a weak reference to an object.
 * @category Types
 */
export class WeakRef<T> {
    public value?: T;
    private __mode: string = "v";
    constructor(obj?: T) {this.value = obj;}
}
WeakRef.prototype["__mode"] = "v";

/**
 * Represents an error thrown by the system.
 * @category Types
 */
export type CCError = string | {
    code: number,
    domain: string,
    message: string,
    description?: string
}

/**
 * Calculates the intersection of two rectangles.
 * @category Types
 * @param a The first rectangle to intersect
 * @param b The second rectangle to intersect
 * @returns The intersection of a and b
 */
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

/**
 * Holds a list of key constants used in CCKit2. These are independent of system-
 * specific codes; use this to check keycodes.
 * @category Types
 */
export enum CCKey {
    Backspace = 0x08,
    Tab = 0x09,
    Enter = 0x0A,
    Space = 0x20,
    Apostrophe = 0x27,
    Comma = 0x2C,
    Minus = 0x2D,
    Period = 0x2E,
    Slash = 0x2F,
    Zero = 0x30,
    One = 0x31,
    Two = 0x32,
    Three = 0x33,
    Four = 0x34,
    Five = 0x35,
    Six = 0x36,
    Seven = 0x37,
    Eight = 0x38,
    Nine = 0x39,
    Semicolon = 0x3B,
    Equals = 0x3C,
    LeftBracket = 0x5B,
    Backslash = 0x5C,
    RightBracket = 0x5D,
    Grave = 0x60,
    A = 0x61,
    B = 0x62,
    C = 0x63,
    D = 0x64,
    E = 0x65,
    F = 0x66,
    G = 0x67,
    H = 0x68,
    I = 0x69,
    J = 0x6A,
    K = 0x6B,
    L = 0x6C,
    M = 0x6D,
    N = 0x6E,
    O = 0x6F,
    P = 0x70,
    Q = 0x71,
    R = 0x72,
    S = 0x73,
    T = 0x74,
    U = 0x75,
    V = 0x76,
    W = 0x77,
    X = 0x78,
    Y = 0x79,
    Z = 0x7A,
    Delete = 0x7F,
    Insert = 0x80,
    F1 = 0x81,
    F2 = 0x82,
    F3 = 0x83,
    F4 = 0x84,
    F5 = 0x85,
    F6 = 0x86,
    F7 = 0x87,
    F8 = 0x88,
    F9 = 0x89,
    F10 = 0x8A,
    F11 = 0x8B,
    F12 = 0x8C,
    F13 = 0x8D,
    F14 = 0x8E,
    F15 = 0x8F,
    F16 = 0x90,
    F17 = 0x91,
    F18 = 0x92,
    F19 = 0x93,
    F20 = 0x94,
    F21 = 0x95,
    F22 = 0x96,
    F23 = 0x97,
    F24 = 0x98,
    F25 = 0x99,
    Convert = 0x9A,
    NoConvert = 0x9B,
    Kana = 0x9C,
    Kanji = 0x9D,
    Yen = 0x9E,
    NumPadDecimal = 0x9F,
    NumPad0 = 0xA0,
    NumPad1 = 0xA1,
    NumPad2 = 0xA2,
    NumPad3 = 0xA3,
    NumPad4 = 0xA4,
    NumPad5 = 0xA5,
    NumPad6 = 0xA6,
    NumPad7 = 0xA7,
    NumPad8 = 0xA8,
    NumPad9 = 0xA9,
    NumPadAdd = 0xAA,
    NumPadSubtract = 0xAB,
    NumPadMultiply = 0xAC,
    NumPadDivide = 0xAD,
    NumPadEqual = 0xAE,
    NumPadEnter = 0xAF,
    LeftCtrl = 0xB0,
    RightCtrl = 0xB1,
    LeftAlt = 0xB2,
    RightAlt = 0xB3,
    LeftShift = 0xB4,
    RightShift = 0xB5,
    LeftSuper = 0xB6,
    RightSuper = 0xB7,
    CapsLock = 0xB8,
    NumLock = 0xB9,
    ScrollLock = 0xBA,
    PrintScreen = 0xBB,
    Pause = 0xBC,
    Menu = 0xBD,
    Stop = 0xBE,
    Ax = 0xBF,
    Up = 0xC0,
    Down = 0xC1,
    Left = 0xC2,
    Right = 0xC3,
    PageUp = 0xC4,
    PageDown = 0xC5,
    Home = 0xC6,
    End = 0xC7,
    Circumflex = 0xC8,
    At = 0xC9,
    Colon = 0xCA,
    Underscore = 0xCB,
}
