#pragma once

#include <node.h>
#include "browser/window.h"

using namespace v8;

namespace rsvm {
    /**
    * ������������ rsvm ���߶���
    */
    void GlogGetter(Local<String> property, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        auto global = context->Global();

        info.GetReturnValue().Set(
            global->GetPrivate(context, Private::ForApi(isolate, Tool::v8_str("glog"))).ToLocalChecked()
        );
    }
    void GlogSetter(Local<String> property, Local<Value> value, const PropertyCallbackInfo<void>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        auto global = context->Global();

        global->SetPrivate(context, Private::ForApi(isolate, Tool::v8_str("glog")), value);
    }

    /**
    * �ṩ��isolate-vm��api�ӿ�
    */
    Local<ObjectTemplate> CreateGlobal(Isolate* isolate, bool intercept) {
        Local<FunctionTemplate> winConstructor = ConstructorWindow(isolate);

        Local<ObjectTemplate> global = winConstructor->InstanceTemplate();

        Local<ObjectTemplate> rsvm = CreateRSVM(isolate);
        Tool::v8_set_property(
            global, Tool::v8_str("rsvm"), rsvm, PropertyAttribute::DontDelete | PropertyAttribute::DontEnum
        );

        if (intercept) {
            global->SetPrivate(Private::ForApi(isolate, Tool::v8_str("glog")), Boolean::New(isolate, false));
            NamedPropertyHandlerConfiguration nameHandler(
                GlobalNameGetter, GlobalNameSetter, nullptr, nullptr, nullptr, nullptr, nullptr
            ); global->SetHandler(nameHandler);
            IndexedPropertyHandlerConfiguration indexHandler(
                GlobalIndexGetter, GlobalIndexSetter, nullptr, nullptr, nullptr, nullptr, nullptr
            ); global->SetHandler(indexHandler);

            rsvm->SetAccessor(
                Tool::v8_str("glog"), GlogGetter, GlogSetter, Local<Value>(),
                AccessControl::DEFAULT, PropertyAttribute::DontDelete
            );
        }

        return global;
    }

}