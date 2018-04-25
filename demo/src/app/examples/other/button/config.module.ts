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
            title: 'Buttons',
            description: `
              This demonstrates a type for buttons. Specifically using bootstrap but this could easily be adapted for other frameworks
            `,
            component: AppComponent,
            files: [
              { file: 'app.component.html', content: require('!!prismjs-loader?lang=html!./app.component.html') },
              { file: 'app.component.ts', content: require('!!prismjs-loader?lang=typescript!./app.component.ts') },
              { file: 'button-type.component.ts', content: require('!!prismjs-loader?lang=typescript!./button-type.component.ts') },
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
