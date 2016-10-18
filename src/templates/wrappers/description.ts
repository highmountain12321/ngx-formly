import {Component, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '../field.wrapper';

@Component({
  selector: 'formly-wrapper-description',
  template: `
    <template #fieldComponent></template>
    <div>
      <small class="text-muted">{{templateOptions.description}}</small>
    </div>
  `,
})
export class FormlyWrapperDescription extends FieldWrapper {
  @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
}
