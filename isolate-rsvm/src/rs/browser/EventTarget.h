#pragma once

#include <node.h>
#include "../tool.h"

using namespace v8;

namespace rsvm {
    /**
    * EventTarget ���캯���ص�
    */
    void EventTargetConstructor(const FunctionCallbackInfo<Value>& info) {
        Isolate* isolate = info.GetIsolate();
        isolate->ThrowException(Exception::TypeError(Tool::v8_str(ExceptionMessages::ConstructorNew())));
    }
    Local<FunctionTemplate> ConstructorEventTarget(Isolate* isolate) {
        Local<FunctionTemplate> eventTarget = FunctionTemplate::New(isolate);
        eventTarget->SetCallHandler(EventTargetConstructor);
        eventTarget->SetLength(0);
        eventTarget->SetClassName(Tool::v8_str("Window"));

        Local<ObjectTemplate> proto = eventTarget->PrototypeTemplate();
        Tool::v8_set_property(
            proto, Symbol::GetToStringTag(isolate), Tool::v8_str("EventTarget"),
            PropertyAttribute::ReadOnly | PropertyAttribute::DontEnum
        );

        return eventTarget;
    }
}