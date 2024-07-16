#pragma once

#include <node.h>

using namespace v8;

namespace rsvm {

    class ExceptionMessages {
    public:
        /**
        * ���캯����Ϊһ�㺯��ִ��
        */
        static const char* ConstructorCalledAsFunction() {
            return ("Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
        }

        /**
        * ���캯�� new ʵ��
        */
        static const char* ConstructorNew() {
            return ("Illegal constructor");
        }
    };

    class Tool {
    public:
        Tool() = delete;
        /**
        * �����ַ���
        */
        inline static Local<String> v8_str(const char* str) {
            return v8::String::NewFromOneByte(Isolate::GetCurrent(), (const uint8_t*)str, v8::NewStringType::kInternalized).ToLocalChecked();
        }

        /**
        * ��������
        */
        static void v8_set_property(Local<Object> target, Local<Name> property, Local<Value> value) {
            auto isolate = Isolate::GetCurrent();
            auto context = isolate->GetCurrentContext();

            target->Set(context, property, value);
        }
        static void v8_set_property(Local<ObjectTemplate> target, Local<Name> property, Local<Data> value, int attributes = PropertyAttribute::None) {
            auto isolate = Isolate::GetCurrent();
            target->Set(property, value, static_cast<PropertyAttribute>(attributes));
        }

        /**
        * ��������
        */
        static Local<FunctionTemplate> v8_function(v8::FunctionCallback callback = nullptr, const char* name = "", int length = 0) {
            auto isolate = Isolate::GetCurrent();

            Local<FunctionTemplate> funcTemp = FunctionTemplate::New(
                isolate, callback, Local<Value>(), Local<Signature>(), length, ConstructorBehavior::kThrow
            );
            funcTemp->SetClassName(v8_str(name));

            return funcTemp;
        }

        /**
        * �������������� getter
        */
        static Local<FunctionTemplate> v8_getter(v8::FunctionCallback callback = nullptr, const char* name = "") {
            auto isolate = Isolate::GetCurrent();

            Local<FunctionTemplate> funcTemp = FunctionTemplate::New(
                isolate, callback, Local<Value>(), Local<Signature>(), 0, ConstructorBehavior::kThrow
            );
            funcTemp->SetClassName(v8_str(name));

            return funcTemp;
        }

        /**
        * �������������� setter
        */
        static Local<FunctionTemplate> v8_setter(v8::FunctionCallback callback = nullptr, const char* name = "") {
            auto isolate = Isolate::GetCurrent();

            Local<FunctionTemplate> funcTemp = FunctionTemplate::New(
                isolate, callback, Local<Value>(), Local<Signature>(), 1, ConstructorBehavior::kThrow
            );
            funcTemp->SetClassName(v8_str(name));

            return funcTemp;
        }

        template <class T>
        inline static Local<T> GetOut(Local<T> value) {
            return EscapableHandleScope(Isolate::GetCurrent()).Escape(value);
        }

        template <class T>
        inline static Local<T> GetOut(MaybeLocal<T> value) {
            return EscapableHandleScope(Isolate::GetCurrent()).Escape(value.ToLocalChecked());
        }

        /**
        * ȫ�ֶ������������־������
        */
        static Local<Value> GLogPrevent() {
            auto isolate = Isolate::GetCurrent();
            auto context = isolate->GetCurrentContext();
            auto global = context->Global();

            Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
            Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();
            global->SetPrivate(context, logPrivate, Boolean::New(isolate, false));

            return glog;
        }
        static void GLogRecover(Local<Value> value) {
            auto isolate = Isolate::GetCurrent();
            auto context = isolate->GetCurrentContext();
            auto global = context->Global();

            Local<Private> logPrivate = Private::ForApi(isolate, Tool::v8_str("glog"));
            Local<Value> glog = global->GetPrivate(context, logPrivate).ToLocalChecked();

            global->SetPrivate(context, logPrivate, value);
        }

        /**
        * ȫ�ֶ������������־������
        */
        static const char* GetContextName(bool rsvm) {
            if (rsvm) {
                return "<RS|vx:proxy0014>";
            }
            else {
                return "<isolated-vm>";
            }
        }
    };

    /// <summary>
    /// ����ӳ������������
    /// </summary>
    /// <param name="args"></param>
    void NameGetter(Local<Name> property, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("getter")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), property };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameSetter(Local<Name> property, Local<Value> value, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("setter")).ToLocalChecked().As<Function>();
        Local<Value> params[3] = { info.This(), property, value };
        Local<Value> result = func->Call(context, info.This(), 3, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameQuery(Local<Name> property, const PropertyCallbackInfo<Integer>& info) {
        auto isolate = info.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("descriptor")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), property };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> value = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                int32_t rc = 0;
                if (value->IsObject()) {
                    Local<Object> obj = value.As<Object>();
                    if (obj->Get(context, Tool::v8_str("writable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::ReadOnly;
                    }
                    if (obj->Get(context, Tool::v8_str("enumerable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::DontEnum;
                    }
                    if (obj->Get(context, Tool::v8_str("configurable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::DontDelete;
                    }
                }
                info.GetReturnValue().Set(rc);
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameDefiner(Local<Name> property, const PropertyDescriptor& desc, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Object> obj = Object::New(isolate);
        if (desc.has_value()) { obj->Set(context, Tool::v8_str("value"), desc.value()); }
        if (desc.has_get()) { obj->Set(context, Tool::v8_str("get"), desc.get()); }
        if (desc.has_set()) { obj->Set(context, Tool::v8_str("set"), desc.set()); }
        if (desc.has_writable()) { obj->Set(context, Tool::v8_str("writable"), Boolean::New(isolate, desc.writable())); }
        if (desc.has_configurable()) { obj->Set(context, Tool::v8_str("configurable"), Boolean::New(isolate, desc.configurable())); }
        if (desc.has_enumerable()) { obj->Set(context, Tool::v8_str("enumerable"), Boolean::New(isolate, desc.enumerable())); }

        Local<Function> func = handler->Get(context, Tool::v8_str("definer")).ToLocalChecked().As<Function>();
        Local<Value> params[3] = { info.This(), property, obj };
        Local<Value> result = func->Call(context, info.This(), 3, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameDeleter(Local<Name> property, const PropertyCallbackInfo<Boolean>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("deleter")).ToLocalChecked().As<Function>();
        Local<Value> params[] = { info.This(), property };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> value = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                info.GetReturnValue().Set(Boolean::New(isolate, value->IsTrue()));
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameDescriptor(Local<Name> property, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("descriptor")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), property };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> obj = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                if (!obj->IsUndefined()) {
                    info.GetReturnValue().Set(obj);
                }
            }
        }

        Tool::GLogRecover(glog);
    }
    void NameEnumerator(const PropertyCallbackInfo<Array>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("enumerator")).ToLocalChecked().As<Function>();
        Local<Value> params[1] = { info.This() };
        Local<Value> result = func->Call(context, Null(isolate), 1, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> obj = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                if (obj->IsArray()) {
                    Local<Array> list = obj.As<Array>();
                    Local<Array> ary = Array::New(isolate);
                    for (uint32_t i = 0; i < list->Length(); i++) {
                        Local<Value> value = list->Get(context, i).ToLocalChecked();
                        if (value->IsName()) {
                            ary->Set(context, i, value);
                        }
                    }
                    info.GetReturnValue().Set(ary);
                }
                else {
                    info.GetReturnValue().Set(Array::New(isolate, 0));
                }
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateNameInterceptor(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 1 && args[0]->IsObject()) {
            Local<Object> handle = args[0].As<Object>();
            Local<ObjectTemplate> obj_temp = ObjectTemplate::New(isolate);

            NamedPropertyHandlerConfiguration nameHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, handle, PropertyHandlerFlags::kNone
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { nameHandler.getter = NameGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { nameHandler.setter = NameSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { nameHandler.query = NameQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { nameHandler.definer = NameDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { nameHandler.deleter = NameDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { nameHandler.descriptor = NameDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { nameHandler.enumerator = NameEnumerator; }
            obj_temp->SetHandler(nameHandler);
            args.GetReturnValue().Set(Tool::GetOut(obj_temp->NewInstance(context)));
            return;
        }
        args.GetReturnValue().SetNull();
    }

    /// <summary>
    /// ������������������
    /// </summary>
    /// <param name="args"></param>
    void IndexGetter(uint32_t index, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("getter")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), Number::New(isolate, index) };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexSetter(uint32_t index, Local<Value> value, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("setter")).ToLocalChecked().As<Function>();
        Local<Value> params[3] = { info.This(), Number::New(isolate, index), value };
        Local<Value> result = func->Call(context, info.This(), 3, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexQuery(uint32_t index, const PropertyCallbackInfo<Integer>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("query")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), Number::New(isolate, index) };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> value = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                int32_t rc = 0;
                if (value->IsObject()) {
                    Local<Object> obj = value.As<Object>();
                    if (obj->Get(context, Tool::v8_str("writable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::ReadOnly;
                    }
                    if (obj->Get(context, Tool::v8_str("enumerable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::DontEnum;
                    }
                    if (obj->Get(context, Tool::v8_str("configurable")).ToLocalChecked()->IsFalse()) {
                        rc |= PropertyAttribute::DontDelete;
                    }
                }
                info.GetReturnValue().Set(rc);
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexDefiner(uint32_t index, const PropertyDescriptor& desc, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> obj = Object::New(isolate);
        if (desc.has_value()) { obj->Set(context, Tool::v8_str("value"), desc.value()); }
        if (desc.has_get()) { obj->Set(context, Tool::v8_str("get"), desc.get()); }
        if (desc.has_set()) { obj->Set(context, Tool::v8_str("set"), desc.set()); }
        if (desc.has_writable()) { obj->Set(context, Tool::v8_str("writable"), Boolean::New(isolate, desc.writable())); }
        if (desc.has_configurable()) { obj->Set(context, Tool::v8_str("configurable"), Boolean::New(isolate, desc.configurable())); }
        if (desc.has_enumerable()) { obj->Set(context, Tool::v8_str("enumerable"), Boolean::New(isolate, desc.enumerable())); }
        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("definer")).ToLocalChecked().As<Function>();
        Local<Value> params[3] = { info.This(), Number::New(isolate, index), obj };
        Local<Value> result = func->Call(context, info.This(), 3, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                info.GetReturnValue().Set(intercept->Get(context, Tool::v8_str("value")).ToLocalChecked());
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexDeleter(uint32_t index, const PropertyCallbackInfo<Boolean>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("deleter")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), Number::New(isolate, index) };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> value = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                info.GetReturnValue().Set(Boolean::New(isolate, value->IsTrue()));
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexDescriptor(uint32_t index, const PropertyCallbackInfo<Value>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("descriptor")).ToLocalChecked().As<Function>();
        Local<Value> params[2] = { info.This(), Number::New(isolate, index) };
        Local<Value> result = func->Call(context, info.This(), 2, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> obj = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                if (!obj->IsUndefined()) {
                    info.GetReturnValue().Set(obj);
                }
            }
        }

        Tool::GLogRecover(glog);
    }
    void IndexEnumerator(const PropertyCallbackInfo<Array>& info) {
        auto isolate = info.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();

        Local<Object> handler = info.Data().As<Object>();
        Local<Function> func = handler->Get(context, Tool::v8_str("enumerator")).ToLocalChecked().As<Function>();
        Local<Value> params[1] = { info.This() };
        Local<Value> result = func->Call(context, Null(isolate), 1, params).ToLocalChecked();
        if (result->IsObject()) {
            Local<Object> intercept = result.As<Object>();
            if (intercept->Get(context, Tool::v8_str("intercept")).ToLocalChecked()->IsTrue()) {
                Local<Value> obj = intercept->Get(context, Tool::v8_str("value")).ToLocalChecked();
                if (obj->IsArray()) {
                    Local<Array> list = obj.As<Array>();
                    Local<Array> ary = Array::New(isolate);
                    for (uint32_t i = 0; i < list->Length(); i++) {
                        Local<Value> value = list->Get(context, i).ToLocalChecked();
                        if (value->IsNumber()) {
                            ary->Set(context, i, value);
                        }
                    }
                    info.GetReturnValue().Set(ary);
                }
                else {
                    info.GetReturnValue().Set(Array::New(isolate, 0));
                }
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateIndexInterceptor(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 1 && args[0]->IsObject()) {
            Local<Object> handle = args[0].As<Object>();

            Local<ObjectTemplate> obj_temp = ObjectTemplate::New(isolate);
            IndexedPropertyHandlerConfiguration indexHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, args[0], PropertyHandlerFlags::kNone
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { indexHandler.getter = IndexGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { indexHandler.setter = IndexSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { indexHandler.query = IndexQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { indexHandler.definer = IndexDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { indexHandler.deleter = IndexDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { indexHandler.descriptor = IndexDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { indexHandler.enumerator = IndexEnumerator; }
            obj_temp->SetHandler(indexHandler);

            args.GetReturnValue().Set(Tool::GetOut(obj_temp->NewInstance(context)));
            return;
        }
        args.GetReturnValue().SetNull();
    }

    void RsCreateInterceptor(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 1 && args[0]->IsObject()) {
            Local<Object> handle = args[0].As<Object>();

            Local<ObjectTemplate> obj_temp = ObjectTemplate::New(isolate);
            NamedPropertyHandlerConfiguration nameHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, handle, PropertyHandlerFlags::kOnlyInterceptStrings
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { nameHandler.getter = NameGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { nameHandler.setter = NameSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { nameHandler.query = NameQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { nameHandler.definer = NameDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { nameHandler.deleter = NameDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { nameHandler.descriptor = NameDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { nameHandler.enumerator = NameEnumerator; }
            obj_temp->SetHandler(nameHandler);

            IndexedPropertyHandlerConfiguration indexHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, handle, PropertyHandlerFlags::kNone
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { indexHandler.getter = IndexGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { indexHandler.setter = IndexSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { indexHandler.query = IndexQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { indexHandler.definer = IndexDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { indexHandler.deleter = IndexDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { indexHandler.descriptor = IndexDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { indexHandler.enumerator = IndexEnumerator; }
            obj_temp->SetHandler(indexHandler);

            args.GetReturnValue().Set(Tool::GetOut(obj_temp->NewInstance(context)));
            return;
        }
        args.GetReturnValue().SetNull();
    }

    /**
    * �������ɼ�����ĺ���
    */
    void DocumentAll(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();
        
        Local<Object> handle = args.Data().As<Object>();
        Local<Function> fun = handle->Get(context, Tool::v8_str("callAsFunction")).ToLocalChecked().As<Function>();
        Local<Value> params[10];
        for (int i = 0; i < args.Length(); i++) {
            params[i] = args[i];
        }
        MaybeLocal<Value> result = fun->Call(context, args.This(), args.Length(), params);
        args.GetReturnValue().Set(result.ToLocalChecked());

        Tool::GLogRecover(glog);
    }
    void RsCreateDocumentAll(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() < 1) {
            Local<Value> error = Exception::TypeError(Tool::v8_str("Failed to create HTMLAllCollection instance: 1 argument required, but only 0 present."));
            isolate->ThrowException(error);
            return;
        }
        if (!args[0]->IsObject()) {
            Local<Value> error = Exception::TypeError(Tool::v8_str("First argument type must be 'object' handle."));
            isolate->ThrowException(error);
            return;
        }

        if (args.Length() > 0 && args[0]->IsObject()) {
            Local<ObjectTemplate> obj_temp = ObjectTemplate::New(isolate);
            obj_temp->MarkAsUndetectable();
            obj_temp->SetCallAsFunctionHandler(DocumentAll, args[0]);

            Local<Object> handle = args[0].As<Object>();

            NamedPropertyHandlerConfiguration nameHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, handle, v8::PropertyHandlerFlags::kNone
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { nameHandler.getter = NameGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { nameHandler.setter = NameSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { nameHandler.query = NameQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { nameHandler.definer = NameDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { nameHandler.deleter = NameDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { nameHandler.descriptor = NameDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { nameHandler.enumerator = NameEnumerator; }
            obj_temp->SetHandler(nameHandler);

            IndexedPropertyHandlerConfiguration indexHandler(
                nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, handle, v8::PropertyHandlerFlags::kNone
            );
            if (handle->HasOwnProperty(context, Tool::v8_str("getter")).ToChecked()) { indexHandler.getter = IndexGetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("setter")).ToChecked()) { indexHandler.setter = IndexSetter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("query")).ToChecked()) { indexHandler.query = IndexQuery; }
            if (handle->HasOwnProperty(context, Tool::v8_str("definer")).ToChecked()) { indexHandler.definer = IndexDefiner; }
            if (handle->HasOwnProperty(context, Tool::v8_str("deleter")).ToChecked()) { indexHandler.deleter = IndexDeleter; }
            if (handle->HasOwnProperty(context, Tool::v8_str("descriptor")).ToChecked()) { indexHandler.descriptor = IndexDescriptor; }
            if (handle->HasOwnProperty(context, Tool::v8_str("enumerator")).ToChecked()) { indexHandler.enumerator = IndexEnumerator; }
            obj_temp->SetHandler(indexHandler);

            EscapableHandleScope scope(isolate);
            Local<Object> value = scope.Escape(obj_temp->NewInstance(context).ToLocalChecked());
            args.GetReturnValue().Set(value);
            return;
        }
        args.GetReturnValue().SetNull();
    }

    /**
    * �������캯��
    */
    void ConstructorErrorCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);

        // �����ø÷����Ķ����Ƿ�����������Եİ�
        MaybeLocal<Value> has = args.This()->GetPrivate(context, Private::ForApi(isolate, Tool::v8_str("__memory__")));
        if (has.IsEmpty() || has.ToLocalChecked()->IsUndefined()) {
            isolate->ThrowException(Exception::TypeError(Tool::v8_str("Illegal constructor")));
        }
    }
    void ConstructorNoErrorCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);

        if (!args.IsConstructCall()) {
            isolate->ThrowException(Exception::TypeError(Tool::v8_str(ExceptionMessages::ConstructorCalledAsFunction())));
            return;
        }

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        TryCatch tryCatch(isolate);

        // js�����߼�ִ�д�
        Local<Object> handle = args.Data().As<Object>();
        Local<Value> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked();
        Local<Value> params[10];
        for (int i = 0; i < args.Length(); i++) {
            params[i] = args[i];
        }
        Local<Value> result = callback.As<Function>()->Call(context, args.This(), args.Length(), params).ToLocalChecked();
        
        if (tryCatch.HasCaught()) {
            result = tryCatch.Exception();
        }
        if (rsvm->IsObject() && log->IsBoolean() && log->IsTrue()) {
            Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
            if (logFunction->IsObject()) {
                Local<Value> func = logFunction.As<Object>()->Get(context, Tool::v8_str("constructor")).ToLocalChecked();
                if (func->IsFunction()) {
                    Local<Array> paramsAry = Array::New(isolate, args.Length());
                    for (int i = 0; i < args.Length(); i++) {
                        paramsAry->Set(context, i, args[i]);
                    }
                    Local<Value> ps[] = {
                        handle->Get(context, Tool::v8_str("name")).ToLocalChecked(),
                        paramsAry, result
                    };
                    func.As<Function>()->Call(context, Null(isolate), 3, ps);
                }
            }
            rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
        }

        Tool::GLogRecover(glog);

        // �����׳��쳣
        if (tryCatch.HasCaught()) {
            tryCatch.ReThrow();
        }
        else {
            args.GetReturnValue().Set(result);
        }
    }
    void RsCreateConstructor(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 1 && args[0]->IsString()) {
            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, ConstructorErrorCallback, Local<Value>(), Local<Signature>(),
                0, ConstructorBehavior::kAllow
            );
            fun_temp->SetClassName(args[0].As<String>());
            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else if (args.Length() == 3 && args[0]->IsString() && args[1]->IsNumber() && args[2]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), args[1]);
            handle->Set(context, Tool::v8_str("callback"), args[2]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, ConstructorNoErrorCallback, handle, Local<Signature>(),
                args[1].As<Number>()->Value(), ConstructorBehavior::kAllow
            );
            fun_temp->SetClassName(args[0].As<String>());

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetNull();
        }
    }


    /// <summary>
    /// ����ԭ�Ͷ������Է�����
    /// </summary>
    /// <param name="args"></param>
    void GetterCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        // �����ø÷����Ķ����Ƿ�����������Եİ�
        Local<Private> memory = Private::ForApi(isolate, Tool::v8_str("__memory__"));
        if (args.This()->IsNullOrUndefined() || !args.This()->HasPrivate(context, memory).ToChecked()) {
            isolate->ThrowException(Exception::TypeError(Tool::v8_str("Illegal invocation")));
            return;
        }

        Local<Value> glog = Tool::GLogPrevent();

        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        Local<Object> handle = args.Data().As<Object>();
        Local<Value> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked();
        Local<Value> result = callback.As<Function>()->Call(context, args.This(), 0, nullptr).ToLocalChecked();
        args.GetReturnValue().Set(result);

        if (rsvm->IsObject()) {
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateGetter(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 2 && args[0]->IsString() && args[1]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), Number::New(isolate, 0));
            handle->Set(context, Tool::v8_str("callback"), args[1]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, GetterCallback, handle, Local<Signature>(),
                0, ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(String::Concat(isolate, Tool::v8_str("get "), args[0].As<String>()));

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    void SetterCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        // �����ø÷����Ķ����Ƿ�����������Եİ�
        Local<Private> memory = Private::ForApi(isolate, Tool::v8_str("__memory__"));
        if (args.This()->IsNullOrUndefined() || !args.This()->HasPrivate(context, memory).ToChecked()) {
            isolate->ThrowException(Exception::TypeError(Tool::v8_str("Illegal invocation")));
            return;
        }

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        Local<Object> handle = args.Data().As<Object>();
        Local<Function> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked().As<Function>();
        Local<Value> params[1] = { args[0] };
        Local<Value> result = callback->Call(context, args.This(), 1, params).ToLocalChecked();

        if (rsvm->IsObject()) {
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateSetter(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() >= 2 && args[0]->IsString() && args[1]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), Number::New(isolate, 1));
            handle->Set(context, Tool::v8_str("callback"), args[1]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, SetterCallback, handle, Local<Signature>(),
                1, ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(String::Concat(isolate, Tool::v8_str("set "), args[0].As<String>()));

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    void ActionCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();

        Local<Private> memory = Private::ForApi(isolate, Tool::v8_str("__memory__"));
        if (args.This()->IsNullOrUndefined() || !args.This()->HasPrivate(context, memory).ToChecked()) {
            isolate->ThrowException(Exception::TypeError(Tool::v8_str("Illegal invocation")));
            return;
        }

        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        TryCatch tryCatch(isolate);

        Local<Object> handle = args.Data().As<Object>();
        Local<Value> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked();
        Local<Value> params[10];
        for (int i = 0; i < args.Length(); i++) {
            params[i] = args[i];
        }
        Local<Value> result = callback.As<Function>()->Call(context, args.This(), args.Length(), params).ToLocalChecked();

        bool hasCaught = tryCatch.HasCaught();
        if (hasCaught) {
            result = tryCatch.Exception();
            tryCatch.Reset();
        }
        if (rsvm->IsObject() && log->IsBoolean() && log->IsTrue()) {
            Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
            if (logFunction->IsObject()) {
                Local<Value> func = logFunction.As<Object>()->Get(context, Tool::v8_str("action")).ToLocalChecked();
                if (func->IsFunction()) {
                    Local<Array> paramsAry = Array::New(isolate, args.Length());
                    for (int i = 0; i < args.Length(); i++) {
                        paramsAry->Set(context, i, args[i]);
                    }
                    params[0] = args.This();
                    params[1] = handle->Get(context, Tool::v8_str("name")).ToLocalChecked();
                    params[2] = paramsAry;
                    params[3] = result;
                    func.As<Function>()->Call(context, Null(isolate), 4, params);
                }
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }

        Tool::GLogRecover(glog);

        if (hasCaught) {
            isolate->ThrowException(result);
            if (tryCatch.HasCaught()) {
                tryCatch.ReThrow();
            }
        }
        else {
            args.GetReturnValue().Set(result);
        }
    }
    void RsCreateAction(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 3 && args[0]->IsString() && args[1]->IsNumber() && args[2]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), args[1]);
            handle->Set(context, Tool::v8_str("callback"), args[2]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, ActionCallback, handle, Local<Signature>(),
                args[1].As<Number>()->Value(), ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(args[0].As<String>());

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    void WindowGetterCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        Local<Object> handle = args.Data().As<Object>();
        Local<Function> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked().As<Function>();
        Local<Value> result = callback->Call(context, args.This(), 0, nullptr).ToLocalChecked();
        args.GetReturnValue().Set(result);

        if (rsvm->IsObject()) {
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateWindowGetter(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 2 && args[0]->IsString() && args[1]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), Number::New(isolate, 0));
            handle->Set(context, Tool::v8_str("callback"), args[1]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, WindowGetterCallback, handle, Local<Signature>(),
                0, ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(String::Concat(isolate, Tool::v8_str("get "), args[0].As<String>()));

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    void WindowSetterCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        Local<Object> handle = args.Data().As<Object>();
        Local<Function> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked().As<Function>();
        Local<Value> params[1];
        params[0] = args[0];
        Local<Value> result = callback->Call(context, args.This(), 1, params).ToLocalChecked();
        args.GetReturnValue().Set(result);

        if (rsvm->IsObject()) {
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }

        Tool::GLogRecover(glog);
    }
    void RsCreateWindowSetter(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 2 && args[0]->IsString() && args[1]->IsFunction()) {
            Local<Object> handle = ObjectTemplate::New(isolate)->NewInstance(context).ToLocalChecked();
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), Number::New(isolate, 1));
            handle->Set(context, Tool::v8_str("callback"), args[1]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, WindowSetterCallback, handle, Local<Signature>(),
                1, ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(String::Concat(isolate, Tool::v8_str("set "), args[0].As<String>()));

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    void WindowActionCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        Local<Value> glog = Tool::GLogPrevent();
        Local<Value> log;
        Local<Object> global = context->Global();
        Local<Value> rsvm = global->Get(context, Tool::v8_str("rsvm")).ToLocalChecked();
        if (rsvm->IsObject()) {
            log = rsvm.As<Object>()->Get(context, Tool::v8_str("log")).ToLocalChecked();
            if (log->IsBoolean()) {
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), Boolean::New(isolate, false));
            }
        }

        TryCatch tryCatch(isolate);

        Local<Object> handle = args.Data().As<Object>();
        Local<Function> callback = handle->Get(context, Tool::v8_str("callback")).ToLocalChecked().As<Function>();
        Local<Value> params[10];
        for (int i = 0; i < args.Length(); i++) {
            params[i] = args[i];
        }
        Local<Value> result = callback->Call(context, args.This(), args.Length(), params).ToLocalChecked();

        bool hasCaught = tryCatch.HasCaught();
        if (hasCaught) {
            result = tryCatch.Exception();
            tryCatch.Reset();
        }
        if (rsvm->IsObject() && log->IsBoolean() && log->IsTrue()) {
            Local<Value> logFunction = rsvm.As<Object>()->Get(context, Tool::v8_str("logFunction")).ToLocalChecked();
            if (logFunction->IsObject()) {
                Local<Value> func = logFunction.As<Object>()->Get(context, Tool::v8_str("windowAction")).ToLocalChecked();
                if (func->IsFunction()) {
                    Local<Array> paramsAry = Array::New(isolate, args.Length());
                    for (int i = 0; i < args.Length(); i++) {
                        paramsAry->Set(context, i, args[i]);
                    }
                    params[0] = args.This();
                    params[1] = handle->Get(context, Tool::v8_str("name")).ToLocalChecked();
                    params[2] = paramsAry;
                    params[3] = result;
                    func.As<Function>()->Call(context, Null(isolate), 4, params);
                }
                rsvm.As<Object>()->Set(context, Tool::v8_str("log"), log);
            }
        }
        Tool::GLogRecover(glog);

        if (hasCaught) {
            isolate->ThrowException(result);
            if (tryCatch.HasCaught()) {
                tryCatch.ReThrow();
            }
        }
        else {
            args.GetReturnValue().Set(result);
        }
    }
    void RsCreateWindowAction(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 3 && args[0]->IsString() && args[1]->IsNumber() && args[2]->IsFunction()) {
            Local<Object> handle = Object::New(isolate);
            handle->Set(context, Tool::v8_str("name"), args[0]);
            handle->Set(context, Tool::v8_str("length"), args[1]);
            handle->Set(context, Tool::v8_str("callback"), args[2]);

            Local<FunctionTemplate> fun_temp = FunctionTemplate::New(
                isolate, WindowActionCallback, handle, Local<Signature>(),
                args[1].As<Number>()->Value(), ConstructorBehavior::kThrow
            );
            fun_temp->SetClassName(args[0].As<String>());

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
        }
        else {
            args.GetReturnValue().SetUndefined();
        }
    }


    /// <summary>
    /// RsCreateFunction("setTimeout", 2, false, function (){rsvm.print("test setTimeout");}
    /// </summary>
    /// <param name="args"></param>
    void FunctionCallback(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();

        HandleScope scope(isolate);

        Local<Object> handle = args.Data().As<Object>();
        Local<Value> params[10];
        for (int i = 0; i < args.Length(); i++) {
            params[i] = args[i];
        }
        if (args.IsConstructCall()) {
            Local<Value> constructCall = handle->Get(context, Tool::v8_str("constructCall")).ToLocalChecked();
            if (constructCall->IsFunction()) {
                Local<Value> result = constructCall.As<Function>()->Call(context, args.This(), args.Length(), params).ToLocalChecked();
                args.GetReturnValue().Set(result);
            }
        }
        else {
            Local<Value> notConstructCall = handle->Get(context, Tool::v8_str("notConstructCall")).ToLocalChecked();
            if (notConstructCall->IsFunction()) {
                Local<Value> result = notConstructCall.As<Function>()->Call(context, args.This(), args.Length(), params).ToLocalChecked();
                args.GetReturnValue().Set(result);
            }
        }
    }
    void RsCreateFunction(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args[0]->IsObject()) {
            Local<Object> handle = args[0].As<Object>();
            Local<Value> isConstr = handle->Get(context, Tool::v8_str("isConstruct")).ToLocalChecked();

            int length = 0;
            Local<String> name = Tool::v8_str("");

            Local<Value> len = handle->Get(context, Tool::v8_str("length")).ToLocalChecked();
            Local<Value> n = handle->Get(context, Tool::v8_str("name")).ToLocalChecked();
            if (len->IsNumber()) {  length = len.As<Number>()->Value(); }
            if (n->IsString()) { name = n.As<String>(); }

            Local<FunctionTemplate> fun_temp;
            if (isConstr->IsTrue()) {
                fun_temp = FunctionTemplate::New(
                    isolate, FunctionCallback, handle, Local<Signature>(),
                    length, ConstructorBehavior::kAllow
                );
            }
            else {
                fun_temp = FunctionTemplate::New(
                    isolate, FunctionCallback, handle, Local<Signature>(),
                    length, ConstructorBehavior::kThrow
                );
            }

            fun_temp->SetClassName(name);

            args.GetReturnValue().Set(Tool::GetOut(fun_temp->GetFunction(context)));
            return;
            
        }
    }


    /**
    * �ṩ��js���洴��һ��C++�����RS���Ե�js���󣬻��ָ��������C++�����RS����
    * ��ȡ�����˽�����ԣ�c++���棩
    */
    void RsSetPrivateProperty(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 3 && args[0]->IsObject() && args[1]->IsString()) {
            Maybe<bool> isok = args[0].As<Object>()->SetPrivate(context, Private::ForApi(isolate, args[1].As<String>()), args[2]);
            if (isok.ToChecked()) {
                args.GetReturnValue().Set(args[0].As<Object>());
                return;
            }
        }

        args.GetReturnValue().Set(false);
    }
    void RsGetPrivateProperty(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 2 && args[0]->IsObject() && args[1]->IsString()) {
            Local<Value> value = args[0].As<Object>()->GetPrivate(context, Private::ForApi(isolate, args[1].As<String>())).ToLocalChecked();
            args.GetReturnValue().Set(value);
        }
        else {
            Local<Value> err = Exception::TypeError(Tool::v8_str("Check type or param number"));
            isolate->ThrowException(err);
        }
    }

    /// <summary>
    /// �������ȿ���
    /// </summary>
    /// <param name="args"></param>
    void RsClone(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args.Length() == 1 && args[0]->IsObject()) {
            Local<Object> obj = args[0].As<Object>();
            args.GetReturnValue().Set(obj->Clone());
            return;
        }
        args.GetReturnValue().SetNull();
    }

    /// <summary>
    /// ���нű�
    /// </summary>
    /// <param name="args"></param>
    void RsRunHTMLScript(const FunctionCallbackInfo<Value>& args) {
        auto isolate = args.GetIsolate();
        auto context = isolate->GetCurrentContext();
        HandleScope scope(isolate);

        if (args[0]->IsString()) {
            auto source = args[0].As<String>();
            Local<Script> script = Script::Compile(context, source).ToLocalChecked();
            if (!script.IsEmpty()) {
                Local<Value> result = script->Run(context).ToLocalChecked();
                args.GetReturnValue().Set(result);
            }
        }
    }

    /**
    * ������������ rsvm ���߶���
    */
    Local<ObjectTemplate> CreateRSVM(Isolate* isolate) {
        Local<ObjectTemplate> rsvm = ObjectTemplate::New(isolate);

        Tool::v8_set_property(rsvm, Tool::v8_str("log"), Boolean::New(isolate, false));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateDocumentAll"), Tool::v8_function(RsCreateDocumentAll, "RsCreateDocumentAll", 1));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateInterceptor"), Tool::v8_function(RsCreateInterceptor, "RsCreateInterceptor", 1));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateNameInterceptor"), Tool::v8_function(RsCreateNameInterceptor, "RsCreateNameInterceptor", 1));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateIndexInterceptor"), Tool::v8_function(RsCreateIndexInterceptor, "RsCreateIndexInterceptor", 1));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateGetter"), Tool::v8_function(RsCreateGetter, "RsCreateGetter", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateSetter"), Tool::v8_function(RsCreateSetter, "RsCreateSetter", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateAction"), Tool::v8_function(RsCreateAction, "RsCreateAction", 3));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateFunction"), Tool::v8_function(RsCreateFunction, "RsCreateFunction", 3));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateConstructor"), Tool::v8_function(RsCreateConstructor, "RsCreateConstructor", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateWindowGetter"), Tool::v8_function(RsCreateWindowGetter, "RsCreateWindowGetter", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateWindowSetter"), Tool::v8_function(RsCreateWindowSetter, "RsCreateWindowSetter", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsCreateWindowAction"), Tool::v8_function(RsCreateWindowAction, "RsCreateWindowAction", 3));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsSetPrivateProperty"), Tool::v8_function(RsSetPrivateProperty, "RsSetPrivateProperty", 3));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsGetPrivateProperty"), Tool::v8_function(RsGetPrivateProperty, "RsGetPrivateProperty", 2));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsClone"), Tool::v8_function(RsClone, "RsClone", 1));
        Tool::v8_set_property(rsvm, Tool::v8_str("RsRunHTMLScript"), Tool::v8_function(RsRunHTMLScript, "RsRunHTMLScript", 1));

        return rsvm;
    }

}