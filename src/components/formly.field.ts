import {
  Component, OnInit, Input, Output, EventEmitter, ElementRef,
  ViewContainerRef, ViewChild, ComponentRef, SimpleChange, OnChanges, Renderer
} from "@angular/core";
import {FormlyCommon} from "./formly.common.component";
import {FormlyPubSub, FormlyEventEmitter, FormlyValueChangeEvent} from "../services/formly.event.emitter";
import {FormlyFieldBuilder} from "../services/formly.field.builder";
import {FormlyConfig} from "../services/formly.config";
import {Field} from "../templates/field";

@Component({
  selector: "formly-field",
  template: `
        <template #child></template>
        <div *ngIf="field.template && !field.fieldGroup" [innerHtml]="field.template"></div>

        <formly-field *ngFor="let f of field.fieldGroup"
          [hide]="f.hideExpression"
          [model]="model?(f.key ? model[f.key]: model):''"
          [form]="form" [field]="f" [formModel] = "formModel"
          (changeFn)="changeFunction($event, f)" [eventEmitter]="eventEmitter"
          [ngClass]="f.className">
        </formly-field>
    `,
  inputs: ["field", "formModel", "form", "hide", "model", "key", "eventEmitter"],
  outputs: ["formSubmit", "changeFn", "eventEmitter"]
})
export class FormlyField extends FormlyCommon implements OnInit, OnChanges {

  eventEmitter;

  // Outputs
  changeFn: EventEmitter<any> = new EventEmitter();

  update;

  // FIXME: See https://github.com/formly-js/ng2-formly/issues/45; This is a temporary fix.
  modelUpdateEmitter: EventEmitter<any> = new EventEmitter();

  @ViewChild("child", {read: ViewContainerRef}) myChild: ViewContainerRef;
  private childFieldRef: ComponentRef<Field>;

  constructor(elem: ElementRef, ps: FormlyPubSub, protected fb: FormlyFieldBuilder,
              formlyConfig: FormlyConfig, renderer: Renderer) {
    super(elem, ps, formlyConfig, renderer);
  }

  ngOnInit() {
    this.createChildFields();
  }

  createChildFields() {
    if (this.field && !this.field.template && !this.field.fieldGroup) {
      this.update = new FormlyEventEmitter();
      this.childFieldRef = this.fb.createChildFields(this.field, this, this.formlyConfig);
      this.childFieldRef.instance.modelUpdateReceiver = this.modelUpdateEmitter;
      this.childFieldRef.instance.changeFn.subscribe((event) => {
        this.changeFunction(event, this.field);
      });
      this.ps.setEmitter(this.field.key, this.update);
    }
  }

  changeFunction(event: FormlyValueChangeEvent, field) {
    if (this.field.key && this.field.key === event.key) {
      this._model = event.value;
      this.changeFn.emit(event);
      this.formSubmit.emit(event);
    } else if (this.field.key && this.field.key !== event.key) {
      if (!this._model) {
        this.model = {};
      }
      this._model[event.key] = event.value;
      this.changeFn.emit(new FormlyValueChangeEvent(this.field.key, this._model));
      this.formSubmit.emit(event);
    } else {
      this.changeFn.emit(event);
      this.formSubmit.emit(event);
    }
  }

  ngOnChanges(changes: {
    [key: string]: SimpleChange;
  }): any {
    if (changes["model"]) {
      // FIXME: See https://github.com/formly-js/ng2-formly/issues/45. This is a temporary fix.
      this.modelUpdateEmitter.emit(changes["model"].currentValue);
    }
  }
}
