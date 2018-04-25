import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule, ExamplesRouterViewerComponent } from '../../../shared';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    SharedModule,
    AppModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExamplesRouterViewerComponent,
        data: {
          examples: [{
            title: 'Expression Properties',
            description: `Expression Properties allows you to dynamically change many properties of a field.`,
            component: AppComponent,
            files: [
              { file: 'app.component.html', content: require('!!prismjs-loader?lang=html!./app.component.html') },
              { file: 'app.component.ts', content: require('!!prismjs-loader?lang=typescript!./app.component.ts') },
              { file: 'app.module.ts', content: require('!!prismjs-loader?lang=typescript!./app.module.ts') },
            ],
          }],
        },
      },
    ]),
  ],
  entryComponents: [AppComponent],
})
export class ConfigModule { }
