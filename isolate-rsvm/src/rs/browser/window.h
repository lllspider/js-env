#pragma once

#include <node.h>
#include "../tool.h"

using namespace v8;

namespace rsvm {
    /**
    * ȫ�ֶ����ӳ��������
    */
    void GlobalNameGetter(Local<Name> property, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);
        auto global = context->Global();

        Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
        Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();

        if (glog->IsTrue()) {
            global->SetPrivate(context, logPrivate, Boolean::New(isolate, false));

            Local<Value> log;
            Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
            if (rsvm->IsObject()) {

                log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
                if (log->IsBoolean()) {
                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));

                    Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
                    if (logFunction->IsObject()) {

                        Local<Value> windowGetter = logFunction.As<Object>()->Get(context, Tool::v8_str("windowGetter")).ToLocalChecked();
                        if (windowGetter->IsFunction()) {
                            Local<Value> params[] = {
                                Tool::v8_str("window"), property, global->Get(context, property).ToLocalChecked()
                            };
                            windowGetter.As<Function>()->Call(context, info.Holder(), 3, params);
                        }

                    }

                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
                }
            }
            
            global->SetPrivate(context, logPrivate, glog);
        }
    }
    void GlobalNameSetter(Local<Name> property, Local<Value> value, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);
        auto global = context->Global();

        Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
        Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();

        if (glog->IsTrue()) {
            global->SetPrivate(context, logPrivate, Boolean::New(isolate, false));

            Local<Value> log;
            Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
            if (rsvm->IsObject()) {

                log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
                if (log->IsBoolean()) {
                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));

                    Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
                    if (logFunction->IsObject()) {
                        Local<Value> windowSetter = logFunction.As<Object>()->Get(context, Tool::v8_str("windowSetter")).ToLocalChecked();
                        if (windowSetter->IsFunction()) {
                            Local<Value> params[] = {
                            Tool::v8_str("window"), property, value, global->Get(context, property).ToLocalChecked()
                            };
                            windowSetter.As<Function>()->Call(context, info.Holder(), 4, params);
                        }

                    }

                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
                }
            }

            global->SetPrivate(context, logPrivate, glog);
        }
    }
    void GlobalIndexGetter(uint32_t index, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);
        auto global = context->Global();

        Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
        Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();

        if (glog->IsTrue()) {
            global->SetPrivate(context, logPrivate, Boolean::New(isolate, false));

            Local<Value> log;
            Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
            if (rsvm->IsObject()) {

                log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
                if (log->IsBoolean()) {
                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));

                    Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
                    if (logFunction->IsObject()) {

                        Local<Value> windowGetter = logFunction.As<Object>()->Get(context, Tool::v8_str("windowGetter")).ToLocalChecked();
                        if (windowGetter->IsFunction()) {
                            Local<Value> property = Number::New(isolate, index);
                            Local<Value> params[] = {
                            Tool::v8_str("window"), property, global->Get(context, property).ToLocalChecked()
                            };
                            windowGetter.As<Function>()->Call(context, info.Holder(), 3, params);
                        }

                    }

                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
                }

            }

            global->SetPrivate(context, logPrivate, glog);
        }
    }
    void GlobalIndexSetter(uint32_t index, Local<Value> value, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);
        auto global = context->Global();

        Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
        Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();

        if (glog->IsTrue()) {
            global->SetPrivate(context, logPrivate, Boolean::New(isolate, false));

            Local<Value> log;
            Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
            if (rsvm->IsObject()) {

                log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
                if (log->IsBoolean()) {
                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));

                    Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
                    if (logFunction->IsObject()) {

                        Local<Value> windowSetter = logFunction.As<Object>()->Get(context, Tool::v8_str("windowSetter")).ToLocalChecked();
                        if (windowSetter->IsFunction()) {
                            Local<Value> property = Number::New(isolate, index);
                            Local<Value> params[] = {
                            Tool::v8_str("window"), property, value, global->Get(context, property).ToLocalChecked()
                            };
                            windowSetter.As<Function>()->Call(context, info.Holder(), 4, params);
                        }

                    }

                    rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
                }

            }

            global->SetPrivate(context, logPrivate, glog);
        }
    }

    void DefineWindowProperty(Local<ObjectTemplate> global) {

    }

    /**
    * get window ������
    */
    void windowGetter(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        args.GetReturnValue().Set(context->Global());
    }

    /**
    * Window ���캯���ص�
    */
    void WindowConstructor(const FunctionCallbackInfo<Value>& info) {
        Isolate* isolate = info.GetIsolate();
        isolate->ThrowException(Exception::TypeError(Tool::v8_str(ExceptionMessages::ConstructorNew())));
    }
    Local<FunctionTemplate> ConstructorWindow(Isolate* isolate) {
        Local<FunctionTemplate> window = FunctionTemplate::New(isolate);
        window->SetCallHandler(WindowConstructor);
        window->SetLength(0);
        window->SetClassName(Tool::v8_str("Window"));

        Local<ObjectTemplate> proto = window->PrototypeTemplate();
        Tool::v8_set_property(
            proto, Symbol::GetToStringTag(isolate), Tool::v8_str("Window"),
            PropertyAttribute::ReadOnly | PropertyAttribute::DontEnum
        );

        Local<ObjectTemplate> global = window->InstanceTemplate();
        Tool::v8_set_property(global, Tool::v8_str("Window"), window, PropertyAttribute::DontEnum);
        global->SetAccessorProperty(
            Tool::v8_str("window"), Tool::v8_getter(windowGetter, "get window"), Local<FunctionTemplate>(),
            PropertyAttribute::DontDelete
        );

        window->InstanceTemplate()->SetImmutableProto();

        return window;
    }
}