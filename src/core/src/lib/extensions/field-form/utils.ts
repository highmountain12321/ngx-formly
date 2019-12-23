import { FormArray, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '../../core';
import { getKeyPath, getFieldValue, isNullOrUndefined, defineHiddenProp, wrapProperty } from '../../utils';

export function unregisterControl(field: FormlyFieldConfig, emitEvent = false) {
  const form = field.formControl.parent as FormArray | FormGroup;
  if (form instanceof FormArray) {
    const key = form.controls.findIndex(c => c === field.formControl);
    if (key !== -1) {
      updateControl(
        form,
        { emitEvent },
        () => {
          form.removeAt(key);
          field.formControl.setParent(null);
        },
      );
    }
  } else if (form instanceof FormGroup) {
    const paths = getKeyPath(field);
    const key = paths[paths.length - 1];
    if (form.get([key]) === field.formControl) {
      updateControl(
        form,
        { emitEvent },
        () => {
          form.removeControl(key);
          field.formControl.setParent(null);
        },
      );
    }
  }
}

export function findControl(field: FormlyFieldConfig): AbstractControl {
  if (field.formControl) {
    return field.formControl;
  }

  const form = field.parent.formControl as FormGroup;
  if (form) {
    const paths = getKeyPath(field);

    return form.get(paths) || (form['_formlyControls'] && form['_formlyControls'][paths.join('.')]);
  }

  return null;
}

export function registerControl(field: FormlyFieldConfig, control?: any, emitEvent = false) {
  control = control || field.formControl;
  if (!field.formControl && control) {
    defineHiddenProp(field, 'formControl', control);

    field.templateOptions.disabled = !!field.templateOptions.disabled;
    wrapProperty(field.templateOptions, 'disabled', ({ firstChange, currentValue }) => {
      if (!firstChange) {
        currentValue ? field.formControl.disable() : field.formControl.enable();
      }
    });
    if (control.registerOnDisabledChange) {
      control.registerOnDisabledChange(
        (value: boolean) => field.templateOptions['___$disabled'] = value,
      );
    }
  }

  let parent = field.parent.formControl as FormGroup;
  if (!parent) {
    return;
  }

  const paths = getKeyPath(field);
  if (!parent['_formlyControls']) {
    defineHiddenProp(parent, '_formlyControls', {});
  }
  parent['_formlyControls'][paths.join('.')] = control;

  for (let i = 0; i < (paths.length - 1); i++) {
    const path = paths[i];
    if (!parent.get([path])) {
      registerControl({
        key: path,
        formControl: new FormGroup({}),
        parent: { formControl: parent },
      });
    }

    parent = <FormGroup> parent.get([path]);
  }

  const value = getFieldValue(field);
  if (
    !(isNullOrUndefined(control.value) && isNullOrUndefined(value))
    && control.value !== value
    && control instanceof FormControl
  ) {
    control.patchValue(value);
  }
  const key = paths[paths.length - 1];
  if (!field.hide && parent.get([key]) !== control) {
    updateControl(
      parent,
      { emitEvent },
      () => parent.setControl(key, control),
    );
  }
}

function updateControl(form: FormGroup|FormArray, opts: { emitEvent: boolean }, action: Function) {
  /**
   *  workaround for https://github.com/angular/angular/issues/27679
   */
  if (form instanceof FormGroup && !form['__patchForEachChild']) {
    defineHiddenProp(form, '__patchForEachChild', true);
    (form as any)._forEachChild = (cb: Function) => {
      Object
        .keys(form.controls)
        .forEach(k => form.controls[k] && cb(form.controls[k], k));
    };
  }

  /**
   * workaround for https://github.com/angular/angular/issues/20439
   */
  const updateValueAndValidity = form.updateValueAndValidity.bind(form);
  if (opts.emitEvent === false) {
    form.updateValueAndValidity = (opts) => {
      updateValueAndValidity({ ...(opts || {}), emitEvent: false });
    };
  }

  action();

  if (opts.emitEvent === false) {
    form.updateValueAndValidity = updateValueAndValidity;
  }
}