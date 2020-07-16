import { Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'formly-field-mat-toggle',
  template: `
    <mat-slide-toggle
      [id]="id"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [color]="to.color"
      [tabindex]="to.tabindex"
      [required]="to.required"
      (change)="change($event)"
    >
      {{ to.label }}
    </mat-slide-toggle>
  `,
})
export class FormlyToggleTypeComponent extends FieldType {
  @ViewChild(MatSlideToggle) slideToggle!: MatSlideToggle;
  defaultOptions = {
    templateOptions: {
      hideFieldUnderline: true,
      floatLabel: 'always',
      hideLabel: true,
    },
  };

  onContainerClick(event: MouseEvent): void {
    this.slideToggle.focus();
    super.onContainerClick(event);
  }

  change($event: MatSlideToggleChange) {
    if (this.to.change) {
      this.to.change(this.field, $event);
    }
  }
}
