import { FormlyExtension, FormlyConfig, TemplateManipulators } from '../../services/formly.config';
import { FormlyFieldConfigCache, FormlyFieldConfig } from '../../components/formly.field.config';
import { FormGroup, FormArray } from '@angular/forms';
import { getFieldId, assignModelValue, isUndefined, clone, removeFieldControl, getFieldValue } from '../../utils';

/** @experimental */
export class CoreExtension implements FormlyExtension {
  private formId = 0;
  constructor(private formlyConfig: FormlyConfig) { }

  prePopulate(field: FormlyFieldConfigCache) {
    this.formlyConfig.createComponentInstance(field);
    this.getFieldComponentInstance(field).prePopulate();
    if (field.parent) {
      return;
    }

    const fieldTransforms = (field.options && field.options.fieldTransform) || this.formlyConfig.extras.fieldTransform;
    (Array.isArray(fieldTransforms) ? fieldTransforms : [fieldTransforms]).forEach(fieldTransform => {
      if (fieldTransform) {
        console.warn(`NgxFormly: fieldTransform is deprecated since v5.0, use custom extension instead.`);
        const fieldGroup = fieldTransform(field.fieldGroup, field.model, <FormGroup>field.formControl, field.options);
        if (!fieldGroup) {
          throw new Error('fieldTransform must return an array of fields');
        }
      }
    });
  }

  onPopulate(field: FormlyFieldConfigCache) {
    this.initFieldOptions(field);
    this.getFieldComponentInstance(field).onPopulate();
    if (field.fieldGroup) {
      field.fieldGroup.forEach((f, index) => {
        Object.defineProperty(f, 'parent', { get: () => field, configurable: true });
        Object.defineProperty(f, 'index', { get: () => index, configurable: true });
        this.formId++;
      });
    }
  }

  postPopulate(field: FormlyFieldConfigCache) {
    this.getFieldComponentInstance(field).postPopulate();
  }

  private initFieldOptions(field: FormlyFieldConfigCache) {
    const root = <FormlyFieldConfigCache> field.parent;
    if (!root) {
      return;
    }

    Object.defineProperty(field, 'form', { get: () => root.formControl, configurable: true });
    Object.defineProperty(field, 'options', { get: () => root.options, configurable: true });
    Object.defineProperty(field, 'model', {
      get: () => field.key && field.fieldGroup ? getFieldValue(field) : root.model,
      configurable: true,
    });

    field.id = getFieldId(`formly_${this.formId}`, field, field['index']);
    field.templateOptions = field.templateOptions || {};
    field.modelOptions = field.modelOptions || {};
    field.hooks = field.hooks || {};
    if (field.lifecycle) {
      console.warn(`NgxFormly: 'lifecycle' is deprecated since v5.0, use 'hooks' instead.`);
    }

    if (field.type && field.key) {
      field.templateOptions = Object.assign({
        label: '',
        placeholder: '',
        focus: false,
      }, field.templateOptions);
    }

    if (field.template && field.type !== 'formly-template') {
      if (field.type) {
        console.warn(`NgxFormly: passing 'type' property is not allowed when 'template' is set.`);
      }
      field.type = 'formly-template';
    }

    if (field.type) {
      this.formlyConfig.getMergedField(field);
    }
    if (field.key && isUndefined(field.defaultValue) && (field.fieldGroup || field.fieldArray)) {
      field.defaultValue = field.fieldArray ? [] : {};
    }

    if (!isUndefined(field.defaultValue) && isUndefined(getFieldValue(field))) {
      assignModelValue(root.model, field.key, field.defaultValue);
    }

    this.initFieldWrappers(field);
    if (field.fieldArray) {
      this.initFieldArray(field);
    }

    if (!field.type && field.fieldGroup) {
      field.type = 'formly-group';
    }
  }

  private initFieldArray(field: FormlyFieldConfigCache) {
    field.fieldGroup = field.fieldGroup || [];
    if (field.fieldGroup.length > field.model.length) {
      for (let i = field.fieldGroup.length; i >= field.model.length; --i) {
        removeFieldControl(field.formControl as FormArray, i);
        field.fieldGroup.splice(i, 1);
      }
    }

    for (let i = field.fieldGroup.length; i < field.model.length; i++) {
      const f = { ...clone(field.fieldArray), key: `${i}` };
      field.fieldGroup.push(f);
    }
  }

  private initFieldWrappers(field: FormlyFieldConfig) {
    field.wrappers = field.wrappers || [];
    const fieldTemplateManipulators: TemplateManipulators = {
      preWrapper: [],
      postWrapper: [],
      ...(field.templateOptions.templateManipulators || {}),
    };

    field.wrappers = [
      ...this.formlyConfig.templateManipulators.preWrapper.map(m => m(field)),
      ...fieldTemplateManipulators.preWrapper.map(m => m(field)),
      ...field.wrappers,
      ...this.formlyConfig.templateManipulators.postWrapper.map(m => m(field)),
      ...fieldTemplateManipulators.postWrapper.map(m => m(field)),
    ].filter((el, i, a) => el && i === a.indexOf(el));
  }

  private getFieldComponentInstance(field: FormlyFieldConfigCache) {
    let instance: FormlyExtension = {};
    if (field._componentFactory && field._componentFactory.componentRef) {
      instance = field._componentFactory.componentRef.instance;
    }

    return {
      prePopulate: () => instance.prePopulate && instance.prePopulate(field),
      onPopulate: () => instance.onPopulate && instance.onPopulate(field),
      postPopulate: () => instance.postPopulate && instance.postPopulate(field),
    };
  }
}
