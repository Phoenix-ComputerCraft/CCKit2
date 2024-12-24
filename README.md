# CCKit2
An advanced UI framework for ComputerCraft written in TypeScript, targeting both Phoenix and CraftOS systems.

## Getting Started
Instructions vary depending on what OS and language you're using.

### 1. Installation
#### Phoenix
These steps only apply to users who installed the "minimal" OS without a desktop. Desktop users already have everything installed.

Install the `cckit2` package through `apt`:

```bash
sudo apt install cckit2
```

You will also need a window manager that's compatible with CCKit2.
- Hydra supports running multiple applications side-by-side on a single desktop, with window decorations and dragging. However, it must be run separately from the app. This is what comes preinstalled on the desktop distribution.
- The framebuffer window manager can be used to run a single application from the terminal. It does not support window decorations or dragging, and has limited multi-window support.

For Hydra support, run `sudo apt install hydra cckit2-wm-hydra`. For basic framebuffer support, run `sudo apt install cckit2-wm-fb`.

#### CraftOS
To install system-wide, run `pastebin run `. This will place CCKit2's files in `/CCKit2`. Note that applications in a folder will need to have `CCKit2` copied inside to work properly.

Alternatively, download and extract the latest build of CCKit2 for CraftOS from the Releases page. This will include the CraftOS window manager with it, so it won't need any extra fiddling to work. Then copy the `CCKit2` folder into the root of the computer.

#### From source
If you prefer to build from source:
1. Clone the CCKit2 repo, as well as the repo for the window manager of your choice.
2. Run `npm install` in each to get the required packages.
3. Run `npm run build` in each to build the library.
4. Copy `bin/CCKit2` in each repo to the computer, merging the WM files into the core library.
  - If you're using Phoenix, copy to `/usr/lib/CCKit2`. The files here will override the default package in `/usr/lib/libCCKit2.a`.
  - If you're using CraftOS, copy to `/CCKit2`.

### 2. Project Set-Up
#### TypeScript
TypeScript is the preferred language for CCKit2, as it provides strong typing and syntax features that help keep your code clean and stable.

The quickest way to create a new TypeScript project is to clone the [template repo](https://github.com/Phoenix-ComputerCraft/CCKit2-Template). This will have all of the required configuration ready to go. After downloading it, open the folder in the terminal and run `npm install` to install the dependencies. Then open `package.json` and replace the placeholder text with info about your project (recommended if publishing on GitHub).

Alternatively, you may set it up manually:
1. Create a new empty directory and open it in a terminal.
2. Run `npm init` to create a new project, and answer each question. When it asks for an entry point, give it `src/index.ts` (or your app's main program).
3. Run `npm install --save-dev @jackmacwindows/typescript-to-lua @jackmacwindows/lua-types @phoenix-cc/cckit2` to install TSTL and CCKit2's typings.
4. Install a system runtime if required:
  - For Phoenix, or CraftOS using libsystem-craftos, run `npm install --save-dev @phoenix-cc/libsystem`.
  - For CraftOS, or Phoenix using libcraftos, run `npm install --save-dev @jackmacwindows/craftos-types`.
5. Create a file named `tsconfig.json`, and insert the following contents:
```json
{
    "$schema": "https://raw.githubusercontent.com/MCJack123/TypeScriptToLua/master/tsconfig-schema.json",
    "compilerOptions": {
        "target": "ESNext",
        "lib": ["ESNext"],
        "moduleResolution": "node",
        "strict": true,
        "typeRoots": ["./node_modules"],
        "types": ["@jackmacwindows/lua-types/cc", "@phoenix-cc/cckit2"],
        "baseUrl": "./src",
        "rootDir": "src",
        "outDir": "bin",
        "declaration": true,
        "removeComments": false
    },
    "tstl": {
        "luaTarget": "CC",
        "luaLibImport": "require",
        "luaLibName": "typescript"
    },
    "include": [
        "./src/*.ts"
    ]
}
```
6. Create a directory called `src`, and create a file named `index.ts` inside. This will serve as your app's main file.

#### Lua
Lua projects are not recommended because they don't have the same safety guarantees as TypeScript, and may require some more verbose code with wrappers to accomplish certain tasks. However, it remains an option for users who don't know or simply wish to avoid TypeScript.

Creating a Lua project is as simple as making a single Lua file for the app. Place the following code at the top of every Lua file you create, as it loads important compatibility wrappers for Lua projects:

```lua
local LuaWrappers = require "CCKit2.LuaWrappers"
```

When loading CCKit2 classes, use `LuaWrappers.import` instead of `require`, as it returns a more manageable module format than the one that TypeScript exports.

### 3. Basic Template
Here's a barebones template program to demonstrate the structure of a CCKit2 application.

```ts
import CCApplication from "CCKit2/CCApplication";
import CCApplicationDelegate from "CCKit2/CCApplicationDelegate";
import CCApplicationMain from "CCKit2/CCApplicationMain";
import CCDefaultWindowManagerConnection from "CCKit2/CCDefaultWindowManagerConnection";
import CCViewController from "CCKit2/CCViewController";

class ViewController extends CCViewController {
    public viewDidLoad(): void {
        super.viewDidLoad();
        // Add views to the view controller here.
        // let myView = new CCLabel({x: 1, y: 1}, "Hello World!");
        // this.view.addSubview(myView);
    }
}

class AppDelegate implements CCApplicationDelegate {
    applicationWindowManagerConnection(app: CCApplication): CCWindowManagerConnection {
        return CCDefaultWindowManagerConnection(app);
    }
}

CCApplicationMain(ViewController, new AppDelegate());
```

```lua
local LuaWrappers = require "CCKit2.LuaWrappers"
local CCApplicationMain = LuaWrappers.import "CCApplicationMain"
local CCDefaultWindowManagerConnection = LuaWrappers.import "CCDefaultWindowManagerConnection"
local CCViewController = LuaWrappers.import "CCViewController"

local ViewController = LuaWrappers.class("ViewController", CCViewController, {
    viewDidLoad = function(self)
        CCViewController.prototype.viewDidLoad(self)
        -- Add views to the view controller here.
        -- local myView = LuaWrappers.new(CCLabel, {x = 1, y = 1}, "Hello World!")
        -- self.view:addSubview(myView)
    end
})

local AppDelegate = LuaWrappers.class("AppDelegate", nil, {
    applicationWindowManagerConnection = function(self, app)
        return CCDefaultWindowManagerConnection(nil, app)
    end
})

CCApplicationMain(nil, ViewController, LuaWrappers.new(AppDelegate))
```

Read on to learn what each of these parts does.

## Anatomy of an App
CCKit2 follows the model-view-controller (MVC) paradigm for organization. This refers to the three categories of core types used in CCKit2:
- Model: Refers to the data for the application, often stored in a JSON file or Lua table.
- View: Refers to the visual objects on screen. In CCKit2, these all are types of `CCView`.
- Controller: Refers to an object which takes information from the model, relays it to the views for display, and takes actions back from views to store in the model. This is the main part of an app, and is an extension of the `CCViewController` class.

Developers who have used Apple's frameworks for macOS and iOS (AppKit/Cocoa and UIKit, respectively) will recognize the feel of CCKit2, which is heavily inspired by these libraries' API design.

### Views
Views are the core elements in a UI. CCKit2 provides many different view types - some display information, some take input from a user, and some act as a container for other views. All views inherit from the `CCView` base class, which can also be instantiated by itself like any other view type.

Views are created by constructing the class for that specific view type, usually receiving a frame or position in the process, along with other required arguments:

```ts
let myView = new CCView({x: 1, y: 1, width: 10, height: 5});
let myLabel = new CCLabel({x: 4, y: 5}, "Label");
```

```lua
local myView = LuaWrappers.new(CCView, {x = 1, y = 1, width = 10, height = 5})
local myLabel = LuaWrappers.new(CCLabel, {x = 4, y = 5}, "Label")
```

Views must be added to the *view hierarchy* to be rendered on screen. This means that views won't automatically appear on screen - they need a parent to go under, which must also have a parent up until the *root view* inside a view controller. Call the `addSubview(view: CCView)` method on any view to add it as a child of that view. For views placed directly onto a window, use the `view` property of the view controller. Inside the `viewDidLoad` method of a view controller (more about that below):

```ts
this.view.addSubview(myView);
this.view.addSubview(myLabel);
```

```lua
self.view:addSubview(myView)
self.view:addSubview(myLabel)
```

Properties of a view may be edited and updated in real-time without requiring the app to request a redraw. For example, simply changing the `text` property of a label will update the text on-screen immediately:

```ts
myLabel.text = "New text"; // will appear immediately
```

```lua
myLabel.text = "New text" -- will appear immediately
```

(Note: Custom view types will need to use getters/setters which call the `setNeedsDisplay` method to make this happen. All built-in views have this functionality implemented.)

### View Controllers
A view controller is a class that is responsible for bringing up and taking down views, and responding to events from views. They are usually rooted inside a window, but view controllers may also be placed inside other view controllers.

View controllers define "scenes" for an application, creating the views inside the window and laying them out properly. The application starts with a single view controller class that defines the contents of the root window, which is passed to the `CCApplicationMain` entrypoint. More view controllers may be presented either by calling the `present` method on a window, which replaces the window's view controller with a new one, or by creating a new window with a new view controller.

View controllers can catch many lifecycle events, such as the root view appearing and disappearing, but by far the most important event is the `viewDidLoad` method. This method is called when the view controller's view is fully loaded, and is an app's chance to add in its own views.

To create a view controller, simply create a class which extends from `CCViewController`:

```ts
class MyViewController extends CCViewController {

}
```

```lua
local MyViewController = LuaWrappers.class("MyViewController", CCViewController, {

})
```

To catch an event, such as `viewDidLoad`, override that method in the view controller, making sure to call the `super` implementation in the process:

```ts
    public viewDidLoad(): void {
        super.viewDidLoad();

    }
```

```lua
    viewDidLoad = function(self)
        CCViewController.prototype.viewDidLoad(self)

    end,
```

### Application and Main Loop
The `CCApplicationMain` function must be called at the end of the main program file to start the application. Prior set-up may be done to e.g. parse command-line arguments, but `CCApplicationMain` must come after. This function takes two parameters: the class which defines the first view controller, and an object which implements the `CCApplicationDelegate` interface.

When `CCApplicationMain` runs, it creates a new instance of the `CCApplication` class. This class is used to handle all runtime event handling and distribution. To allow CCKit2 to run on many different operating systems, `CCApplication` depends on an adapter interface which connects CCKit2 to the system. This interface is called `CCWindowManagerConnection`, and can be implemented in different ways for different systems.

To pick the right `CCWindowManagerConnection` instance, CCKit2 asks the app to select one, through the `CCApplicationDelegate` interface which is passed to `CCApplicationMain`. For most purposes, calling the `CCDefaultWindowManagerConnection` function is the most appropriate, which picks the right one for the current platform, but applications have the option to override this.

`CCApplicationDelegate` can also implement optional methods to receive application-wide events, such as when the app is about to finish launching or exit.

The application delegate class in the skeleton above is appropriate for most applications, but it can be extended to receive those events too.

## License
The core CCKit2 framework and CraftOS window manager are licensed under the GNU General Public License, version 2 or later. The `CCWindowManagerConnection` implementations for Phoenix are licensed under the same license as Phoenix, which is the Phoenix EULA at this time.
