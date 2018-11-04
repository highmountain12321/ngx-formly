import {
  Component, EventEmitter, Input, Output,
  ViewContainerRef, ViewChild, ComponentRef, SimpleChanges, Attribute, ComponentFactoryResolver,
  OnInit, OnChanges, OnDestroy, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfig } from '../services/formly.config';
import { FormlyFieldConfig, FormlyFormOptions, FormlyFieldConfigCache } from './formly.field.config';
import { FieldWrapper } from '../templates/field.wrapper';
import { defineHiddenProp } from '../utils';

@Component({
  selector: 'formly-field',
  template: `<ng-template #container></ng-template>`,
  host: {
    '[style.display]': 'field.hide ? "none":""',
    '[class]': 'field.className? field.className : className',
  },
})
export class FormlyField implements OnInit, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {
  @Input() field: FormlyFieldConfig;
  @Input('class') className: string = '';

  warnDeprecation = false;

  @Input() set model(m: any) {
    this.warnDeprecation && console.warn(`NgxFormly: passing 'model' input to '${this.constructor.name}' component is not required anymore, you may remove it!`);
  }

  @Input() set form(form: FormGroup) {
    this.warnDeprecation && console.warn(`NgxFormly: passing 'form' input to '${this.constructor.name}' component is not required anymore, you may remove it!`);
  }

  @Input() set options(options: FormlyFormOptions) {
    this.warnDeprecation && console.warn(`NgxFormly: passing 'options' input to '${this.constructor.name}' component is not required anymore, you may remove it!`);
  }

  @Output() modelChange: EventEmitter<any> = new EventEmitter();
  @ViewChild('container', {read: ViewContainerRef}) containerRef: ViewContainerRef;

  get componentRefs(): ComponentRef<any>[] {
    if (!(<FormlyFieldConfigCache> this.field)._componentRefs) {
      defineHiddenProp(this.field, '_componentRefs', []);
    }

    return (<FormlyFieldConfigCache> this.field)._componentRefs;
  }

  set componentRefs(refs: ComponentRef<any>[]) {
    (<FormlyFieldConfigCache> this.field)._componentRefs = refs;
  }

  constructor(
    private formlyConfig: FormlyConfig,
    private componentFactoryResolver: ComponentFactoryResolver,
    // tslint:disable-next-line
    @Attribute('hide-deprecation') hideDeprecation,
  ) {
    this.warnDeprecation = hideDeprecation === null;
  }

  ngAfterContentInit() {
    this.triggerHook('afterContentInit');
  }

  ngAfterContentChecked() {
    this.triggerHook('afterContentChecked');
  }

  ngAfterViewInit() {
    this.triggerHook('afterViewInit');
  }

  ngAfterViewChecked() {
    this.triggerHook('afterViewChecked');
  }

  ngDoCheck() {
    this.triggerHook('doCheck');
  }

  ngOnInit() {
    this.triggerHook('onInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.field) {
      this.renderField(this.field, this.containerRef);
    }

    this.triggerHook('onChanges', changes);
    this.componentRefs.forEach(ref => {
      Object.assign(ref.instance, { field: this.field });
    });
  }

  ngOnDestroy() {
    this.triggerHook('onDestroy');
    this.componentRefs.forEach(componentRef => componentRef.destroy());
    this.componentRefs = [];
  }

  private renderField(field: FormlyFieldConfig, containerRef: ViewContainerRef) {
    this.componentRefs.forEach(componentRef => componentRef.destroy());
    this.componentRefs = [];

    const wrappers = <any>(field.wrappers || []).map(wrapperName => this.formlyConfig.getWrapper(wrapperName));
    [...wrappers, { ...this.formlyConfig.getType(field.type), componentFactory: (<any> field)._componentFactory }].forEach(({ component, componentRef }) => {
      const ref = componentRef ? componentRef : containerRef.createComponent<FieldWrapper>(this.componentFactoryResolver.resolveComponentFactory(component));

      Object.assign(ref.instance, { field });
      this.componentRefs.push(ref);
      containerRef = ref.instance.fieldComponent;
    });
  }

  private triggerHook(name: string, changes?: SimpleChanges) {
    if (this.field.hooks && this.field.hooks[name]) {
      if (!changes || changes.field) {
        this.field.hooks[name](this.field);
      }
    }

    if (this.field.lifecycle && this.field.lifecycle[name]) {
      this.field.lifecycle[name](
        this.field.form,
        this.field,
        this.field.model,
        this.field.options,
      );
    }
  }
}
