
// 第一个参数：需要自吐的原型对象
// 第二个参数：原型链中存在该原型的实例对象
!function (prototype, target) {
    function create(obj) {
        let con = "";
        if (obj.__proto__ == undefined || obj.__proto__ == Object.prototype) {
            con += "{"
            for (const key in obj) {
                con += `${key}: ${valueType(obj[key])}, `
            }
            con += '}';
        } else if (obj.__proto__ == [].__proto__) {
            con += "["
            for (const value of obj) {
                con += `${valueType(value)}, `
            }
            con += ']';
        }
        return con;
    }
    function valueType(value) {
        let valueCode = "";
        if (null === value || undefined === value || "number" === typeof value || "boolean" === typeof value) {
            valueCode += value;
        } else if ('string' === typeof value) {
            valueCode += `\"${value}\"`;
        } else if ('function' === typeof value) {
            valueCode += `rsvm.RsCreateAction("${value.name}", ${value.length}, function ${value.name}() {
            })`;
        } else {
            if (value.__proto__ !== undefined && Object.hasOwn(value.__proto__, Symbol.toStringTag)) {
                valueCode += `rsvm.prototype.${value[Symbol.toStringTag]}.new()`;
            } else {
                valueCode += create(value);
            }

        }
        return valueCode;
    }

    let code = "!function () {\r\n", controll = "",
        memory = "", getter = "", setter = "", action = "",
        constructorCode = "", des, hasConstructor = false,
        flagName = "", setPrototype = "", enbleNew = true;

    // 判断是否存在构造函数，并根据情况响应处理
    if (Object.hasOwn(prototype, "constructor")) {
        hasConstructor = true;
        des = Object.getOwnPropertyDescriptor(window, prototype[Symbol.toStringTag]);
        try {
            new prototype['constructor']("");
        } catch {
            enbleNew = false;
        }
        code += `Object.defineProperty(window, "${prototype[Symbol.toStringTag]}", {value: rsvm.RsCreateConstructor("${prototype[Symbol.toStringTag]}"${enbleNew ? `, ${prototype['constructor'].length}, function ${prototype[Symbol.toStringTag]}(){
            return rsvm.prototype.${prototype[Symbol.toStringTag]}.new.apply(null, arguments);
        })` : ")"}, writable: ${des["writable"]}, enumerable: ${des["enumerable"]}, configurable: ${des["configurable"]}
        });`;

        des = Object.getOwnPropertyDescriptors(prototype["constructor"]);
        constructorCode = `\r\n\r\nObject.defineProperties(${prototype[Symbol.toStringTag]}, {\r\n`;
        for (const key in des) {
            if (['arguments', 'caller', 'name', 'length'].includes(key)) { continue; }
            if ('prototype' === key) {
                constructorCode += `prototype: { value: ${prototype[Symbol.toStringTag]}.prototype, writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]} },\r\n`
            } else {
                constructorCode += `${key}: { value: ${valueType(des[key]["value"])}, writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]} },\r\n`
            }
        }
        constructorCode += '});';
        flagName = hasConstructor ? prototype[Symbol.toStringTag] + ".prototype" : prototype[Symbol.toStringTag];

        // 处理构造函数的原型
        if (!(prototype["constructor"].__proto__ === Object.__proto__)) {
            var a = prototype["constructor"].__proto__;
            setPrototype += `\r\nObject.setPrototypeOf(${prototype["constructor"].name}, ${a.name});`
        }
    } else {
        code += `let ${prototype[Symbol.toStringTag]} = {};`
        flagName = prototype[Symbol.toStringTag];
    }

    // 处理原型对象的原型
    if (!(prototype.__proto__ === Object.prototype)) {
        var a = prototype.__proto__;
        var flagName2 = Object.hasOwn(a, "constructor") ? a[Symbol.toStringTag] + ".prototype" : a[Symbol.toStringTag];
        setPrototype += `\r\nObject.setPrototypeOf(${flagName}, ${flagName2});`
    }

    // 处理原型对象的相关属性
    des = Object.getOwnPropertyDescriptors(prototype);
    controll += `\r\n\r\nObject.defineProperties(${flagName}, {\r\n`;
    for (const key in des) {
        // if (ke) { continue; }
        controll += `${key}: {`;
        if ('constructor' === key) {
            controll += `writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]}, value: ${prototype[Symbol.toStringTag]}`
        } else {
            for (const property in des[key]) {
                if ('value' === property) {
                    controll += `value: ${valueType(target[key])},`
                } else if ('get' === property) {
                    memory += `\r\n${key}: ${valueType(target[key])},`
                    getter += `\r\n${key}: rsvm.RsCreateGetter("${key}", function ${key}() {
                        return rsvm.get(this, "${key}");
                    }),`;
                    controll += `${property}: rsvm.RsCreateGetter("${key}", function ${key}() {
                        return rsvm.get(this, "${key}");
                    }), `;
                } else if ('set' === property) {
                    if (des[key][property] === undefined) {
                        controll += `${property}: undefined, `;
                    } else {
                        setter += `\r\n${key}: rsvm.RsCreateSetter("${key}", function ${key}() {
                            rsvm.set(this, "${key}", arguments[0]);
                        }),`
                        controll += `${property}: rsvm.RsCreateSetter("${key}", function ${key}() {
                            rsvm.set(this, "${key}", arguments[0]);
                        }), `;
                    }
                } else {
                    controll += `${property}: ${des[key][property]},`;
                }
            }
        }
        controll += `},\r\n`
    }
    var ary = Object.getOwnPropertySymbols(prototype);
    for (const key of ary) {
        controll += `[${key.toString().replaceAll(/Symbol\(|\)/g, "")}]: {`;
        des = Object.getOwnPropertyDescriptor(prototype, key)
        for (const property in des) {
            if ('value' === property) {
                controll += `value: ${valueType(des[property])},`
            } else {
                controll += `${property}: ${des[property]},`;
            }
        }
        controll += "},\r\n"
    }
    controll += "});"

    if (memory) { memory += '\r\n'; }
    if (getter) { getter += '\r\n'; }
    if (setter) { setter += '\r\n'; }
    if (action) { action += '\r\n'; }

    code += `\r\n\r\nrsvm.prototype.${prototype[Symbol.toStringTag]} = {
        memory: {${memory}},
        malloc(target) {
            rsvm.mallocBaseMemory("${prototype[Symbol.toStringTag]}", target);
        },
        new() {
            let obj = rsvm.RsCreate(${flagName});
            return obj;
        },
    };` + constructorCode + controll;

    code += (setPrototype ? setPrototype : "") + "\r\n}();";
    console.log(code);
}(Event.prototype, new Event(""));

// 全局对象属性自吐
!function () {
    let memory = '', properdef = '';

    for (const property of Object.keys(window)) {
        let descript = Object.getOwnPropertyDescriptor(window, property);
        if ('value' in descript) {
            if (typeof (descript.value) === 'function') {
                properdef += `\r\n${descript.value.name}: {value: rsvm.RsCreateAction("${descript.value.name}", ${descript.value.length}, function ${descript.value.name}() {
                    if (rsvm.debugger) { debugger }     // 调试测试
                }), writable: ${descript.writable}, enumerable: ${descript.enumerable}, configurable: ${descript.configurable} },`;
            }
        } else if ('get' in descript || 'set' in descript) {
            let value = null;
            if (window[property] === null) {
                value = "" + null;
            } else if (typeof (window[property]) === 'string') {
                value = `"${window[property]}"`;
            } else if (['number', 'undefined'].includes(typeof (window[property]))) {
                value = "" + window[property];
            } else {
                value = `rsvm.prototype.${window[property][Symbol.toStringTag]}.new()`;
            }
            memory += `\r\n${property}: ${value},`;
            if (descript.set !== undefined) {
                properdef += `\r\n${property}: {get: rsvm.RsCreateGetter("get ${property}", function ${property}() {
                    if (rsvm.debugger) { debugger }     // 调试测试
                    return rsvm.get(this, "${property}");
                }), set: rsvm.RsCreateSetter("set ${property}", function ${property}() {
                    if (rsvm.debugger) { debugger }     // 调试测试
                    rsvm.set(this, "${property}", arguments[0]);
                }), enumerable: ${descript.enumerable}, configurable: ${descript.configurable} },`;
            } else {
                properdef += `\r\n${property}: {get: rsvm.RsCreateGetter("get ${property}", function ${property}() {
                    if (rsvm.debugger) { debugger }     // 调试测试
                    return rsvm.get(this, "${property}");
                }), set: undefined, enumerable: ${descript.enumerable}, configurable: ${descript.configurable} },`;
            }
        }
    }

    let code = `!function () {
        rsvm.prototype.window = {
            memory:{
                ${memory}
            },
        };

        Object.defineProperties(window, {
            ${properdef}
        });
    }();`;
    console.log(code);
}();

// akamai span 标签指纹
!function () {
    let code = "";
    let infoAry = ["adihausDIN","Monospace","Wingdings 2","ITC Bodoni 72 Bold","Menlo","Gill Sans MT","Lucida Sans","Bodoni 72","Serif","Shree Devanagari 714","Microsoft Tai Le","Nimbus Roman No 9 L","Candara","Press Start 2P","Waseem"];
    let span = document.createElement("span");
    span.innerHTML = 'mmmmmmmmlli';
    span.style.fontSize = "192px";
    for (const key of infoAry) {
        span.style.fontFamily = key;
        document.body.appendChild(span);
        code += `case "${key}":
        return ${span.offsetHeight};
        `;
        document.body.removeChild(span);
    }
    console.log(code);
}();

// rs6_yaojian span 标签指纹
!function () {
    let code = "";
    let infoAry = ["mmllii","SimHei","SimSun","NSimSun","FangSong","KaiTi","FangSongGB2312","KaiTiGB2312","Microsoft YaHei","Hiragino Sans GB","STHeiti Light","STHeiti","STKaiti","STSong","STFangsong","LiSu","YouYuan","STXihei","STZhongsong","FZShuTi","FZYaoti","STCaiyun","STHupo","STLiti","STXingkai","STXinwei","DFPhelvetica","Tibetan Machine Uni","Cooljazz","Verdana","Helvetica Neue LT Pro 35 Thin","tahoma","LG Smart_H test Regular","DINPro-light","Helvetica LT 43 Light Extended","HelveM_India","SECRobotoLight Bold","OR Mohanty Unicode Regular","Droid Sans Thai","Kannada Sangam MN","DDC Uchen","clock2016_v1.1","SamsungKannadaRegular","MI LANTING Bold","SamsungSansNum3L Light","verdana","HelveticaNeueThin","SECFallback","SamsungEmoji","Telugu Sangam MN","Carrois Gothic SC","Flyme Light Roboto Light","SoMA-Digit Light","SoMC Sans Regular","HYXiYuanJ","sst","samsung-sans-num4T","gm_mengmeng","Lohit Kannada","times new roman","samsung-sans-num4L","serif-monospace","SamsungSansNum-3T Thin","ColorOSUI-XThin","Droid Naskh Shift Alt","SamsungTeluguRegular","Bengali OTS","MI LanTing_GB Outside YS","FZMiaoWu_GB18030","helve-neue-regular","SST Medium","Courier New","Khmer Mondulkiri Bold","Helvetica LT 23 Ultra Light Extended","Helvetica LT 25 Ultra Light","Roboto Medium","Droid Sans Bold","goudy","sans-serif-condensed-light","SFinder","noto-sans-cjk-medium","miui","MRocky PRC Bold","AndroidClock Regular","SamsungSansNum-4L Light","sans-serif-thin","AaPangYaer","casual","BN MohantyOT Bold","x-sst","NotoSansMyanmarZawgyi","Helvetica LT 33 Thin Extended","AshleyScriptMT Alt","Noto Sans Devanagari UI","Roboto Condensed Bold","Roboto Medium Italic","miuiex","Noto Sans Gurmukhi UI","SST Vietnamese Light","LG_Oriya","hycoffee","x-sst-ultralight","DFHeiAW7-A","FZZWXBTOT_Unicode","Devanagari Sangam MN Bold","sans-serif-monospace","Padauk Book Bold","LG-FZYingBiKaiShu-S15-V2.2","LG-FZYingBiKaiShu-S15-V2.3","HelveticaNeueLT Pro 35 Th","Microsoft Himalaya","SamsungSansFallback","SST Medium Italic","AndroidEmoji","SamsungSansNum-3R","ITC Stone Serif","sans-serif-smallcaps","x-sst-medium","LG_Sinhalese","Roboto Thin Italic","century-gothic","Clockopia","Luminous_Sans","Floridian Script Alt","Noto Sans Gurmukhi Bold","LTHYSZK Bold","GS_Thai","SamsungNeoNum_3T_2","Arabic","hans-sans-normal","Lohit Telugu","HYQiHei-50S Light","Lindsey for Samsung","AR Crystalhei DB","Samsung Sans Medium","samsung-sans-num45","hans-sans-bold","Luminous_Script","SST Condensed","SamsungDevanagariRegular","Anjal Malayalam MN","SamsungThai(test)","FZLanTingHei-M-GB18030","Hebrew OTS","GS45_Arab(AndroidOS)","Samsung Sans Light","Choco cooky","helve-neue-thin","PN MohantyOT Medium","LG-FZKaTong-M19-V2.4","Droid Serif","SamsungSinhalaRegular","helvetica","LG-FZKaTong-M19-V2.2","Noto Sans Devanagari UI Bold","SST Light","DFPEmoji","weatherfontnew Regular","RobotoNum3R","DINPro-medium","Samsung Sans Num55","SST Heavy Italic","LGlock4 Regular_0805","Georgia","noto-sans-cjk","Telugu Sangam MN Bold","MIUI EX Normal","HYQiHei-75S Bold","NotoSansMyanmarZawgyi Bold","yunospro-black","helve-neue-normal","Luminous_Serif","TM MohantyOT Normal","SamsungSansNum-3Lv Light","Samsung Sans Num45","SmartGothic Medium","georgia","casual-font-type","Samsung Sans Bold","small-capitals","MFinance PRC Bold","FZLanTingHei_GB18030","SamsungArmenian","Roboto Bold","century-gothic-bold","x-sst-heavy","SST Light Italic","TharLon","x-sst-light","Dinbol Regular","SamsungBengaliRegular","KN MohantyOTSmall Medium","hypure","SamsungTamilRegular","Malayalam Sangam MN","Noto Sans Kannada UI","helve-neue","Helvetica LT 55 Roman","Noto Sans Kannada Bold","Sanpya","SamsungPunjabiRegular","samsung-sans-num4Lv","LG_Kannada","Samsung Sans Regular","Zawgyi-One","Droid Serif Bold Italic","FZKATJW","courier new","SamsungEmojiRegular","MIUI EX Bold","Android Emoji","Noto Naskh Arabic UI","LCD Com","Futura Medium BT","Vivo-extract","Bangla Sangam MN Bold","hans-sans-regular","SNum-3R","SNum-3T","hans-sans","SST Ultra Light","Roboto Regular","Roboto Light","Hanuman","newlggothic","DFHeiAW5-A","hans-sans-light","Plate Gothic","SNum-3L","Helvetica LT 45 Light","Myanmar Sangam Zawgyi Bold","lg-sans-serif-light","MIUI EX Light","Roboto Thin","SoMA Bold","Padauk","Samsung Sans","Spacious_SmallCap","sans-serif","DV MohantyOT Medium","Stable_Slap","monaco","Flyme-Light","fzzys-dospy","ScreenSans","clock2016","Roboto Condensed Bold Italic","Arial","KN Mohanty Medium","MotoyaLMaru W3 mono","Handset Condensed","Roboto Italic","HTC Hand","SST Ultra Light Italic","SST Vietnamese Roman","Noto Naskh Arabic UI Bold","chnfzxh-medium","SNumCond-3T","century-gothic-regular","default_roboto-light","Noto Sans Myanmar","Myanmar Sangam MN","Apple Color Emoji","weatherfontReg","SamsungMalayalamRegular","arial","Droid Serif Bold","CPo3 PRC Bold","MI LANTING","SamsungKorean-Regular","test45 Regular","spirit_time","Devanagari Sangam MN","ScreenSerif","Roboto","cursive-font-type","STHeiti_vivo","chnfzxh","Samsung ClockFont 3A","Roboto Condensed Regular","samsung-neo-num3R","GJ MohantyOT Medium","Chulho Neue Lock","roboto-num3L","helve-neue-ultraLightextended","SamsungOriyaRegular","SamsungSansNum-4Lv Light","MYingHei_18030_C2-Bold","DFPShaoNvW5-GB","Roboto Black","helve-neue-ultralight","gm_xihei","LGlock4 Light_0805","Gujarati Sangam MN","Malayalam Sangam MN Bold","roboto-num3R","STXihei_vivo","FZZhunYuan_GB18030","noto-sans-cjk-light","coloros","Noto Sans Gurmukhi","Noto Sans Symbols","Roboto Light Italic","Lohit Tamil","cursive","default_roboto","BhashitaComplexSans Bold","LG_Number_Roboto Thin","monospaced-without-serifs","Helvetica LT 35 Thin","samsung-sans-num3LV","DINPro","Jomolhari","sans-serif-light","helve-neue-black","Lohit Bengali","Myanmar Sangam Zawgyi","Droid Serif Italic","Roboto Bold Italic","NanumGothic","Sony Mobile UD Gothic Regular","Georgia Bold Italic","samsung-sans-num3Lv","yunos-thin","samsung-neo-num3T-cond","Noto Sans Myanmar UI Bold","lgserif","FZYouHei-R-GB18030","Lohit Punjabi","baskerville","samsung-sans-num4Tv","samsung-sans-thin","LG Emoji","AnjaliNewLipi","SamsungSansNum-4T Thin","SamsungKorean-Bold","miuiex-light","Noto Sans Kannada","Roboto Normal Italic","Georgia Italic","sans-serif-medium","Smart Zawgyi","Roboto Condensed Italic","Noto Sans Kannada UI Bold","DFP Sc Sans Heue30_103","LG_Number_Roboto Bold","Padauk Book","x-sst-condensed","Sunshine-Uchen","Roboto Black Italic","Ringo Color Emoji","Devanagari OTS","Smart Zawgyi Pro","FZLanTingHei-M-GBK","AndroidClock-Large Regular","proportionally-spaced-without-serifs","Cutive Mono","times","LG Smart_H test Bold","DINPro-Light","sans-serif-black","Lohit Devanagari","proportionally-spaced-with-serifs","samsung-sans-num3L","MYoung PRC Medium","DFGothicPW5-BIG5HK-SONY","hans-sans-medium","SST Heavy","LG-FZZhunYuan-M02-V2.2","MyanmarUNew Regular","Noto Naskh Arabic Bold","SamsungGujarathiRegular","fantasy","helve-neue-light","Helvetica Neue OTS Bold","noto-sans-cjk-bold","samsung-sans-num3R","Lindsey Samsung","samsung-sans-num3T","ScreenSerifMono","ETrump Myanmar_ZW","helve-neue-thinextended","Noto Naskh Arabic","LG_Gujarati","Smart_Monospaced","Tamil Sangam MN","LG Emoji NonAME","Roboto Condensed Light Italic","gm_jingkai","FZLanTingKanHei_GB18030","lgtravel","palatino","Georgia Bold","Droid Sans","LG_Punjabi","SmartGothic Bold","Samsung Sans Thin","SST Condensed Bold","Comics_Narrow","courier","Oriya Sangam MN","helve-neue-lightextended","FZLanTingHei-R-GB18030","AR CrystalheiHKSCS DB","serif","RTWSYueRoudGoG0v1-Regular","MiaoWu_prev","FZY1K","LG_Number_Roboto Regular","AndroidClock","SoMA Regular","HYQiHei-40S Lightx","lg-sans-serif","Dancing Script Bold","default","sec-roboto-light","ColorOSUI-Regular","test Regular","Tamil Sangam MN Bold","FZYingBiXingShu-S16","RobotoNum3L Light","monospaced-with-serifs","samsung-sans-num35","Cool jazz","SamsungNeoNum-3L","STXingkai","ScreenSansMono","DFPWaWaW5-GB","SamsungSansNum-3L Light","Bangla Sangam MN","Gurmukhi Sangam MN","SECRobotoLight","hyfonxrain","MYingHeiGB18030C-Bold","samsung-sans-light","Helvetica LT 65 Medium","Droid Sans Fallback","Roboto Test1 Bold","Noto Sans Myanmar Bold","sans-serif-condensed-custom","SamsungNeoNum-3T","Samsung Sans Num35","monospace","TL Mohanty Medium","helve-neue-medium","LTHYSZK","Roboto Condensed custome Bold","Myanmar3","Droid Sans Devanagari","ShaoNv_prev","samsung-neo-num3L","FZLanTingHei-EL-GBK","yunos","samsung-neo-num3T","Times New Roman","helve-neue-bold","noto-sans-cjk-regular","Noto Sans Gurmukhi UI Bold","DINPro-black","FZLanTingHei-EL-GB18030","SST Vietnamese Medium","Roboto Condensed Light","SST Vietnamese Bold","AR DJ-KK","Droid Sans SEMC","Noto Sans Myanmar UI","Coming Soon","MYuppy PRC Medium","Rosemary","Lohit Gujarati","Roboto Condensed custom Bold","FZLanTingHeiS-R-GB","Helvetica Neue OTS","Kaiti_prev","Roboto-BigClock","FZYBKSJW","Handset Condensed Bold","SamsungGeorgian","Dancing Script","sans-serif-condensed","hans-sans-thin","SamsungSansNum-4Tv Thin","Lohit Odia","BhashitaComplexSans"];
    let span = document.createElement("span");
    span.innerHTML = 'mmmmmmmmmmmlliii';
    span.style.fontSize = "114px";
    document.body.appendChild(span);
    for (const key of infoAry) {
        span.style.fontFamily = key;
        code += `case "${key}":
        return ${span.offsetHeight};
        `;
    }
    console.log(code);
}();
!function () {
    let code = "";
    let infoAry = ["mmllii","SimHei","SimSun","NSimSun","FangSong","KaiTi","FangSongGB2312","KaiTiGB2312","Microsoft YaHei","Hiragino Sans GB","STHeiti Light","STHeiti","STKaiti","STSong","STFangsong","LiSu","YouYuan","STXihei","STZhongsong","FZShuTi","FZYaoti","STCaiyun","STHupo","STLiti","STXingkai","STXinwei","DFPhelvetica","Tibetan Machine Uni","Cooljazz","Verdana","Helvetica Neue LT Pro 35 Thin","tahoma","LG Smart_H test Regular","DINPro-light","Helvetica LT 43 Light Extended","HelveM_India","SECRobotoLight Bold","OR Mohanty Unicode Regular","Droid Sans Thai","Kannada Sangam MN","DDC Uchen","clock2016_v1.1","SamsungKannadaRegular","MI LANTING Bold","SamsungSansNum3L Light","verdana","HelveticaNeueThin","SECFallback","SamsungEmoji","Telugu Sangam MN","Carrois Gothic SC","Flyme Light Roboto Light","SoMA-Digit Light","SoMC Sans Regular","HYXiYuanJ","sst","samsung-sans-num4T","gm_mengmeng","Lohit Kannada","times new roman","samsung-sans-num4L","serif-monospace","SamsungSansNum-3T Thin","ColorOSUI-XThin","Droid Naskh Shift Alt","SamsungTeluguRegular","Bengali OTS","MI LanTing_GB Outside YS","FZMiaoWu_GB18030","helve-neue-regular","SST Medium","Courier New","Khmer Mondulkiri Bold","Helvetica LT 23 Ultra Light Extended","Helvetica LT 25 Ultra Light","Roboto Medium","Droid Sans Bold","goudy","sans-serif-condensed-light","SFinder","noto-sans-cjk-medium","miui","MRocky PRC Bold","AndroidClock Regular","SamsungSansNum-4L Light","sans-serif-thin","AaPangYaer","casual","BN MohantyOT Bold","x-sst","NotoSansMyanmarZawgyi","Helvetica LT 33 Thin Extended","AshleyScriptMT Alt","Noto Sans Devanagari UI","Roboto Condensed Bold","Roboto Medium Italic","miuiex","Noto Sans Gurmukhi UI","SST Vietnamese Light","LG_Oriya","hycoffee","x-sst-ultralight","DFHeiAW7-A","FZZWXBTOT_Unicode","Devanagari Sangam MN Bold","sans-serif-monospace","Padauk Book Bold","LG-FZYingBiKaiShu-S15-V2.2","LG-FZYingBiKaiShu-S15-V2.3","HelveticaNeueLT Pro 35 Th","Microsoft Himalaya","SamsungSansFallback","SST Medium Italic","AndroidEmoji","SamsungSansNum-3R","ITC Stone Serif","sans-serif-smallcaps","x-sst-medium","LG_Sinhalese","Roboto Thin Italic","century-gothic","Clockopia","Luminous_Sans","Floridian Script Alt","Noto Sans Gurmukhi Bold","LTHYSZK Bold","GS_Thai","SamsungNeoNum_3T_2","Arabic","hans-sans-normal","Lohit Telugu","HYQiHei-50S Light","Lindsey for Samsung","AR Crystalhei DB","Samsung Sans Medium","samsung-sans-num45","hans-sans-bold","Luminous_Script","SST Condensed","SamsungDevanagariRegular","Anjal Malayalam MN","SamsungThai(test)","FZLanTingHei-M-GB18030","Hebrew OTS","GS45_Arab(AndroidOS)","Samsung Sans Light","Choco cooky","helve-neue-thin","PN MohantyOT Medium","LG-FZKaTong-M19-V2.4","Droid Serif","SamsungSinhalaRegular","helvetica","LG-FZKaTong-M19-V2.2","Noto Sans Devanagari UI Bold","SST Light","DFPEmoji","weatherfontnew Regular","RobotoNum3R","DINPro-medium","Samsung Sans Num55","SST Heavy Italic","LGlock4 Regular_0805","Georgia","noto-sans-cjk","Telugu Sangam MN Bold","MIUI EX Normal","HYQiHei-75S Bold","NotoSansMyanmarZawgyi Bold","yunospro-black","helve-neue-normal","Luminous_Serif","TM MohantyOT Normal","SamsungSansNum-3Lv Light","Samsung Sans Num45","SmartGothic Medium","georgia","casual-font-type","Samsung Sans Bold","small-capitals","MFinance PRC Bold","FZLanTingHei_GB18030","SamsungArmenian","Roboto Bold","century-gothic-bold","x-sst-heavy","SST Light Italic","TharLon","x-sst-light","Dinbol Regular","SamsungBengaliRegular","KN MohantyOTSmall Medium","hypure","SamsungTamilRegular","Malayalam Sangam MN","Noto Sans Kannada UI","helve-neue","Helvetica LT 55 Roman","Noto Sans Kannada Bold","Sanpya","SamsungPunjabiRegular","samsung-sans-num4Lv","LG_Kannada","Samsung Sans Regular","Zawgyi-One","Droid Serif Bold Italic","FZKATJW","courier new","SamsungEmojiRegular","MIUI EX Bold","Android Emoji","Noto Naskh Arabic UI","LCD Com","Futura Medium BT","Vivo-extract","Bangla Sangam MN Bold","hans-sans-regular","SNum-3R","SNum-3T","hans-sans","SST Ultra Light","Roboto Regular","Roboto Light","Hanuman","newlggothic","DFHeiAW5-A","hans-sans-light","Plate Gothic","SNum-3L","Helvetica LT 45 Light","Myanmar Sangam Zawgyi Bold","lg-sans-serif-light","MIUI EX Light","Roboto Thin","SoMA Bold","Padauk","Samsung Sans","Spacious_SmallCap","sans-serif","DV MohantyOT Medium","Stable_Slap","monaco","Flyme-Light","fzzys-dospy","ScreenSans","clock2016","Roboto Condensed Bold Italic","Arial","KN Mohanty Medium","MotoyaLMaru W3 mono","Handset Condensed","Roboto Italic","HTC Hand","SST Ultra Light Italic","SST Vietnamese Roman","Noto Naskh Arabic UI Bold","chnfzxh-medium","SNumCond-3T","century-gothic-regular","default_roboto-light","Noto Sans Myanmar","Myanmar Sangam MN","Apple Color Emoji","weatherfontReg","SamsungMalayalamRegular","arial","Droid Serif Bold","CPo3 PRC Bold","MI LANTING","SamsungKorean-Regular","test45 Regular","spirit_time","Devanagari Sangam MN","ScreenSerif","Roboto","cursive-font-type","STHeiti_vivo","chnfzxh","Samsung ClockFont 3A","Roboto Condensed Regular","samsung-neo-num3R","GJ MohantyOT Medium","Chulho Neue Lock","roboto-num3L","helve-neue-ultraLightextended","SamsungOriyaRegular","SamsungSansNum-4Lv Light","MYingHei_18030_C2-Bold","DFPShaoNvW5-GB","Roboto Black","helve-neue-ultralight","gm_xihei","LGlock4 Light_0805","Gujarati Sangam MN","Malayalam Sangam MN Bold","roboto-num3R","STXihei_vivo","FZZhunYuan_GB18030","noto-sans-cjk-light","coloros","Noto Sans Gurmukhi","Noto Sans Symbols","Roboto Light Italic","Lohit Tamil","cursive","default_roboto","BhashitaComplexSans Bold","LG_Number_Roboto Thin","monospaced-without-serifs","Helvetica LT 35 Thin","samsung-sans-num3LV","DINPro","Jomolhari","sans-serif-light","helve-neue-black","Lohit Bengali","Myanmar Sangam Zawgyi","Droid Serif Italic","Roboto Bold Italic","NanumGothic","Sony Mobile UD Gothic Regular","Georgia Bold Italic","samsung-sans-num3Lv","yunos-thin","samsung-neo-num3T-cond","Noto Sans Myanmar UI Bold","lgserif","FZYouHei-R-GB18030","Lohit Punjabi","baskerville","samsung-sans-num4Tv","samsung-sans-thin","LG Emoji","AnjaliNewLipi","SamsungSansNum-4T Thin","SamsungKorean-Bold","miuiex-light","Noto Sans Kannada","Roboto Normal Italic","Georgia Italic","sans-serif-medium","Smart Zawgyi","Roboto Condensed Italic","Noto Sans Kannada UI Bold","DFP Sc Sans Heue30_103","LG_Number_Roboto Bold","Padauk Book","x-sst-condensed","Sunshine-Uchen","Roboto Black Italic","Ringo Color Emoji","Devanagari OTS","Smart Zawgyi Pro","FZLanTingHei-M-GBK","AndroidClock-Large Regular","proportionally-spaced-without-serifs","Cutive Mono","times","LG Smart_H test Bold","DINPro-Light","sans-serif-black","Lohit Devanagari","proportionally-spaced-with-serifs","samsung-sans-num3L","MYoung PRC Medium","DFGothicPW5-BIG5HK-SONY","hans-sans-medium","SST Heavy","LG-FZZhunYuan-M02-V2.2","MyanmarUNew Regular","Noto Naskh Arabic Bold","SamsungGujarathiRegular","fantasy","helve-neue-light","Helvetica Neue OTS Bold","noto-sans-cjk-bold","samsung-sans-num3R","Lindsey Samsung","samsung-sans-num3T","ScreenSerifMono","ETrump Myanmar_ZW","helve-neue-thinextended","Noto Naskh Arabic","LG_Gujarati","Smart_Monospaced","Tamil Sangam MN","LG Emoji NonAME","Roboto Condensed Light Italic","gm_jingkai","FZLanTingKanHei_GB18030","lgtravel","palatino","Georgia Bold","Droid Sans","LG_Punjabi","SmartGothic Bold","Samsung Sans Thin","SST Condensed Bold","Comics_Narrow","courier","Oriya Sangam MN","helve-neue-lightextended","FZLanTingHei-R-GB18030","AR CrystalheiHKSCS DB","serif","RTWSYueRoudGoG0v1-Regular","MiaoWu_prev","FZY1K","LG_Number_Roboto Regular","AndroidClock","SoMA Regular","HYQiHei-40S Lightx","lg-sans-serif","Dancing Script Bold","default","sec-roboto-light","ColorOSUI-Regular","test Regular","Tamil Sangam MN Bold","FZYingBiXingShu-S16","RobotoNum3L Light","monospaced-with-serifs","samsung-sans-num35","Cool jazz","SamsungNeoNum-3L","STXingkai","ScreenSansMono","DFPWaWaW5-GB","SamsungSansNum-3L Light","Bangla Sangam MN","Gurmukhi Sangam MN","SECRobotoLight","hyfonxrain","MYingHeiGB18030C-Bold","samsung-sans-light","Helvetica LT 65 Medium","Droid Sans Fallback","Roboto Test1 Bold","Noto Sans Myanmar Bold","sans-serif-condensed-custom","SamsungNeoNum-3T","Samsung Sans Num35","monospace","TL Mohanty Medium","helve-neue-medium","LTHYSZK","Roboto Condensed custome Bold","Myanmar3","Droid Sans Devanagari","ShaoNv_prev","samsung-neo-num3L","FZLanTingHei-EL-GBK","yunos","samsung-neo-num3T","Times New Roman","helve-neue-bold","noto-sans-cjk-regular","Noto Sans Gurmukhi UI Bold","DINPro-black","FZLanTingHei-EL-GB18030","SST Vietnamese Medium","Roboto Condensed Light","SST Vietnamese Bold","AR DJ-KK","Droid Sans SEMC","Noto Sans Myanmar UI","Coming Soon","MYuppy PRC Medium","Rosemary","Lohit Gujarati","Roboto Condensed custom Bold","FZLanTingHeiS-R-GB","Helvetica Neue OTS","Kaiti_prev","Roboto-BigClock","FZYBKSJW","Handset Condensed Bold","SamsungGeorgian","Dancing Script","sans-serif-condensed","hans-sans-thin","SamsungSansNum-4Tv Thin","Lohit Odia","BhashitaComplexSans"];
    let div = document.createElement('div');
    div.style.visibility = "hidden";
    div.innerHTML = '<span lang="zh" style="font-family:mmllii;font-size:114px">mmmmmmmmmmmlliii</span>';
    document.body.appendChild(div);
    let span = div.children[0];
    for (const key of infoAry) {
        span.style.fontFamily = key;
        code += `case "${key}":
        return ${span.offsetHeight};
        `;
    }
    console.log(code);
}();
// rs6_yaojian webgl 
!function(){
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('webgl');
    let buffer = context.createBuffer();
    context.bindBuffer(34962, buffer);
    context.bufferData(34962, {"0":-0.20000000298023224,"1":-0.8999999761581421,"2":0,"3":0.4000000059604645,"4":-0.25999999046325684,"5":0,"6":0,"7":0.8132645487785339,"8":0}, 35044);
    buffer.itemSize = 3;
    buffer.numItems = 3;
    let program = context.createProgram();

    let shader = context.createShader(35633);
    context.shaderSource(shader, 'attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}')
    context.compileShader(shader);

    let shader1 = context.createShader(35632);
    context.shaderSource(shader1, 'precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}');
    context.compileShader(shader);

    context.attachShader(program, shader);
    context.attachShader(program, shader1);
    context.linkProgram(program);
    context.useProgram(program);

    program.vertexPosAttrib = context.getAttribLocation(program, "attrVertex");
    program.offsetUniform = context.getUniformLocation(program, "uniformOffset");
    context.enableVertexAttribArray(undefined);
    context.vertexAttribPointer(0, 3, 5126, false, 0, 0);
    context.uniform2f(program.offsetUniform, 1, 1);
    context.drawArrays(5, 0, 3);
    let data = canvas.toDataURL();
    console.log(data);
}();

// rs div 标签指纹
!function () {
    let codeAry = "";
    let infoAry = [
        { fontFamily: "DFPhelvetica"},{ fontFamily: "Tibetan Machine Uni"},{ fontFamily: "Cooljazz"},{ fontFamily: "Verdana"},{ fontFamily: "Helvetica Neue LT Pro 35 Thin"},{ fontFamily: "tahoma"},{ fontFamily: "LG Smart_H test Regular"},{ fontFamily: "DINPro-light"},{ fontFamily: "Helvetica LT 43 Light Extended"},{ fontFamily: "HelveM_India"},{ fontFamily: "SECRobotoLight Bold"},{ fontFamily: "OR Mohanty Unicode Regular"},{ fontFamily: "Droid Sans Thai"},{ fontFamily: "Kannada Sangam MN"},{ fontFamily: "DDC Uchen"},{ fontFamily: "clock2016_v1.1"},{ fontFamily: "SamsungKannadaRegular"},{ fontFamily: "MI LANTING Bold"},{ fontFamily: "SamsungSansNum3L Light"},{ fontFamily: "verdana"},{ fontFamily: "HelveticaNeueThin"},{ fontFamily: "SECFallback"},{ fontFamily: "SamsungEmoji"},{ fontFamily: "Telugu Sangam MN"},{ fontFamily: "Carrois Gothic SC"},{ fontFamily: "Flyme Light Roboto Light"},{ fontFamily: "SoMA-Digit Light"},{ fontFamily: "SoMC Sans Regular"},{ fontFamily: "HYXiYuanJ"},{ fontFamily: "sst"},{ fontFamily: "samsung-sans-num4T"},{ fontFamily: "gm_mengmeng"},{ fontFamily: "Lohit Kannada"},{ fontFamily: "times new roman"},{ fontFamily: "samsung-sans-num4L"},{ fontFamily: "serif-monospace"},{ fontFamily: "SamsungSansNum-3T Thin"},{ fontFamily: "ColorOSUI-XThin"},{ fontFamily: "Droid Naskh Shift Alt"},{ fontFamily: "SamsungTeluguRegular"},{ fontFamily: "Bengali OTS"},{ fontFamily: "MI LanTing_GB Outside YS"},{ fontFamily: "FZMiaoWu_GB18030"},{ fontFamily: "helve-neue-regular"},{ fontFamily: "SST Medium"},{ fontFamily: "Courier New"},{ fontFamily: "Khmer Mondulkiri Bold"},{ fontFamily: "Helvetica LT 23 Ultra Light Extended"},{ fontFamily: "Helvetica LT 25 Ultra Light"},{ fontFamily: "Roboto Medium"},{ fontFamily: "Droid Sans Bold"},{ fontFamily: "goudy"},{ fontFamily: "sans-serif-condensed-light"},{ fontFamily: "SFinder"},{ fontFamily: "noto-sans-cjk-medium"},{ fontFamily: "miui"},{ fontFamily: "MRocky PRC Bold"},{ fontFamily: "AndroidClock Regular"},{ fontFamily: "SamsungSansNum-4L Light"},{ fontFamily: "sans-serif-thin"},{ fontFamily: "AaPangYaer"},{ fontFamily: "casual"},{ fontFamily: "BN MohantyOT Bold"},{ fontFamily: "x-sst"},{ fontFamily: "NotoSansMyanmarZawgyi"},{ fontFamily: "Helvetica LT 33 Thin Extended"},{ fontFamily: "AshleyScriptMT Alt"},{ fontFamily: "Noto Sans Devanagari UI"},{ fontFamily: "Roboto Condensed Bold"},{ fontFamily: "Roboto Medium Italic"},{ fontFamily: "miuiex"},{ fontFamily: "Noto Sans Gurmukhi UI"},{ fontFamily: "SST Vietnamese Light"},{ fontFamily: "LG_Oriya"},{ fontFamily: "hycoffee"},{ fontFamily: "x-sst-ultralight"},{ fontFamily: "DFHeiAW7-A"},{ fontFamily: "FZZWXBTOT_Unicode"},{ fontFamily: "Devanagari Sangam MN Bold"},{ fontFamily: "sans-serif-monospace"},{ fontFamily: "Padauk Book Bold"},{ fontFamily: "LG-FZYingBiKaiShu-S15-V2.2"},{ fontFamily: "LG-FZYingBiKaiShu-S15-V2.3"},{ fontFamily: "HelveticaNeueLT Pro 35 Th"},{ fontFamily: "Microsoft Himalaya"},{ fontFamily: "SamsungSansFallback"},{ fontFamily: "SST Medium Italic"},{ fontFamily: "AndroidEmoji"},{ fontFamily: "SamsungSansNum-3R"},{ fontFamily: "ITC Stone Serif"},{ fontFamily: "sans-serif-smallcaps"},{ fontFamily: "x-sst-medium"},{ fontFamily: "LG_Sinhalese"},{ fontFamily: "Roboto Thin Italic"},{ fontFamily: "century-gothic"},{ fontFamily: "Clockopia"},{ fontFamily: "Luminous_Sans"},{ fontFamily: "Floridian Script Alt"},{ fontFamily: "Noto Sans Gurmukhi Bold"},{ fontFamily: "LTHYSZK Bold"},{ fontFamily: "GS_Thai"},{ fontFamily: "SamsungNeoNum_3T_2"},{ fontFamily: "Arabic"},{ fontFamily: "hans-sans-normal"},{ fontFamily: "Lohit Telugu"},{ fontFamily: "HYQiHei-50S Light"},{ fontFamily: "Lindsey for Samsung"},{ fontFamily: "AR Crystalhei DB"},{ fontFamily: "Samsung Sans Medium"},{ fontFamily: "samsung-sans-num45"},{ fontFamily: "hans-sans-bold"},{ fontFamily: "Luminous_Script"},{ fontFamily: "SST Condensed"},{ fontFamily: "SamsungDevanagariRegular"},{ fontFamily: "Anjal Malayalam MN"},{ fontFamily: "SamsungThai(test)"},{ fontFamily: "FZLanTingHei-M-GB18030"},{ fontFamily: "Hebrew OTS"},{ fontFamily: "GS45_Arab(AndroidOS)"},{ fontFamily: "Samsung Sans Light"},{ fontFamily: "Choco cooky"},{ fontFamily: "helve-neue-thin"},{ fontFamily: "PN MohantyOT Medium"},{ fontFamily: "LG-FZKaTong-M19-V2.4"},{ fontFamily: "Droid Serif"},{ fontFamily: "SamsungSinhalaRegular"},{ fontFamily: "helvetica"},{ fontFamily: "LG-FZKaTong-M19-V2.2"},{ fontFamily: "Noto Sans Devanagari UI Bold"},{ fontFamily: "SST Light"},{ fontFamily: "DFPEmoji"},{ fontFamily: "weatherfontnew Regular"},{ fontFamily: "RobotoNum3R"},{ fontFamily: "DINPro-medium"},{ fontFamily: "Samsung Sans Num55"},{ fontFamily: "SST Heavy Italic"},{ fontFamily: "LGlock4 Regular_0805"},{ fontFamily: "Georgia"},{ fontFamily: "noto-sans-cjk"},{ fontFamily: "Telugu Sangam MN Bold"},{ fontFamily: "MIUI EX Normal"},{ fontFamily: "HYQiHei-75S Bold"},{ fontFamily: "NotoSansMyanmarZawgyi Bold"},{ fontFamily: "yunospro-black"},{ fontFamily: "helve-neue-normal"},{ fontFamily: "Luminous_Serif"},{ fontFamily: "TM MohantyOT Normal"},{ fontFamily: "SamsungSansNum-3Lv Light"},{ fontFamily: "Samsung Sans Num45"},{ fontFamily: "SmartGothic Medium"},{ fontFamily: "georgia"},{ fontFamily: "casual-font-type"},{ fontFamily: "Samsung Sans Bold"},{ fontFamily: "small-capitals"},{ fontFamily: "MFinance PRC Bold"},{ fontFamily: "FZLanTingHei_GB18030"},{ fontFamily: "SamsungArmenian"},{ fontFamily: "Roboto Bold"},{ fontFamily: "century-gothic-bold"},{ fontFamily: "x-sst-heavy"},{ fontFamily: "SST Light Italic"},{ fontFamily: "TharLon"},{ fontFamily: "x-sst-light"},{ fontFamily: "Dinbol Regular"},{ fontFamily: "SamsungBengaliRegular"},{ fontFamily: "KN MohantyOTSmall Medium"},{ fontFamily: "hypure"},{ fontFamily: "SamsungTamilRegular"},{ fontFamily: "Malayalam Sangam MN"},{ fontFamily: "Noto Sans Kannada UI"},{ fontFamily: "helve-neue"},{ fontFamily: "Helvetica LT 55 Roman"},{ fontFamily: "Noto Sans Kannada Bold"},{ fontFamily: "Sanpya"},{ fontFamily: "SamsungPunjabiRegular"},{ fontFamily: "samsung-sans-num4Lv"},{ fontFamily: "LG_Kannada"},{ fontFamily: "Samsung Sans Regular"},{ fontFamily: "Zawgyi-One"},{ fontFamily: "Droid Serif Bold Italic"},{ fontFamily: "FZKATJW"},{ fontFamily: "courier new"},{ fontFamily: "SamsungEmojiRegular"},{ fontFamily: "MIUI EX Bold"},{ fontFamily: "Android Emoji"},{ fontFamily: "Noto Naskh Arabic UI"},{ fontFamily: "LCD Com"},{ fontFamily: "Futura Medium BT"},{ fontFamily: "Vivo-extract"},{ fontFamily: "Bangla Sangam MN Bold"},{ fontFamily: "hans-sans-regular"},{ fontFamily: "SNum-3R"},{ fontFamily: "SNum-3T"},{ fontFamily: "hans-sans"},{ fontFamily: "SST Ultra Light"},{ fontFamily: "Roboto Regular"},{ fontFamily: "Roboto Light"},{ fontFamily: "Hanuman"},{ fontFamily: "newlggothic"},{ fontFamily: "DFHeiAW5-A"},{ fontFamily: "hans-sans-light"},{ fontFamily: "Plate Gothic"},{ fontFamily: "SNum-3L"},{ fontFamily: "Helvetica LT 45 Light"},{ fontFamily: "Myanmar Sangam Zawgyi Bold"},{ fontFamily: "lg-sans-serif-light"},{ fontFamily: "MIUI EX Light"},{ fontFamily: "Roboto Thin"},{ fontFamily: "SoMA Bold"},{ fontFamily: "Padauk"},{ fontFamily: "Samsung Sans"},{ fontFamily: "Spacious_SmallCap"},{ fontFamily: "sans-serif"},{ fontFamily: "DV MohantyOT Medium"},{ fontFamily: "Stable_Slap"},{ fontFamily: "monaco"},{ fontFamily: "Flyme-Light"},{ fontFamily: "fzzys-dospy"},{ fontFamily: "ScreenSans"},{ fontFamily: "clock2016"},{ fontFamily: "Roboto Condensed Bold Italic"},{ fontFamily: "Arial"},{ fontFamily: "KN Mohanty Medium"},{ fontFamily: "MotoyaLMaru W3 mono"},{ fontFamily: "Handset Condensed"},{ fontFamily: "Roboto Italic"},{ fontFamily: "HTC Hand"},{ fontFamily: "SST Ultra Light Italic"},{ fontFamily: "SST Vietnamese Roman"},{ fontFamily: "Noto Naskh Arabic UI Bold"},{ fontFamily: "chnfzxh-medium"},{ fontFamily: "SNumCond-3T"},{ fontFamily: "century-gothic-regular"},{ fontFamily: "default_roboto-light"},{ fontFamily: "Noto Sans Myanmar"},{ fontFamily: "Myanmar Sangam MN"},{ fontFamily: "Apple Color Emoji"},{ fontFamily: "weatherfontReg"},{ fontFamily: "SamsungMalayalamRegular"},{ fontFamily: "arial"},{ fontFamily: "Droid Serif Bold"},{ fontFamily: "CPo3 PRC Bold"},{ fontFamily: "MI LANTING"},{ fontFamily: "SamsungKorean-Regular"},{ fontFamily: "test45 Regular"},{ fontFamily: "spirit_time"},{ fontFamily: "Devanagari Sangam MN"},{ fontFamily: "ScreenSerif"},{ fontFamily: "Roboto"},{ fontFamily: "cursive-font-type"},{ fontFamily: "STHeiti_vivo"},{ fontFamily: "chnfzxh"},{ fontFamily: "Samsung ClockFont 3A"},{ fontFamily: "Roboto Condensed Regular"},{ fontFamily: "samsung-neo-num3R"},{ fontFamily: "GJ MohantyOT Medium"},{ fontFamily: "Chulho Neue Lock"},{ fontFamily: "roboto-num3L"},{ fontFamily: "helve-neue-ultraLightextended"},{ fontFamily: "SamsungOriyaRegular"},{ fontFamily: "SamsungSansNum-4Lv Light"},{ fontFamily: "MYingHei_18030_C2-Bold"},{ fontFamily: "DFPShaoNvW5-GB"},{ fontFamily: "Roboto Black"},{ fontFamily: "helve-neue-ultralight"},{ fontFamily: "gm_xihei"},{ fontFamily: "LGlock4 Light_0805"},{ fontFamily: "Gujarati Sangam MN"},{ fontFamily: "Malayalam Sangam MN Bold"},{ fontFamily: "roboto-num3R"},{ fontFamily: "STXihei_vivo"},{ fontFamily: "FZZhunYuan_GB18030"},{ fontFamily: "noto-sans-cjk-light"},{ fontFamily: "coloros"},{ fontFamily: "Noto Sans Gurmukhi"},{ fontFamily: "Noto Sans Symbols"},{ fontFamily: "Roboto Light Italic"},{ fontFamily: "Lohit Tamil"},{ fontFamily: "cursive"},{ fontFamily: "default_roboto"},{ fontFamily: "BhashitaComplexSans Bold"},{ fontFamily: "LG_Number_Roboto Thin"},{ fontFamily: "monospaced-without-serifs"},{ fontFamily: "Helvetica LT 35 Thin"},{ fontFamily: "samsung-sans-num3LV"},{ fontFamily: "DINPro"},{ fontFamily: "Jomolhari"},{ fontFamily: "sans-serif-light"},{ fontFamily: "helve-neue-black"},{ fontFamily: "Lohit Bengali"},{ fontFamily: "Myanmar Sangam Zawgyi"},{ fontFamily: "Droid Serif Italic"},{ fontFamily: "Roboto Bold Italic"},{ fontFamily: "NanumGothic"},{ fontFamily: "Sony Mobile UD Gothic Regular"},{ fontFamily: "Georgia Bold Italic"},{ fontFamily: "samsung-sans-num3Lv"},{ fontFamily: "yunos-thin"},{ fontFamily: "samsung-neo-num3T-cond"},{ fontFamily: "Noto Sans Myanmar UI Bold"},{ fontFamily: "lgserif"},{ fontFamily: "FZYouHei-R-GB18030"},{ fontFamily: "Lohit Punjabi"},{ fontFamily: "baskerville"},{ fontFamily: "samsung-sans-num4Tv"},{ fontFamily: "samsung-sans-thin"},{ fontFamily: "LG Emoji"},{ fontFamily: "AnjaliNewLipi"},{ fontFamily: "SamsungSansNum-4T Thin"},{ fontFamily: "SamsungKorean-Bold"},{ fontFamily: "miuiex-light"},{ fontFamily: "Noto Sans Kannada"},{ fontFamily: "Roboto Normal Italic"},{ fontFamily: "Georgia Italic"},{ fontFamily: "sans-serif-medium"},{ fontFamily: "Smart Zawgyi"},{ fontFamily: "Roboto Condensed Italic"},{ fontFamily: "Noto Sans Kannada UI Bold"},{ fontFamily: "DFP Sc Sans Heue30_103"},{ fontFamily: "LG_Number_Roboto Bold"},{ fontFamily: "Padauk Book"},{ fontFamily: "x-sst-condensed"},{ fontFamily: "Sunshine-Uchen"},{ fontFamily: "Roboto Black Italic"},{ fontFamily: "Ringo Color Emoji"},{ fontFamily: "Devanagari OTS"},{ fontFamily: "Smart Zawgyi Pro"},{ fontFamily: "FZLanTingHei-M-GBK"},{ fontFamily: "AndroidClock-Large Regular"},{ fontFamily: "proportionally-spaced-without-serifs"},{ fontFamily: "Cutive Mono"},{ fontFamily: "times"},{ fontFamily: "LG Smart_H test Bold"},{ fontFamily: "DINPro-Light"},{ fontFamily: "sans-serif-black"},{ fontFamily: "Lohit Devanagari"},{ fontFamily: "proportionally-spaced-with-serifs"},{ fontFamily: "samsung-sans-num3L"},{ fontFamily: "MYoung PRC Medium"},{ fontFamily: "DFGothicPW5-BIG5HK-SONY"},{ fontFamily: "hans-sans-medium"},{ fontFamily: "SST Heavy"},{ fontFamily: "LG-FZZhunYuan-M02-V2.2"},{ fontFamily: "MyanmarUNew Regular"},{ fontFamily: "Noto Naskh Arabic Bold"},{ fontFamily: "SamsungGujarathiRegular"},{ fontFamily: "fantasy"},{ fontFamily: "helve-neue-light"},{ fontFamily: "Helvetica Neue OTS Bold"},{ fontFamily: "noto-sans-cjk-bold"},{ fontFamily: "samsung-sans-num3R"},{ fontFamily: "Lindsey Samsung"},{ fontFamily: "samsung-sans-num3T"},{ fontFamily: "ScreenSerifMono"},{ fontFamily: "ETrump Myanmar_ZW"},{ fontFamily: "helve-neue-thinextended"},{ fontFamily: "Noto Naskh Arabic"},{ fontFamily: "LG_Gujarati"},{ fontFamily: "Smart_Monospaced"},{ fontFamily: "Tamil Sangam MN"},{ fontFamily: "LG Emoji NonAME"},{ fontFamily: "Roboto Condensed Light Italic"},{ fontFamily: "gm_jingkai"},{ fontFamily: "FZLanTingKanHei_GB18030"},{ fontFamily: "lgtravel"},{ fontFamily: "palatino"},{ fontFamily: "Georgia Bold"},{ fontFamily: "Droid Sans"},{ fontFamily: "LG_Punjabi"},{ fontFamily: "SmartGothic Bold"},{ fontFamily: "Samsung Sans Thin"},{ fontFamily: "SST Condensed Bold"},{ fontFamily: "Comics_Narrow"},{ fontFamily: "courier"},{ fontFamily: "Oriya Sangam MN"},{ fontFamily: "helve-neue-lightextended"},{ fontFamily: "FZLanTingHei-R-GB18030"},{ fontFamily: "AR CrystalheiHKSCS DB"},{ fontFamily: "serif"},{ fontFamily: "RTWSYueRoudGoG0v1-Regular"},{ fontFamily: "MiaoWu_prev"},{ fontFamily: "FZY1K"},{ fontFamily: "LG_Number_Roboto Regular"},{ fontFamily: "AndroidClock"},{ fontFamily: "SoMA Regular"},{ fontFamily: "HYQiHei-40S Lightx"},{ fontFamily: "lg-sans-serif"},{ fontFamily: "Dancing Script Bold"},{ fontFamily: "default"},{ fontFamily: "sec-roboto-light"},{ fontFamily: "ColorOSUI-Regular"},{ fontFamily: "test Regular"},{ fontFamily: "Tamil Sangam MN Bold"},{ fontFamily: "FZYingBiXingShu-S16"},{ fontFamily: "RobotoNum3L Light"},{ fontFamily: "monospaced-with-serifs"},{ fontFamily: "samsung-sans-num35"},{ fontFamily: "Cool jazz"},{ fontFamily: "SamsungNeoNum-3L"},{ fontFamily: "STXingkai"},{ fontFamily: "ScreenSansMono"},{ fontFamily: "DFPWaWaW5-GB"},{ fontFamily: "SamsungSansNum-3L Light"},{ fontFamily: "Bangla Sangam MN"},{ fontFamily: "Gurmukhi Sangam MN"},{ fontFamily: "SECRobotoLight"},{ fontFamily: "hyfonxrain"},{ fontFamily: "MYingHeiGB18030C-Bold"},{ fontFamily: "samsung-sans-light"},{ fontFamily: "Helvetica LT 65 Medium"},{ fontFamily: "Droid Sans Fallback"},{ fontFamily: "Roboto Test1 Bold"},{ fontFamily: "Noto Sans Myanmar Bold"},{ fontFamily: "sans-serif-condensed-custom"},{ fontFamily: "SamsungNeoNum-3T"},{ fontFamily: "Samsung Sans Num35"},{ fontFamily: "monospace"},{ fontFamily: "TL Mohanty Medium"},{ fontFamily: "helve-neue-medium"},{ fontFamily: "LTHYSZK"},{ fontFamily: "Roboto Condensed custome Bold"},{ fontFamily: "Myanmar3"},{ fontFamily: "Droid Sans Devanagari"},{ fontFamily: "ShaoNv_prev"},{ fontFamily: "samsung-neo-num3L"},{ fontFamily: "FZLanTingHei-EL-GBK"},{ fontFamily: "yunos"},{ fontFamily: "samsung-neo-num3T"},{ fontFamily: "Times New Roman"},{ fontFamily: "helve-neue-bold"},{ fontFamily: "noto-sans-cjk-regular"},{ fontFamily: "Noto Sans Gurmukhi UI Bold"},{ fontFamily: "DINPro-black"},{ fontFamily: "FZLanTingHei-EL-GB18030"},{ fontFamily: "SST Vietnamese Medium"},{ fontFamily: "Roboto Condensed Light"},{ fontFamily: "SST Vietnamese Bold"},{ fontFamily: "AR DJ-KK"},{ fontFamily: "Droid Sans SEMC"},{ fontFamily: "Noto Sans Myanmar UI"},{ fontFamily: "Coming Soon"},{ fontFamily: "MYuppy PRC Medium"},{ fontFamily: "Rosemary"},{ fontFamily: "Lohit Gujarati"},{ fontFamily: "Roboto Condensed custom Bold"},{ fontFamily: "FZLanTingHeiS-R-GB"},{ fontFamily: "Helvetica Neue OTS"},{ fontFamily: "Kaiti_prev"},{ fontFamily: "Roboto-BigClock"},{ fontFamily: "FZYBKSJW"},{ fontFamily: "Handset Condensed Bold"},{ fontFamily: "SamsungGeorgian"},{ fontFamily: "Dancing Script"},{ fontFamily: "sans-serif-condensed"},{ fontFamily: "hans-sans-thin"},{ fontFamily: "SamsungSansNum-4Tv Thin"},{ fontFamily: "Lohit Odia"},{ fontFamily: "BhashitaComplexSans"},
    ];
    let div = document.createElement("div");
    div.visibility = "hidden";
    div.innerHTML = '<span style=\"font-family:mmllii;font-size:114px\">mmmmmmmmmmmlliii</span>';
    document.body.appendChild(div);
    let span = div.children[0];
    for (const info of infoAry) {
        span.style.fontFamily = info['fontFamily'];
        document.body.appendChild(span);
        codeAry += `case "${info['fontFamily']}":
        result = ${span.offsetWidth}; break;
        `;
        document.body.removeChild(span);
    }
    let code = `if (this.tagName === "span" && this.innerHTML === "mmmmmmmmlli" && this.style.fontSize === "192px"){
        switch(this.style.fontFamily){
            ${codeAry}
        }
    }`;
    console.log(code);
}();

// 226 span
!function (){
    let div = document.createElement("div");
    div.innerHTML = "<span style=\"font-size: 72px; font-family: &quot;MT Extra&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MT Extra&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MT Extra&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ZWAdobeF&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ZWAdobeF&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ZWAdobeF&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Unicode MS&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Unicode MS&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Unicode MS&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Outlook&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Outlook&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Outlook&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Terminal&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Terminal&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Terminal&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;TRAJAN PRO&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;TRAJAN PRO&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;TRAJAN PRO&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Specialty&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Specialty&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Specialty&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Haettenschweiler&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Haettenschweiler&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Haettenschweiler&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OCR A Extended&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OCR A Extended&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OCR A Extended&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Staccato222 BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Staccato222 BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Staccato222 BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century Gothic&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century Gothic&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century Gothic&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Mincho&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Mincho&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Mincho&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft YaHei&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft YaHei&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft YaHei&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Century&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Sylfaen&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Sylfaen&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Sylfaen&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Agency FB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Agency FB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Agency FB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti TC&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti TC&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti TC&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cambria Math&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cambria Math&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cambria Math&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MYRIAD PRO&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MYRIAD PRO&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MYRIAD PRO&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura Md BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura Md BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura Md BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti SC&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti SC&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heiti SC&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimSun-ExtB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimSun-ExtB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimSun-ExtB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Sans Serif&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Sans Serif&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS Reference Sans Serif&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Vijaya&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Vijaya&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Vijaya&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU-ExtB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU-ExtB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU-ExtB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Marlett&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Marlett&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Marlett&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bitstream Vera Sans Mono&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bitstream Vera Sans Mono&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bitstream Vera Sans Mono&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bookman Old Style&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bookman Old Style&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bookman Old Style&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gill Sans&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gill Sans&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gill Sans&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OSAKA&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OSAKA&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OSAKA&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Didot&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Didot&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Didot&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Typewriter&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Typewriter&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Typewriter&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DIN&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DIN&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DIN&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PMingLiU&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monotype Corsiva&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monotype Corsiva&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monotype Corsiva&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ARNO PRO&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ARNO PRO&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ARNO PRO&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;GOTHAM&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;GOTHAM&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;GOTHAM&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimHei&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimHei&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SimHei&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Narrow&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Narrow&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Narrow&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Letter Gothic&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Letter Gothic&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Letter Gothic&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft Uighur&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft Uighur&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft Uighur&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Bk BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Bk BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Bk BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft JhengHei&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft JhengHei&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Microsoft JhengHei&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS PMincho&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS PMincho&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS PMincho&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SCRIPTINA&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SCRIPTINA&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SCRIPTINA&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Helvetica Neue&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Helvetica Neue&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Helvetica Neue&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Garamond&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Garamond&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Garamond&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU-ExtB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU-ExtB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU-ExtB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Rockwell&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Rockwell&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Rockwell&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monaco&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monaco&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Monaco&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BankGothic Md BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BankGothic Md BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BankGothic Md BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Minion Pro&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Minion Pro&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Minion Pro&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Clarendon&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Clarendon&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Clarendon&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Futura&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BlairMdITC TT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BlairMdITC TT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;BlairMdITC TT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;INCONSOLATA&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;INCONSOLATA&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;INCONSOLATA&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Small Fonts&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Small Fonts&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Small Fonts&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU_HKSCS-ExtB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU_HKSCS-ExtB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU_HKSCS-ExtB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Calibri&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Calibri&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Calibri&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS LineDraw&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS LineDraw&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS LineDraw&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Segoe UI Symbol&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Segoe UI Symbol&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Segoe UI Symbol&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AVENIR&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AVENIR&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AVENIR&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Swis721 BlkEx BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Swis721 BlkEx BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Swis721 BlkEx BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Black&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Black&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Arial Black&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Consolas&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Consolas&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Consolas&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gabriola&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gabriola&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Gabriola&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Md BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Md BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;AvantGarde Md BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Book Antiqua&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Book Antiqua&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Book Antiqua&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Leelawadee&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Leelawadee&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Leelawadee&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Academy Engraved LET&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Academy Engraved LET&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Academy Engraved LET&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ADOBE CASLON PRO&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ADOBE CASLON PRO&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;ADOBE CASLON PRO&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DFKai-SB&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DFKai-SB&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;DFKai-SB&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Serifa&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Serifa&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Serifa&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Thonburi&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Thonburi&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Thonburi&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;EUROSTILE&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;EUROSTILE&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;EUROSTILE&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Palatino&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Palatino&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Palatino&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;FangSong&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;FangSong&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;FangSong&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;KaiTi&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;KaiTi&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;KaiTi&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MingLiU&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NSimSun&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NSimSun&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NSimSun&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Andale Mono&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Andale Mono&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Andale Mono&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Amazone BT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Amazone BT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Amazone BT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Edwardian Script ITC&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Edwardian Script ITC&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Edwardian Script ITC&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bradley Hand&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bradley Hand&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bradley Hand&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Malgun Gothic&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Malgun Gothic&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Malgun Gothic&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NEVIS&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NEVIS&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;NEVIS&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;VisualUI&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;VisualUI&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;VisualUI&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Bright&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Bright&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Bright&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Levenim MT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Levenim MT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Levenim MT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS UI Gothic&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS UI Gothic&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;MS UI Gothic&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bodoni MT&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bodoni MT&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Bodoni MT&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heather&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heather&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Heather&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OPTIMA&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OPTIMA&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;OPTIMA&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PRINCETOWN LET&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PRINCETOWN LET&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;PRINCETOWN LET&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Showcard Gothic&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Showcard Gothic&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Showcard Gothic&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SILKSCREEN&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SILKSCREEN&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;SILKSCREEN&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Unicode&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Unicode&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Lucida Sans Unicode&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Wingdings 2&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Wingdings 2&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Wingdings 2&quot;, serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cezanne&quot;, monospace;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cezanne&quot;, sans-serif;\">mmmmmmmmmmlli</span><span style=\"font-size: 72px; font-family: &quot;Cezanne&quot;, serif;\">mmmmmmmmmmlli</span>";
    document.body.appendChild(div);
    let code = "";
    for (const node of div.children){
        // if (node.style['font-family'] == '"Sylfaen", sans-serif'){
        //     console.log(node.offsetWidth)
        // }
        code += `if (this.style['font-family'] === '${node.style['font-family']}' && this.innerHTML === '${node.innerHTML}'){
            return ${node.offsetHeight};
        }
        `
    }
    console.log(code);
}();

// 227
!function(){
    let ary = [];
    for (const item of performance.getEntriesByType("resource")){
        ary.push(item.toJSON());
    }
    console.log(JSON.stringify(ary));
}();

// Permissions 权限
!function () {
    let code = "";
    let infoAry = [
        { name: "geolocation" }, { name: "notifications" },
        { name: "push" }, { name: "midi" },
        { name: "camera" }, { name: "microphone" },
        { name: "speaker" }, { name: "device-info" },
        { name: "background-sync" }, { name: "bluetooth" },
        { name: "persistent-storage" }, { name: "ambient-light-sensor" },
        { name: "accelerometer" }, { name: "gyroscope" },
        { name: "magnetometer" }, { name: "clipboard" },
        { name: "accessibility-events" }, { name: "clipboard-read" },
        { name: "clipboard-write" }, { name: "payment-handler" },
    ];
    let name = "geolocation";
    try {
        navigator.permissions.query({ name: name }).then((result) => {
            if (result === null) {
                code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
            } else if (result === undefined) {
                code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
            } else if (result instanceof PermissionStatus) {
                code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
            }
        }
        );
    } catch (e) {
        code += `case ${name}:
    rsvm.recover();
    var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
    return new Promise((resolve, reject) => { reject(e); });
    `
    }

    name = "notifications";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "push";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "midi";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "camera";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "microphone";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "speaker";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "device-info";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "background-sync";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "bluetooth";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "persistent-storage";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "ambient-light-sensor";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "accelerometer";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "gyroscope";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "magnetometer";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "clipboard";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "accessibility-events";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "clipboard-read";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "clipboard-write";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
    name = "payment-handler";
    navigator.permissions.query({ name: name }).then(
        (result) => {
            try {
                if (result === null) {
                    code += `case "${name}":
                        rsvm.recover();
                return new Promise((resolve, reject) => { resolve(null); });
                `
                } else if (result === undefined) {
                    code += `case "${name}":
                        rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(undefined); });
                    `
                } else if (result instanceof PermissionStatus) {
                    code += `case "${name}":
                    var result = rsvm.prototype.PermissionStatus.new();
                    rsvm.set(result, "name", "${result.name}");
                    rsvm.set(result, "onchange", ${result.onchange});
                    rsvm.set(result, "state", ${typeof (result.state) === "string" ? `"${result.state}"` : result.state});
                    rsvm.recover();
                    return new Promise((resolve, reject) => { resolve(result); });
                    `
                }
            } catch (e) {
                code += `case ${name}:
                rsvm.recover();
                var e = new DOMException("Failed to execute 'query' on 'Permissions': Failed to read the 'name' property from 'PermissionDescriptor': The provided value '${name}' is not a valid enum value of type PermissionName.", "Error")
                return new Promise((resolve, reject) => { reject(e); });
                `
            }
        }
    );
}();

// speechSynthesis.getVoices()
!function () {
    let code = `[\r\n`;
    for (const info of speechSynthesis.getVoices()) {
        code += `{default: ${info.default}, lang: "${info.default}", localService: ${info.default}, name: "${info.default}", voiceURI: "${info.default}"},
        `;
    }
    code += `];`;
    console.log(code);
}();

// 在WebGLRenderingContext中使用getExtension()获取拓展
!function (){
    function getAll(prototype, target) {
        function create(obj) {
            let con = "";
            if (obj.__proto__ == undefined || obj.__proto__ == Object.prototype) {
                con += "{"
                for (const key in obj) {
                    con += `${key}: ${valueType(obj[key])}, `
                }
                con += '}';
            } else if (obj.__proto__ == [].__proto__) {
                con += "["
                for (const value of obj) {
                    con += `${valueType(value)}, `
                }
                con += ']';
            }
            return con;
        }
        function valueType(value) {
            let valueCode = "";
            if (null === value || undefined === value || "number" === typeof value || "boolean" === typeof value) {
                valueCode += value;
            } else if ('string' === typeof value) {
                valueCode += `\"${value}\"`;
            } else if ('function' === typeof value) {
                valueCode += `rsvm.RsCreateAction("${value.name}", ${value.length}, function ${value.name}() {
                })`;
            } else {
                if (value.__proto__ !== undefined && Object.hasOwn(value.__proto__, Symbol.toStringTag)) {
                    valueCode += `rsvm.prototype.${value[Symbol.toStringTag]}.new()`;
                } else {
                    valueCode += create(value);
                }
    
            }
            return valueCode;
        }
    
        let code = "!function () {\r\n", controll = "",
            memory = "", getter = "", setter = "", action = "",
            constructorCode = "", des, hasConstructor = false,
            flagName = "", setPrototype = "", enbleNew = true;
    
        // 判断是否存在构造函数，并根据情况响应处理
        if (Object.hasOwn(prototype, "constructor")) {
            hasConstructor = true;
            des = Object.getOwnPropertyDescriptor(window, prototype[Symbol.toStringTag]);
            try {
                new prototype['constructor']("");
            } catch {
                enbleNew = false;
            }
            code += `Object.defineProperty(window, "${prototype[Symbol.toStringTag]}", {value: rsvm.RsCreateConstructor("${prototype[Symbol.toStringTag]}"${enbleNew ? `, ${prototype['constructor'].length}, function ${prototype[Symbol.toStringTag]}(){
                return rsvm.prototype.${prototype[Symbol.toStringTag]}.apply(null, arguments);
            })` : ")"}, writable: ${des["writable"]}, enumerable: ${des["enumerable"]}, configurable: ${des["configurable"]}
            });`;
    
            des = Object.getOwnPropertyDescriptors(prototype["constructor"]);
            constructorCode = `\r\n\r\nObject.defineProperties(${prototype[Symbol.toStringTag]}, {\r\n`;
            for (const key in des) {
                if (['arguments', 'caller', 'name', 'length'].includes(key)) { continue; }
                if ('prototype' === key) {
                    constructorCode += `prototype: { value: ${prototype[Symbol.toStringTag]}.prototype, writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]} },\r\n`
                } else {
                    constructorCode += `${key}: { value: ${valueType(des[key]["value"])}, writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]} },\r\n`
                }
            }
            constructorCode += '});';
            flagName = hasConstructor ? prototype[Symbol.toStringTag] + ".prototype" : prototype[Symbol.toStringTag];
    
            // 处理构造函数的原型
            if (!(prototype["constructor"].__proto__ === Object.__proto__)) {
                var a = prototype["constructor"].__proto__;
                setPrototype += `\r\nObject.setPrototypeOf(${prototype["constructor"].name}, ${a.name});`
            }
        } else {
            code += `let ${prototype[Symbol.toStringTag]} = {};`
            flagName = prototype[Symbol.toStringTag];
        }
    
        // 处理原型对象的原型
        if (!(prototype.__proto__ === Object.prototype)) {
            var a = prototype.__proto__;
            var flagName2 = Object.hasOwn(a, "constructor") ? a[Symbol.toStringTag] + ".prototype" : a[Symbol.toStringTag];
            setPrototype += `\r\nObject.setPrototypeOf(${flagName}, ${flagName2});`
        }
    
        // 处理原型对象的相关属性
        des = Object.getOwnPropertyDescriptors(prototype);
        controll += `\r\n\r\nObject.defineProperties(${flagName}, {\r\n`;
        for (const key in des) {
            // if (ke) { continue; }
            controll += `${key}: {`;
            if ('constructor' === key) {
                controll += `writable: ${des[key]["writable"]}, enumerable: ${des[key]["enumerable"]}, configurable: ${des[key]["configurable"]}, value: ${prototype[Symbol.toStringTag]}`
            } else {
                for (const property in des[key]) {
                    if ('value' === property) {
                        controll += `value: ${valueType(target[key])},`
                    } else if ('get' === property) {
                        memory += `\r\n${key}: ${valueType(target[key])},`
                        getter += `\r\n${key}: rsvm.RsCreateGetter("${key}", function ${key}() {
                            return rsvm.get(this, "${key}");
                        }),`;
                        controll += `${property}: rsvm.RsCreateGetter("${key}", function ${key}() {
                            return rsvm.get(this, "${key}");
                        }), `;
                    } else if ('set' === property) {
                        if (des[key][property] === undefined) {
                            controll += `${property}: undefined, `;
                        } else {
                            setter += `\r\n${key}: rsvm.RsCreateSetter("${key}", function ${key}() {
                                rsvm.set(this, "${key}", arguments[0]);
                            }),`
                            controll += `${property}: rsvm.RsCreateSetter("${key}", function ${key}() {
                                rsvm.set(this, "${key}", arguments[0]);
                            }), `;
                        }
                    } else {
                        controll += `${property}: ${des[key][property]},`;
                    }
                }
            }
            controll += `},\r\n`
        }
        var ary = Object.getOwnPropertySymbols(prototype);
        for (const key of ary) {
            controll += `[${key.toString().replaceAll(/Symbol\(|\)/g, "")}]: {`;
            des = Object.getOwnPropertyDescriptor(prototype, key)
            for (const property in des) {
                if ('value' === property) {
                    controll += `value: ${valueType(des[property])},`
                } else {
                    controll += `${property}: ${des[property]},`;
                }
            }
            controll += "},\r\n"
        }
        controll += "});"
    
        if (memory) { memory += '\r\n'; }
        if (getter) { getter += '\r\n'; }
        if (setter) { setter += '\r\n'; }
        if (action) { action += '\r\n'; }
    
        code += `\r\n\r\nrsvm.prototype.${prototype[Symbol.toStringTag]} = {
            memory: {${memory}},
            malloc(memory, target) {
                rsvm.mallocBaseMemory("${prototype[Symbol.toStringTag]}", memory);
            },
            new() {
                let obj = rsvm.RsCreate(${flagName});
                return obj;
            },
        };` + constructorCode + controll;
    
        code += (setPrototype ? setPrototype : "") + "\r\n}();";
        return code;
    };
    let a = document.createElement("canvas");
    let b = a.getContext("webgl");
    let ary = b.getSupportedExtensions();
    // console.log(JSON.stringify(ary));
    // let code = "";
    // for (const info of ary){     // 吐原型
    //     let obj = b.getExtension(info);
    //     code += getAll(obj.__proto__, obj) + "\r\n\r\n\r\n";
    // }
    let code = `switch (arguments[0]) {\r\n`;
    for (const info of ary){        // 吐代码
        let obj = b.getExtension(info);
        code += `case "${info}":
        return rsvm.prototype.${obj[Symbol.toStringTag]}.new();
        `;
    }
    code += `};`
    console.log(code);
}();

// 226 canvas-webgl
!function(){
    debugger
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('webgl');
    let buff = context.createBuffer();
    let value = context.bindBuffer(34962, buff);
    let floaAry = new Float32Array();
    floaAry[0] = -0.20000000298023224;
    floaAry[1] = -0.8999999761581421;
    floaAry[2] = 0;
    floaAry[3] = 0.4000000059604645;
    floaAry[4] = -0.25999999046325684;
    floaAry[5] = 0;
    floaAry[6] = 0;
    floaAry[7] = 0.7321344614028931;
    floaAry[8] = 0;
    value = context.bufferData(34962, floaAry, 35044);
    buff.itemSize = 3;
    buff.numItems = 3;

    let program = context.createProgram();
    let shader = context.createShader(35633);
    let ary = [
        [35633,36338],
        [35633,36337],
        [35633,36336],
        [35632,36338],
        [35632,36337],
        [35632,36336],
        [35633,36341],
        [35633,36340],
        [35633,36339],
        [35632,36341],
        [35632,36340],
        [35632,36339],
    ];
    let code = '';

    for (const item of ary){
        value = context.getShaderPrecisionFormat(item[0], item[1]);
        code += `if (arguments[0] == ${item[0]} && arguments[1] == ${item[1]}){
            rsvm.set(target, "precision", ${value.precision});
            rsvm.set(target, "rangeMax", ${value.rangeMax});
            rsvm.set(target, "rangeMin", ${value.rangeMin});
            return target;
        }
        `
    }
    console.log(code);
    value = context.shaderSource(shader, "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}");
    value = context.compileShader(shader);
    value = context.attachShader(program, shader);
    value = context.linkProgram(program);
    value = context.useProgram(program);
    value = context.getAttribLocation(program, "attrVertex")
    program.vertexPosAttrib = undefined;
    value = context.getUniformLocation(program, "uniformOffset");
    program.offsetUniform = value;
    program.vertexPosArray;
    value = context.enableVertexAttribArray(undefined);
}();
