import {NgModule, Component} from "@angular/core";
import {FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup} from "@angular/forms";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {BrowserModule} from "@angular/platform-browser";
import {FormlyModule, FormlyMessages, FormlyConfig, FormlyFieldConfig} from "./../src/core";
import {FormlyBootstrap, FormlyBootstrapModule} from "./../src/templates/formlyBootstrap";
import {Field, SingleFocusDispatcher} from "./../src/templates";
import {ValidationService} from "./validation.service";

// Custom Input Field type 'toggle' Component Definition
@Component({
  selector: "formly-field-toggle",
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
  constructor(focusDispatcher: SingleFocusDispatcher) {
    super(focusDispatcher);
  }
}

@Component({
  selector: "formly-demo-hello-app",
  templateUrl: "../demo/template.html",
})
export class HelloApp {
  form: FormGroup;
  author;
  env;
  _user;
  user: any = {};
  private userFields: Array<FormlyFieldConfig> = [];

  constructor(fm: FormlyMessages, fc: FormlyConfig, formlyBootstrap: FormlyBootstrap, protected fb: FormBuilder) {

    if (!this.form) {
      this.form = this.fb.group({});
    }

    fm.addStringMessage("required", "This field is required.");
    fm.addStringMessage("invalidEmailAddress", "Invalid Email Address");
    fm.addStringMessage("maxlength", "Maximum Length Exceeded.");
    fm.addStringMessage("minlength", "Should have atleast 2 Characters");

    this.author = {
      name: "Mohammed Zama Khan",
      url: "https://www.github.com/mohammedzamakhan"
    };
    this.env = {
      angularVersion: "2.0.0-rc.1",
      formlyVersion: "2.0.0-beta.5"
    };
    fc.setType({
      name: "toggle",
      component: FormlyFieldToggle
    });

    setTimeout(() => {

      this.userFields = [{
        type: "radio",
        key: "title",
        templateOptions: {
          options: [{
            key: "mr",
            value: "Mr."
          }, {
            key: "mrs",
            value: "Mrs"
          }],
          label: "Title",
          description: "Select a title that suits your description"
        }
      }, {
        className: "row",
        fieldGroup: [{
          className: "col-xs-4",
          key: "email",
          type: "input",
          templateOptions: {
            type: "email",
            label: "Email address",
            placeholder: "Enter email",
            disabled: true
          },
          validation: Validators.compose([Validators.required, ValidationService.emailValidator]),
          expressionProperties: {
            "templateOptions.disabled": "!model.password"
          }
        }, {
          className: "col-xs-4",
          key: "password",
          type: "input",
          templateOptions: {
            type: "password",
            label: "Password",
            placeholder: "Password"
          },
          validation: Validators.compose([Validators.required, Validators.maxLength(10), Validators.minLength(2)])
        }, {
          className: "col-xs-4",
          key: "select",
          type: "select",
          templateOptions: {
            options: [{
              label: "Male",
              value: "male"
            }, {
              label: "Female",
              value: "female"
            }],
            label: "Gender",
            placeholder: "Select Gender"
          }
        }]
      }, {
        className: "section-label",
        template: "<hr/><div><strong>Address:</strong></div>"
      }, {
        key: "address",
        className: "row",
        fieldGroup: [{
          className: "col-xs-6",
          type: "input",
          key: "street",
          templateOptions: {
            label: "Street",
            placeholder: "604 Causley Ave. ",
            description: "Enter a valid US Address"
          }
        }, {
          className: "col-xs-3",
          type: "input",
          key: "city",
          templateOptions: {
            label: "City",
            placeholder: "Arlington"
          }
        }, {
          className: "col-xs-3",
          type: "input",
          key: "zip",
          templateOptions: {
            type: "number",
            label: "Zip",
            placeholder: "76010"
          }
        }]
      }, {
        key: "checked",
        type: "checkbox",
        templateOptions: {
          label: "Check me out",
          description: "If you want to check me out, check this box"
        }
      }, {
        type: "multicheckbox",
        key: "interest",
        templateOptions: {
          options: [{
            key: "sports",
            value: "Sports"
          }, {
            key: "movies",
            value: "Movies"
          }, {
            key: "others",
            value: "Others"
          }],
          label: "Interest",
          description: "Select areas which you are interested"
        }
      }, {
        key: "otherInterest",
        type: "textarea",
        hideExpression: "!model.interest.others",
        templateOptions: {
          rows: 5,
          cols: 20,
          placeholder: "Type a paragraph about your interest...",
          label: "Other Interest"
        }
      }, {
        key: "textAreaVal",
        type: "textarea",
        templateOptions: {
          rows: 5,
          cols: 20,
          placeholder: "Type a paragraph...",
          label: "Message",
          description: "Please enter atleast 150 characters",
          focus: true
        }
      }, {
        key: "toggleVal",
        type: "toggle",
        templateOptions: {

        }
      }];

      this.user = {
        email: "email@gmail.com",
        checked: true,
        select: "male",
        title: "mr",
        toggleVal: true,
        interest: {
          "movies": false,
          "sports": false,
          "others": true
        }
      };
    }, 0);
  }

  console(data) {
    console.log(data);
  }

  showEmail() {
    this.form.get("email").setValue("mohammedzamakhan");
    this.form.get("checked").setValue(!this.user.checked);
  }

  hide() {
    this.userFields[1].fieldGroup[0].hideExpression = !this.userFields[1].fieldGroup[0].hideExpression;
  }

  changeEmail(value) {
    this.form.get("email").setValue(value);
  }

  resetForm() {
    this.form.reset({
      email: "email@gmail.com",
      checked: true,
      select: "male",
      title: "mr",
      toggleVal: true,
      interest: {
        "movies": false,
        "sports": false,
        "others": true
      }
    });
  }

  submit(user) {
    console.log(user);
  }
}

@NgModule({
  declarations: [
    HelloApp, FormlyFieldToggle
  ],
  imports: [
    BrowserModule,
    FormlyModule,
    FormlyBootstrapModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  entryComponents: [
    FormlyFieldToggle,
  ],
  bootstrap: [HelloApp]
})
export class FormlyDemoModule {
}

platformBrowserDynamic().bootstrapModule(FormlyDemoModule);
