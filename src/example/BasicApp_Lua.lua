local LuaWrappers = require "CCKit2.LuaWrappers"
local CCApplication = LuaWrappers.import "CCKit2.CCApplication"
local CCApplicationDelegate = LuaWrappers.import "CCKit2.CCApplicationDelegate"
local CCApplicationMain = LuaWrappers.import "CCKit2.CCApplicationMain"
local CCButton = LuaWrappers.import "CCKit2.CCButton"
local CCCheckbox = LuaWrappers.import "CCKit2.CCCheckbox"
local CCDefaultWindowManagerConnection = LuaWrappers.import "CCKit2.CCDefaultWindowManagerConnection"
local CCDialog = LuaWrappers.import "CCKit2.CCDialog"
local CCEvent = LuaWrappers.import "CCKit2.CCEvent"
local CCImage = LuaWrappers.import "CCKit2.CCImage"
local CCImageView = LuaWrappers.import "CCKit2.CCImageView"
local CCLabel = LuaWrappers.import "CCKit2.CCLabel"
local CCLayoutConstraint = LuaWrappers.import "CCKit2.CCLayoutConstraint"
local CCProgressIndicator = LuaWrappers.import "CCKit2.CCProgressIndicator"
local CCRadioButton = LuaWrappers.import "CCKit2.CCRadioButton"
local CCScrollView = LuaWrappers.import "CCKit2.CCScrollView"
local CCSlider = LuaWrappers.import "CCKit2.CCSlider"
local CCStackView = LuaWrappers.import "CCKit2.CCStackView"
local CCTabView = LuaWrappers.import "CCKit2.CCTabView"
local CCTextField = LuaWrappers.import "CCKit2.CCTextField"
local CCTextView = LuaWrappers.import "CCKit2.CCTextView"
local CCTypes = LuaWrappers.import "CCKit2.CCTypes"
local CCColor, CCRect = CCTypes.CCColor, CCTypes.CCRect
local CCView = LuaWrappers.import "CCKit2.CCView"
local CCViewController = LuaWrappers.import "CCKit2.CCViewController"
local CCWindowManagerConnection = LuaWrappers.import "CCKit2.CCWindowManagerConnection"

local MyView = LuaWrappers.class("MyView", CCView, {
    ____constructor = function(self, frame)
        CCView.prototype.____constructor(self, frame)
        self.backgroundColor = CCColor.blue
    end,

    mouseDown = function(self, event)
        self.backgroundColor = CCColor.red
    end,

    mouseUp = function(self, event)
        self.backgroundColor = CCColor.blue
    end,

    keyDown = function(self, event)
        self.backgroundColor = CCColor.green
    end,

    keyUp = function(self, event)
        self.backgroundColor = CCColor.blue
    end
})

local ViewController = LuaWrappers.class("ViewController", CCViewController, {
    increment = function(self)
        self.count = self.count + 1
        self.label.text = "Count: " .. self.count
        self.progress.progress = self.count / 100
    end,

    viewDidLoad = function(self)
        CCViewController.prototype.viewDidLoad(self)
        self.view.window.title = "CCKit2 Demo"
        self.view.backgroundColor = CCColor.white
        local tabView = LuaWrappers.new(CCTabView, {x = 1, y = 1, width = self.view.frame.width, height = self.view.frame.height - 1}, {"Basic", "Table", "Stack"})
        self.view:addSubview(tabView)
        local basicView = tabView:contentViewAt(0)
        basicView.backgroundColor = CCColor.white

        self.label = LuaWrappers.new(CCLabel, {x = 1, y = 1}, "Hello World!")
        basicView:addSubview(self.label)
        local button = LuaWrappers.new(CCButton, {x = 1, y = 2}, "Increment", function() self:increment() end)
        basicView:addSubview(button)

        local scrollView = LuaWrappers.new(CCScrollView, {x = 17, y = 1, width = 12, height = 4}, {width = 11, height = 20})
        basicView:addSubview(scrollView)
        local image = CCImage:createFromNFP(
[[ffff0123
eeee4567
dddd89ab
bbbbcdef]])
        local imageView = LuaWrappers.new(CCImageView, {x = 1, y = 1}, image)
        scrollView:addSubview(imageView)
        local textView = LuaWrappers.new(CCTextView, {x = 1, y = 5, width = 11, height = 16})
        textView.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        scrollView:addSubview(textView)
        local checkbox = LuaWrappers.new(CCCheckbox, {x = 2, y = 3}, "Enabled")
        checkbox.checked = true
        checkbox.onStateChange = function(_, state) button.isEnabled = state end
        basicView:addSubview(checkbox)
        self.progress = LuaWrappers.new(CCProgressIndicator, {x = 1, y = 4, width = 11, height = 1}, CCProgressIndicator.Style.ThinBar)
        basicView:addSubview(self.progress)
        local slider = LuaWrappers.new(CCSlider, {x = 1, y = 5, width = 11, height = 1})
        basicView:addSubview(slider)
        local sliderText = LuaWrappers.new(CCLabel, {x = 13, y = 5}, "0.0")
        slider.action = function(_, position)
            sliderText.text = string.format("%.1f", position)
        end
        basicView:addSubview(sliderText)
        local textBox = LuaWrappers.new(CCTextField, {x = 1, y = 6, width = 11, height = 1})
        textBox.placeholderText = "Text..."
        basicView:addSubview(textBox)
        local radioCallback = function(sender) end
        local radioA = LuaWrappers.new(CCRadioButton, {x = 21, y = 5}, "Opt 1")
        radioA.onStateChange = radioCallback
        basicView:addSubview(radioA)
        local radioB = LuaWrappers.new(CCRadioButton, {x = 21, y = 6}, "Opt 2")
        radioB.onStateChange = radioCallback
        basicView:addSubview(radioB)
        local radioC = LuaWrappers.new(CCRadioButton, {x = 21, y = 7}, "Opt 3")
        radioC.onStateChange = radioCallback
        basicView:addSubview(radioC)
        local popupButton = LuaWrappers.new(CCButton, {x = 2, y = 7}, "Dialog", function() CCDialog:messageWithOneButton(self.view.window, "Alert", "This is a test of the dialog box and text view functionality, showing word wrapping.") end)
        basicView:addSubview(popupButton)

        --[=[local v2 = LuaWrappers.new(MyView, {x = 5, y = 5, width = 5, height = 5})
        basicView:addSubview(v2)
        local v3 = LuaWrappers.new(MyView, {x = 5, y = 5, width = 5, height = 5})
        basicView:addSubview(v3)
        local resizingView = LuaWrappers.new(CCView, {x = 0, y = 0, width = 0, height = 0})
        resizingView.backgroundColor = CCColor.yellow
        basicView:addSubview(resizingView)
        CCView:addConstraintsByCode([[
            v2.Top = button.Bottom + 1
            v2.Bottom = rootView.Bottom - 1
            v2.Left = rootView.Left + 1
            v2.Width = v3.Width * 2

            v3.Top = button.Bottom + 1
            v3.Bottom = rootView.Bottom - 1
            v3.Left = v2.Right + 1
            v3.Right = rootView.Right - 1

            resizingView.Top = label.Top
            resizingView.Bottom = label.Bottom
            resizingView.Left = label.Right + 1
            resizingView.Right = rootView.Right - 1
        ]], {
            v2 = v2,
            v3 = v3,
            button = button,
            rootView = self.view,
            resizingView = resizingView,
            label = self.label,
        })]=]

        local stackContainer = tabView:contentViewAt(2)
        local stackView = LuaWrappers.new(CCStackView, {x = 1, y = 1, width = stackContainer.frame.width, height = stackContainer.frame.height})
        stackContainer:addSubview(stackView)
        stackView:addConstraints({
            LuaWrappers.new(CCLayoutConstraint, stackView, CCLayoutConstraint.Attribute.Top, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Top, 1, 0),
            LuaWrappers.new(CCLayoutConstraint, stackView, CCLayoutConstraint.Attribute.Bottom, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Bottom, 1, 0),
            LuaWrappers.new(CCLayoutConstraint, stackView, CCLayoutConstraint.Attribute.Left, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Left, 1, 0),
            LuaWrappers.new(CCLayoutConstraint, stackView, CCLayoutConstraint.Attribute.Right, CCLayoutConstraint.Relation.Equal, stackContainer, CCLayoutConstraint.Attribute.Right, 1, 0)
        })
        stackView.spacing = 1
        stackView.arrangedHorizontally = true
        stackView:addSubview(LuaWrappers.new(MyView, {x = 1, y = 1, width = 10, height = 10}), 2)
        stackView:addSubview(LuaWrappers.new(MyView, {x = 1, y = 1, width = 10, height = 10}), 1)
        stackView:addSubview(LuaWrappers.new(MyView, {x = 1, y = 1, width = 10, height = 10}), 3)

        local quit = LuaWrappers.new(CCButton, {x = 1, y = 1}, "Quit", function() self.view.window:close() end)
        self.view:addSubview(quit)
        CCView:addConstraintsByCode([[
            quit.CenterX = superview.CenterX
            quit.Bottom = superview.Bottom
            quit.Width = 6
            quit.Height = 1

            tabView.Top = superview.Top
            tabView.Bottom = superview.Bottom - 1
            tabView.Left = superview.Left
            tabView.Right = superview.Right
        ]], {quit = quit, superview = self.view, tabView = tabView})
    end
})

local AppDelegate = LuaWrappers.class("AppDelegate", nil, {
    applicationWindowManagerConnection = function(self, app)
        return CCDefaultWindowManagerConnection(nil, app)
    end
})

CCApplicationMain(nil, ViewController, LuaWrappers.new(AppDelegate))
