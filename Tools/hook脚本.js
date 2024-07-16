// 日志检测调试
rsvm = {};
rsvm.console_log = console.log;
console.log = function(){}
rsvm.console_info = console.info;
console.info = function(){}

// 获取定时器
rsvm.timeID = {};
rsvm.setInterval = window.setInterval;
window.setInterval = function (callback, delay) {
    let id = rsvm.setInterval.call(window, callback, delay);
    rsvm.timeID[id] = {
        callback: callback,
        delay: delay,
        id: id,
    };
    clearInterval(id);
    return id;
};

rsvm.webkitRequestFileSystem = window.webkitRequestFileSystem;
window.webkitRequestFileSystem = function () {
    debugger
    return rsvm.webkitRequestFileSystem.apply(window, arguments);
};

rsvm.setTimeout = window.setTimeout;
window.setTimeout = function(callback, delay){
    let id = rsvm.setTimeout.call(window, function(){
        debugger
        callback();
    }, delay);
    rsvm.timeID[id] = {
        callback: callback,
        delay: delay,
        id: id,
    };
    return id;
}

rsvm = {}
rsvm.Document_cookie_getter = Object.getOwnPropertyDescriptor(Document.prototype, "cookie").get;
rsvm.Document_cookie_setter = Object.getOwnPropertyDescriptor(Document.prototype, "cookie").set;
Object.defineProperty(Document.prototype, "cookie", {
    get: rsvm.Document_cookie_getter,
    set: function (){
        debugger
        return rsvm.Document_cookie_setter.apply(this, arguments);
    }
});

rsvm = {}
rsvm.XMLHttpRequest_onreadystatechange_getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "onreadystatechange").get;
rsvm.XMLHttpRequest_onreadystatechange_setter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "onreadystatechange").set;
Object.defineProperty(XMLHttpRequest.prototype, "onreadystatechange", {
    get: rsvm.XMLHttpRequest_onreadystatechange_getter,
    set: function (){
        let callback = arguments[0];
        arguments[0] = function(){
            debugger
            callback.apply(this, arguments);
        }
        return rsvm.XMLHttpRequest_onreadystatechange_setter.apply(this, arguments);
    }
});

rsvm = {}
rsvm.HTMLElement_onload_getter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onload").get;
rsvm.HTMLElement_onload_setter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onload").set;
Object.defineProperty(HTMLElement.prototype, "onload", {
    get: rsvm.HTMLElement_onload_getter,
    set: function (){
        let callback = arguments[0];
        arguments[0] = function(){
            debugger
            callback.apply(this, arguments);
        }
        return rsvm.HTMLElement_onload_setter.apply(this, arguments);
    }
});
rsvm.HTMLElement_onerror_getter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onerror").get;
rsvm.HTMLElement_onerror_setter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onerror").set;
Object.defineProperty(HTMLElement.prototype, "onerror", {
    get: rsvm.HTMLElement_onerror_getter,
    set: function (){
        let callback = arguments[0];
        arguments[0] = function(){
            debugger
            callback.apply(this, arguments);
        }
        return rsvm.HTMLElement_onerror_setter.apply(this, arguments);
    }
});

rsvm = {}
rsvm.listener = {}
rsvm.addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function () {
    if (!Object.hasOwn(rsvm.listener, arguments[0])){
        rsvm.listener[arguments[0]] = [];
    }
    rsvm.listener[arguments[0]].push({
        target: this,
        callback: arguments[1],
        options: arguments[2]
    });
    let callback = arguments[1];
    if (this.localName == "input" && arguments[0] == 'click'){debugger}
    arguments[1] = function (e) {
        if (["deviceorientation", "devicemotion"].includes(e.type)){
            debugger
        }
        callback.call(this, e);
    }
    return rsvm.addEventListener.apply(this, arguments);
}

rsvm.Document_createElement = Document.prototype.createElement;
Document.prototype.createElement = function(){
    debugger
    return rsvm.Document_createElement.apply(this, arguments);
}

rsvm.XMLHttpRequest_open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(){
    debugger
    return rsvm.XMLHttpRequest_open.apply(this, arguments);
}

rsvm.HTMLCanvasElement_toDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function(){
    debugger
    return rsvm.HTMLCanvasElement_toDataURL.apply(this, arguments);
}

rsvm.Element_getBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function(){
    debugger
    return rsvm.Element_getBoundingClientRect.apply(this, arguments);
}

rsvm.Element_id_getter = Object.getOwnPropertyDescriptor(Element.prototype, "id").get;
rsvm.Element_id_setter = Object.getOwnPropertyDescriptor(Element.prototype, "id").set;
Object.defineProperty(Element.prototype, "id", {
    get: function (){
        debugger
        return rsvm.Element_id_getter.apply(this, arguments);
    },
    set: rsvm.Element_id_setter
});

rsvm.Navigator_userAgent_getter = Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgent").get;
rsvm.Navigator_userAgent_setter = Object.getOwnPropertyDescriptor(Navigator.prototype, "userAgent").set;
Object.defineProperty(Navigator.prototype, "userAgent", {
    get: function (){
        debugger
        return rsvm.Navigator_userAgent_getter.apply(this, arguments);
    },
    set: rsvm.Navigator_userAgent_setter
});

rsvm.HTMLFormElement_action_getter = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, "action").get;
rsvm.HTMLFormElement_action_setter = Object.getOwnPropertyDescriptor(HTMLFormElement.prototype, "action").set;
Object.defineProperty(HTMLFormElement.prototype, "action", {
    get: function (){
        debugger
        return rsvm.HTMLFormElement_action_getter.apply(this, arguments);
    },
    set: rsvm.HTMLFormElement_action_setter
});









rsvm = {};
rsvm.console_log = console.log;
console.log = function(){}
rsvm.console_info = console.info;
console.info = function(){}

rsvm.timeID = {};
rsvm.setInterval = window.setInterval;
window.setInterval = function (callback, delay) {
    let id = rsvm.setInterval.call(window, callback, delay);
    rsvm.timeID[id] = {
        callback: callback,
        delay: delay,
        id: id,
    };
    clearInterval(id);
    return id;
};

rsvm.webkitRequestFileSystem = window.webkitRequestFileSystem;
window.webkitRequestFileSystem = function () {
    let s1 = arguments[2];
    arguments[2] = function (){
        "success";
        s1.apply(this, arguments);
    }
    let s2 = arguments[3];
    arguments[2] = function (){
        "failed";
        s2.apply(this, arguments);
    }
    let value = rsvm.webkitRequestFileSystem.apply(window, arguments);
    return value;
};

rsvm.setTimeout = window.setTimeout;
window.setTimeout = function(callback, delay){
    let id = rsvm.setTimeout.call(window, function(){
        callback();
    }, delay);
    rsvm.timeID[id] = {
        callback: callback,
        delay: delay,
        id: id,
    };
    return id;
}

rsvm.Document_cookie_getter = Object.getOwnPropertyDescriptor(Document.prototype, "cookie").get;
rsvm.Document_cookie_setter = Object.getOwnPropertyDescriptor(Document.prototype, "cookie").set;
Object.defineProperty(Document.prototype, "cookie", {
    get: rsvm.Document_cookie_getter,
    set: function (){
        let value = rsvm.Document_cookie_setter.apply(this, arguments);
        return value;
    }
});

rsvm.listener = {}
rsvm.addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function () {
    if (!Object.hasOwn(rsvm.listener, arguments[0])){
        rsvm.listener[arguments[0]] = [];
    }
    rsvm.listener[arguments[0]].push({
        target: this,
        callback: arguments[1],
        options: arguments[2]
    });
    let callback = arguments[1];
    if (this.localName == "input" && arguments[0] == 'click'){debugger}
    arguments[1] = function (e) {
        if (["load", "click"].includes(e.type)){
        }
        callback.call(this, e);
    }
    return rsvm.addEventListener.apply(this, arguments);
}

rsvm.HTMLCanvasElement_toDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function(){
    let value = rsvm.HTMLCanvasElement_toDataURL.apply(this, arguments);
    // alert("toDataURL: " + value)
    return value;
}

rsvm.WebGLRenderingContext_getShaderPrecisionFormat = WebGLRenderingContext.prototype.getShaderPrecisionFormat;
WebGLRenderingContext.prototype.getShaderPrecisionFormat = function(){
    let value = rsvm.WebGLRenderingContext_getShaderPrecisionFormat.apply(this, arguments);
    return value;
}

rsvm.XMLHttpRequest_setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function(){
    debugger
    return rsvm.XMLHttpRequest_setRequestHeader.apply(this, arguments);
}

rsvm.XMLHttpRequest_open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(){
    debugger
    return rsvm.XMLHttpRequest_open.apply(this, arguments);
}

rsvm._open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(){
    debugger
    return rsvm._open.apply(this, arguments);
}
rsvm._setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function(){
    debugger
    return rsvm._setRequestHeader.apply(this, arguments);
}