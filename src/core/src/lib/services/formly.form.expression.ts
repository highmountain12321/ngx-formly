import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FormlyValueChangeEvent, FormlyFieldConfigCache } from '../components/formly.field.config';
import {
  isObject, isNullOrUndefined, isFunction,
  FORMLY_VALIDATORS, getFieldModel, getKeyPath,
  evalExpression, evalStringExpression, evalExpressionValueSetter,
} from '../utils';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * @internal
 */
@Injectable()
export class FormlyFormExpression {
  initFields(form: FormGroup | FormArray, fields: FormlyFieldConfig[] = [], model: any, options: FormlyFormOptions) {
    this._initFields(fields as any, options);
    this.checkFields(form, fields, model, options);
  }

  checkFields(form: FormGroup | FormArray, fields: FormlyFieldConfig[] = [], model: any, options: FormlyFormOptions) {
    this._checkFields(form, fields as any, options);
  }

  private _initFields(fields: FormlyFieldConfigCache[], options: FormlyFormOptions) {
    fields.forEach((field) => {
      if (field.expressionProperties) {
        for (const key in field.expressionProperties) {
          if (typeof field.expressionProperties[key] === 'string' || isFunction(field.expressionProperties[key])) {
            // cache built expression
            field._expressionProperties = field._expressionProperties || {};
            field._expressionProperties[key] = {
              expression: isFunction(field.expressionProperties[key])
                ? field.expressionProperties[key]
                : evalStringExpression(field.expressionProperties[key] as string, ['model', 'formState']),
              expressionValueSetter: evalExpressionValueSetter(
                `field.${key}`,
                ['expressionValue', 'model', 'field'],
              ),
            };
          } else if (field.expressionProperties[key] instanceof Observable) {
            const expressionValueSetter = evalExpressionValueSetter(
              `field.${key}`,
              ['expressionValue', 'model', 'field'],
            );

            const subscription = (field.expressionProperties[key] as Observable<any>).pipe(
              tap(v => evalExpression(expressionValueSetter, { field }, [v, field.model, field])),
            ).subscribe();

            const onDestroy = field.lifecycle.onDestroy;
            field.lifecycle.onDestroy = (...args) => {
              if (onDestroy) {
                onDestroy(...args);
              }
              subscription.unsubscribe();
            };
          }
        }
      }

      if (field.hideExpression) {
        // delete hide value in order to force re-evaluate it in FormlyFormExpression.
        delete field.hide;
        if (typeof field.hideExpression === 'string') {
          // cache built expression
          field.hideExpression = evalStringExpression(field.hideExpression, ['model', 'formState']);
        }
      }

      if (field.fieldGroup) {
        // if `hideExpression` is set in that case we have to deal
        // with toggle FormControl for each field in fieldGroup separately
        if (field.hideExpression) {
          field.fieldGroup.forEach(f => {
            let hideExpression: any = f.hideExpression || ((model, formState) => false);
            if (typeof hideExpression === 'string') {
              hideExpression = evalStringExpression(hideExpression, ['model', 'formState']);
            }

            f.hideExpression = (model, formState) => field.hide || hideExpression(model, formState);
          });
        }

        this._initFields(field.fieldGroup as any, options);
      }
    });
  }

  private _checkFields(form: FormGroup | FormArray, fields: FormlyFieldConfigCache[] = [], options: FormlyFormOptions) {
    fields.forEach(field => {
      this.checkFieldExpressionChange(form, field, options);
      this.checkFieldVisibilityChange(form, field, options);

      if (field.fieldGroup && field.fieldGroup.length > 0) {
        this._checkFields(field.formControl ? <FormGroup> field.formControl : form, field.fieldGroup as any, options);
      }
    });
  }

  private checkFieldExpressionChange(form: FormGroup | FormArray, field: FormlyFieldConfigCache, options: FormlyFormOptions) {
    if (!field || !field._expressionProperties) {
      return;
    }

    const expressionProperties = field._expressionProperties;
    const validators = FORMLY_VALIDATORS.map(v => `templateOptions.${v}`);

    for (const key in expressionProperties) {
      const expressionValue = evalExpression(expressionProperties[key].expression, { field }, [field.model, options.formState]);

      if (
        expressionProperties[key].expressionValue !== expressionValue
        && (!isObject(expressionValue) || JSON.stringify(expressionValue) !== JSON.stringify(expressionProperties[key].expressionValue))
      ) {
        expressionProperties[key].expressionValue = expressionValue;
        evalExpression(
          expressionProperties[key].expressionValueSetter,
          { field },
          [expressionValue, field.model, field],
        );

        if (key.indexOf('model.') === 0) {
          const path = key.replace(/^model\./, ''),
            control = field.key && key === path ? field.formControl : form.get(path);

          if (
            control
            && !(isNullOrUndefined(control.value) && isNullOrUndefined(expressionValue))
            && control.value !== expressionValue
          ) {
            control.patchValue(expressionValue);
          }
        }

        if (validators.indexOf(key) !== -1 && field.formControl) {
          field.formControl.updateValueAndValidity({ emitEvent: false });
        }
      }
    }
  }

  private checkFieldVisibilityChange(form: FormGroup | FormArray, field: FormlyFieldConfig, options: FormlyFormOptions) {
    if (!field || isNullOrUndefined(field.hideExpression)) {
      return;
    }

    const hideExpressionResult: boolean = !!evalExpression(
      field.hideExpression,
      { field },
      [field.model, options.formState],
    );

    if (hideExpressionResult !== field.hide) {
      // toggle hide
      field.hide = hideExpressionResult;
      field.templateOptions.hidden = hideExpressionResult;

      if (field.formControl && field.key) {
        const parent = this.fieldParentFormControl(form, field);
        if (parent) {
          const control = parent.get(`${this.fieldKey(field)}`);
          if (hideExpressionResult === true && control) {
            this.removeFieldControl(parent, field);
          } else if (hideExpressionResult === false && !control) {
            this.addFieldControl(parent, field);
          }
        }
      }

      if (options.fieldChanges) {
        options.fieldChanges.next(<FormlyValueChangeEvent> { field: field, type: 'hidden', value: hideExpressionResult });
      }
    }
  }

  private addFieldControl(parent: FormArray | FormGroup, field: FormlyFieldConfig) {
    const fieldModel = field.fieldGroup || field.fieldArray ? field.model : getFieldModel(field.model, field, false);
    if (
      !(isNullOrUndefined(field.formControl.value) && isNullOrUndefined(fieldModel))
      && field.formControl.value !== fieldModel
    ) {
      field.formControl.patchValue(fieldModel, { emitEvent: false });
    }

    if (parent instanceof FormArray) {
      parent.push(field.formControl);
    } else if (parent instanceof FormGroup) {
      parent.addControl(`${this.fieldKey(field)}`, field.formControl);
    }
  }

  private removeFieldControl(parent: FormArray | FormGroup, field: FormlyFieldConfig) {
    if (parent instanceof FormArray) {
      parent.removeAt(this.fieldKey(field) as number);
    } else if (parent instanceof FormGroup) {
      parent.removeControl(`${this.fieldKey(field)}`);
    }
  }

  private fieldParentFormControl(form: FormGroup | FormArray, field: FormlyFieldConfig): FormArray | FormGroup {
    const paths = getKeyPath(field);
    paths.pop(); // remove last path

    return (paths.length > 0 ? form.get(paths) : form) as any;
  }

  private fieldKey(field: FormlyFieldConfig) {
    return getKeyPath(field).pop();
  }
}
