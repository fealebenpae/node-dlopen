#include <napi.h>
#include <uv.h>

using namespace Napi;

namespace {

class Library : public ObjectWrap<Library> {
public:
  Library(const CallbackInfo& info) : ObjectWrap<Library>(info) {
    std::string filename;
    if (info[0].IsString()) {
      filename = info[0].As<String>();
    }

    if (uv_dlopen(filename.empty() ? nullptr : filename.c_str(), &_library) == -1) {
      throw Error::New(info.Env(), uv_dlerror(&_library));
    }
  }

  Napi::Value Get(const CallbackInfo& info) {
    if (!_open) {
      throw Error::New(info.Env(), "This library has been closed");
    }

    std::string name = info[0].As<String>();
    Buffer<void*> symbol = Buffer<void*>::New(info.Env(), 1);
    if (uv_dlsym(&_library, name.c_str(), symbol.Data()) == -1) {
      throw Error::New(info.Env(), uv_dlerror(&_library));
    }

    return symbol;
  }

  void Close(const CallbackInfo& info) {
    if (_open) {
      uv_dlclose(&_library);
      _open = false;
    }
  }

  static Function Initialize(Napi::Env env) {
    return DefineClass(env, "Library", {
      InstanceMethod("get", &Library::Get),
      InstanceMethod("close", &Library::Close)
    });
  }

  ~Library() {
    if (_open) {
      uv_dlclose(&_library);
    }
  }
private:
  bool _open = true;
  uv_lib_t _library;
};

} // anonymous namespace

static Object Initialize(Env env, Object exports) {
  exports["Library"] = Library::Initialize(env);
  return exports;
}

NODE_API_MODULE(binding, Initialize)
