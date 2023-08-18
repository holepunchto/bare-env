#include <assert.h>
#include <bare.h>
#include <js.h>
#include <stdlib.h>
#include <uv.h>

static uv_rwlock_t bare_env_lock;

static uv_once_t bare_env_lock_guard = UV_ONCE_INIT;

static void
on_bare_env_lock_init (void) {
  uv_rwlock_init(&bare_env_lock);
}

static js_value_t *
bare_env_get_keys (js_env_t *env, js_callback_info_t *info) {
  int err;

  uv_env_item_t *items;
  int len;

  uv_rwlock_rdlock(&bare_env_lock);

  err = uv_os_environ(&items, &len);

  uv_rwlock_rdunlock(&bare_env_lock);

  if (err < 0) {
    js_throw_error(env, uv_err_name(err), uv_strerror(err));
    return NULL;
  }

  js_value_t *result;
  err = js_create_array_with_length(env, len, &result);
  assert(err == 0);

  for (int i = 0; i < len; i++) {
    uv_env_item_t *item = &items[i];

    js_value_t *val;
    err = js_create_string_utf8(env, (utf8_t *) item->name, -1, &val);
    assert(err == 0);

    err = js_set_element(env, result, i, val);
    assert(err == 0);
  }

  uv_os_free_environ(items, len);

  return result;
}

static js_value_t *
bare_env_get (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &name_len);
  assert(err == 0);

  name_len += 1 /* NULL */;

  utf8_t *name = malloc(name_len);
  err = js_get_value_string_utf8(env, argv[0], name, name_len, &name_len);
  assert(err == 0);

  uv_rwlock_rdlock(&bare_env_lock);

  size_t value_len = 256;
  char *value = malloc(value_len);
  err = uv_os_getenv((char *) name, value, &value_len);

  js_value_t *result;

  if (err == UV_ENOENT) {
    err = js_get_undefined(env, &result);
    assert(err == 0);
  } else if (err == UV_ENOBUFS) {
    value = realloc(value, value_len);

    err = uv_os_getenv((char *) name, value, &value_len);
    assert(err == 0);
  } else if (err < 0) {
    uv_rwlock_rdunlock(&bare_env_lock);
    js_throw_error(env, uv_err_name(err), uv_strerror(err));
    free(name);
    return NULL;
  }

  err = js_create_string_utf8(env, (utf8_t *) value, value_len, &result);
  assert(err == 0);

  uv_rwlock_rdunlock(&bare_env_lock);

  free(name);
  free(value);

  return result;
}

static js_value_t *
bare_env_has (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &name_len);
  assert(err == 0);

  utf8_t *name = malloc(++name_len);
  err = js_get_value_string_utf8(env, argv[0], name, name_len, &name_len);
  assert(err == 0);

  uv_rwlock_rdlock(&bare_env_lock);

  size_t value_len = 1;
  char value[1];
  err = uv_os_getenv((char *) name, value, &value_len);

  uv_rwlock_rdunlock(&bare_env_lock);

  if (err != 0 && err != UV_ENOENT && err != UV_ENOBUFS) {
    js_throw_error(env, uv_err_name(err), uv_strerror(err));
    free(name);
    return NULL;
  }

  free(name);

  js_value_t *result;
  err = js_get_boolean(env, err != UV_ENOENT, &result);
  assert(err == 0);

  return result;
}

static js_value_t *
bare_env_set (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 2;
  js_value_t *argv[2];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 2);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &name_len);
  assert(err == 0);

  utf8_t *name = malloc(++name_len);
  err = js_get_value_string_utf8(env, argv[0], name, name_len, &name_len);
  assert(err == 0);

  size_t value_len;
  err = js_get_value_string_utf8(env, argv[1], NULL, 0, &value_len);
  assert(err == 0);

  utf8_t *value = malloc(++value_len);
  err = js_get_value_string_utf8(env, argv[1], value, value_len, &value_len);
  assert(err == 0);

  uv_rwlock_wrlock(&bare_env_lock);

  err = uv_os_setenv((char *) name, (char *) value);

  uv_rwlock_wrunlock(&bare_env_lock);

  if (err < 0) {
    js_throw_error(env, uv_err_name(err), uv_strerror(err));
    free(name);
    free(value);
    return NULL;
  }

  free(name);
  free(value);

  return NULL;
}

static js_value_t *
bare_env_unset (js_env_t *env, js_callback_info_t *info) {
  int err;

  size_t argc = 1;
  js_value_t *argv[1];

  err = js_get_callback_info(env, info, &argc, argv, NULL, NULL);
  assert(err == 0);

  assert(argc == 1);

  size_t name_len;
  err = js_get_value_string_utf8(env, argv[0], NULL, 0, &name_len);
  assert(err == 0);

  utf8_t *name = malloc(++name_len);
  err = js_get_value_string_utf8(env, argv[0], name, name_len, &name_len);
  assert(err == 0);

  uv_rwlock_wrlock(&bare_env_lock);

  err = uv_os_unsetenv((char *) name);

  uv_rwlock_wrunlock(&bare_env_lock);

  if (err < 0) {
    js_throw_error(env, uv_err_name(err), uv_strerror(err));
    free(name);
    return NULL;
  }

  free(name);

  return NULL;
}

static js_value_t *
init (js_env_t *env, js_value_t *exports) {
  uv_once(&bare_env_lock_guard, on_bare_env_lock_init);

  {
    js_value_t *val;
    js_create_function(env, "getKeys", -1, bare_env_get_keys, NULL, &val);
    js_set_named_property(env, exports, "getKeys", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "get", -1, bare_env_get, NULL, &val);
    js_set_named_property(env, exports, "get", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "has", -1, bare_env_has, NULL, &val);
    js_set_named_property(env, exports, "has", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "set", -1, bare_env_set, NULL, &val);
    js_set_named_property(env, exports, "set", val);
  }
  {
    js_value_t *val;
    js_create_function(env, "unset", -1, bare_env_unset, NULL, &val);
    js_set_named_property(env, exports, "unset", val);
  }

  return exports;
}

BARE_MODULE(bare_env, init)
