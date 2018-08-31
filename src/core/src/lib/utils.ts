import { FormlyFieldConfig } from './core';
import { Observable } from 'rxjs';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function getFieldId(formId: string, field: FormlyFieldConfig, index: string|number) {
  if (field.id) return field.id;
  let type = field.type;
  if (!type && field.template) type = 'template';
  return [formId, type, field.key, index].join('_');
}

export function getKeyPath(field: {key?: string|string[], fieldGroup?: any, fieldArray?: any}): (string|number)[] {
  /* We store the keyPath in the field for performance reasons. This function will be called frequently. */
  if (!(<any> field)['_formlyKeyPath'] || (<any> field)['_formlyKeyPath'].key !== field.key) {
    let keyPath: (string|number)[] = [];
    if (field.key) {
      /* Also allow for an array key, hence the type check  */
      let pathElements = typeof field.key === 'string' ? field.key.split('.') : field.key;
      for (let pathElement of pathElements) {
        if (typeof pathElement === 'string') {
          /* replace paths of the form names[2] by names.2, cfr. angular formly */
          pathElement = pathElement.replace(/\[(\w+)\]/g, '.$1');
          keyPath = keyPath.concat(pathElement.split('.'));
        } else {
          keyPath.push(pathElement);
        }
      }
      for (let i = 0; i < keyPath.length; i++) {
        let pathElement = keyPath[i];
        if (typeof pathElement === 'string' && /^\d+$/.test(pathElement))  {
          keyPath[i] = parseInt(pathElement);
        }
      }
    }
    (<any> field)['_formlyKeyPath'] = {
      key: field.key,
      path: keyPath,
    };
  }

  return (<any> field)['_formlyKeyPath'].path.slice(0);
}

export const FORMLY_VALIDATORS = ['required', 'pattern', 'minLength', 'maxLength', 'min', 'max'];

export function assignModelValue(model: any, path: string | (string | number)[], value: any) {
  if (typeof path === 'string') {
    path = getKeyPath({key: path});
  }

  if (path.length > 1) {
    const e = path.shift();
    if (!model[e] || !isObject(model[e])) {
      model[e] = typeof path[0] === 'string' ? {} : [];
    }
    assignModelValue(model[e], path, value);
  } else {
    model[path[0]] = value;
  }
}

export function getFieldValue(field: FormlyFieldConfig): any {
  const paths = getKeyPath(field);
  let model = field.parent.model;
  while (model && paths.length > 0) {
    const e = paths.shift();
    model = model[e];
  }

  return model;
}

export function getKey(controlKey: string, actualKey: string) {
  return actualKey ? actualKey + '.' + controlKey : controlKey;
}

export function reverseDeepMerge(dest: any, ...args: any[]) {
  args.forEach(src => {
    for (let srcArg in src) {
      if (isNullOrUndefined(dest[srcArg]) || isBlankString(dest[srcArg])) {
        if (isFunction(src[srcArg])) {
          dest[srcArg] = src[srcArg];
        } else {
          dest[srcArg] = clone(src[srcArg]);
        }
      } else if (objAndSameType(dest[srcArg], src[srcArg])) {
        reverseDeepMerge(dest[srcArg], src[srcArg]);
      }
    }
  });
  return dest;
}

export function isNullOrUndefined(value: any) {
  return value === undefined || value === null;
}

export function isUndefined(value: any) {
  return value === undefined;
}

export function isBlankString(value: any) {
  return value === '';
}

export function isFunction(value: any) {
  return typeof(value) === 'function';
}

export function objAndSameType(obj1: any, obj2: any) {
  return isObject(obj1) && isObject(obj2)
    && Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2)
    && !(Array.isArray(obj1) || Array.isArray(obj2));
}

export function isObject(x: any) {
  return x != null && typeof x === 'object';
}

export function clone(value: any): any {
  if (!isObject(value) || value instanceof RegExp || value instanceof Observable) {
    return value;
  }

  if (value instanceof AbstractControl) {
    return null;
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return new Date(value.getTime());
  }

  if (Array.isArray(value)) {
    return value.slice(0).map(v => clone(v));
  }

  value = Object.assign({}, value);
  Object.keys(value).forEach(k => value[k] = clone(value[k]));

  return value;
}

export function removeFieldControl(form: FormArray | FormGroup, key: string | number) {
  if (form instanceof FormArray) {
    form.removeAt(key as number);
  } else if (form instanceof FormGroup) {
    form.removeControl(`${key}`);
  }
}

export function defineHiddenProp(field, prop, defaultValue) {
  Object.defineProperty(field, prop, { enumerable: false, writable: true, configurable: true });
  field[prop] = defaultValue;
}
