// polyfills
import 'core-js/es6';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';

import {NgModule, Component, ViewChild, ViewContainerRef} from '@angular/core';
import {FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserModule} from '@angular/platform-browser';
import {FormlyModule, FormlyFieldConfig, FormlyBootstrapModule, Field, FieldWrapper} from './../src/index';
import {ValidationService} from './validation.service';

// Custom Input Field type 'toggle' Component Definition
@Component({
  selector: 'formly-field-toggle',
  template: `
    <div [formGroup]="form">
      <div class="checkbox-toggle">
          <input id="checkbox" type="checkbox" type="checkbox" [formControlName]="key" value="on">
          <label for="checkbox">
              <div></div>
          </label>
      </div>
  </div>
  `,
})
export class FormlyFieldToggle extends Field {
}

@Component({
  selector: 'formly-wrapper-horizontal',
  template: `
    <label attr.for="{{key}}" class="col-sm-4 form-control-label">{{templateOptions.label}}</label>
    <div class="col-sm-8">
      <template #fieldComponent></template>
    </div>
  `,
})
export class FormlyWrapperHorizontalLabel extends FieldWrapper {
  @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
}

@Component({
  selector: 'formly-demo-hello-app',
  templateUrl: './template.html',
})
export class HelloApp {
  form: FormGroup;
  author;
  env;
  _user;
  user: any = {};
  private userFields: Array<FormlyFieldConfig> = [];

  constructor(fb: FormBuilder) {
    this.form = fb.group({});

    this.author = {
      name: 'Mohammed Zama Khan',
      url: 'https://www.github.com/mohammedzamakhan'
    };
    this.env = {
      angularVersion: '2.0.1',
      formlyVersion: '2.0.0-beta.7'
    };

      this.userFields = [{
        type: 'radio',
        key: 'title',
        templateOptions: {
          options: [{
            key: 'mr',
            value: 'Mr.'
          }, {
            key: 'mrs',
            value: 'Mrs'
          }],
          label: 'Title',
          description: 'Select a title that suits your description'
        }
      }, {
        className: 'row',
        fieldGroup: [{
          className: 'col-xs-4',
          key: 'email',
          type: 'input',
          templateOptions: {
            type: 'email',
            label: 'Email address',
            placeholder: 'Enter email',
            disabled: true
          },
          validation: Validators.compose([Validators.required, ValidationService.emailValidator]),
          expressionProperties: {
            'templateOptions.disabled': '!model.password'
          }
        }, {
          className: 'col-xs-4',
          key: 'password',
          type: 'input',
          templateOptions: {
            type: 'password',
            label: 'Password',
            placeholder: 'Password'
          },
          validation: Validators.compose([Validators.required, Validators.maxLength(10), Validators.minLength(2)])
        }, {
          className: 'col-xs-4',
          key: 'confirmPassword',
          type: 'input',
          templateOptions: {
            type: 'password',
            label: 'Password',
            placeholder: 'Confirm Password'
          },
          validation: ValidationService.confirmPassword(this.form, 'password')
        }, {
          className: 'section-label',
          template: '<br/><hr/>'
        }, {
          className: 'col-xs-4',
          key: 'select',
          type: 'select',
          templateOptions: {
            options: [{
              label: 'Male',
              value: 'male'
            }, {
              label: 'Female',
              value: 'female'
            }],
            label: 'Gender',
            placeholder: 'Select Gender'
          }
        }]
      }, {
        className: 'section-label',
        template: '<hr/><div><strong>Address:</strong></div>'
      }, {
        key: 'address',
        className: 'row',
        fieldGroup: [{
          className: 'col-xs-6',
          type: 'input',
          key: 'street',
          validation: ['required'],
          templateOptions: {
            label: 'Street',
            placeholder: '604 Causley Ave. ',
            description: 'Enter a valid US Address'
          }
        }, {
          className: 'col-xs-3',
          type: 'input',
          key: 'city',
          templateOptions: {
            label: 'City',
            placeholder: 'Arlington'
          }
        }, {
          className: 'col-xs-3',
          type: 'input',
          key: 'zip',
          templateOptions: {
            type: 'number',
            label: 'Zip',
            placeholder: '76010'
          }
        }]
      }, {
        key: 'checked',
        type: 'checkbox',
        templateOptions: {
          label: 'Check me out',
          description: 'If you want to check me out, check this box'
        }
      }, {
        type: 'multicheckbox',
        key: 'interest',
        templateOptions: {
          options: [{
            key: 'sports',
            value: 'Sports'
          }, {
            key: 'movies',
            value: 'Movies'
          }, {
            key: 'others',
            value: 'Others'
          }],
          label: 'Interest',
          description: 'Select areas which you are interested'
        }
      }, {
        key: 'otherInterest',
        type: 'horizontalInput',
        hideExpression: '!model.interest.others',
        templateOptions: {
          rows: 5,
          cols: 20,
          placeholder: 'Type a paragraph about your interest...',
          label: 'Other Interest'
        }
      }, {
        key: 'textAreaVal',
        type: 'textarea',
        modelOptions: {
          debounce: {
            default: 2000,
            blur: 0
          },
          updateOn: 'default blur'
        },
        templateOptions: {
          rows: 5,
          cols: 20,
          label: 'Message (Type a paragraph...)',
          description: 'Please enter atleast 150 characters',
          focus: true
        }
      }, {
        key: 'toggleVal',
        type: 'toggle',
        templateOptions: {

        }
      }, {
        className: 'section-label',
        template: '<hr/><div><strong>Nested property keys:</strong></div>'
      }, {
        key: 'nested.property.magic',
        type: 'input',
        templateOptions: {
          label: 'Nested property'
        }
      }, {
        key: 'nested.arrays.0',
        type: 'input',
        templateOptions: {
          label: 'Array property'
        }
      },
    ];

      this.user = {
        email: 'email@gmail.com',
        checked: true,
        select: 'male',
        title: 'mr',
        toggleVal: true,
        address: {
          street: '604 Causley Eve'
        },
        interest: {
          movies: false,
          sports: false,
          others: true
        }
      };
  }

  console(data) {
    console.log(data);
  }

  showEmail() {
    this.form.get('email').setValue('mohammedzamakhan');
    this.form.get('checked').setValue(!this.user.checked);
  }

  hide() {
    this.userFields[1].fieldGroup[0].hideExpression = !this.userFields[1].fieldGroup[0].hideExpression;
  }

  changeEmail(value) {
    this.form.get('email').setValue(value);
  }

  resetForm() {
    this.form.reset({
      email: 'email@gmail.com',
      checked: true,
      select: 'male',
      title: 'mr',
      toggleVal: true,
      interest: {
        movies: false,
        sports: false,
        others: true
      }
    });
  }

  submit(user) {
    console.log(user);
  }
}

@NgModule({
  declarations: [
    HelloApp, FormlyFieldToggle, FormlyWrapperHorizontalLabel
  ],
  imports: [
    BrowserModule,
    FormlyModule.forRoot({
      types: [
        { name: 'toggle', component: FormlyFieldToggle },
        { name: 'horizontalInput', extends: 'input', wrappers: ['formly-wrapper-horizontal']}],
      validators: [{ name: 'required', validation: Validators.required}],
      validationMessages: [
        { name: 'required', message: 'This field is required.' },
        { name: 'invalidEmailAddress', message: 'Invalid Email Address' },
        { name: 'maxlength', message: 'Maximum Length Exceeded.' },
        { name: 'minlength', message: (err) => {
            return `Should have atleast ${err.requiredLength} Characters`;
          }
        },
        { name: 'not_matching', message: 'Password Not Matching' },
      ],
      wrappers: [
        { name: 'formly-wrapper-horizontal', component: FormlyWrapperHorizontalLabel }
      ]
    }),
    FormlyBootstrapModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  bootstrap: [HelloApp]
})
export class FormlyDemoModule {
}

platformBrowserDynamic().bootstrapModule(FormlyDemoModule);
