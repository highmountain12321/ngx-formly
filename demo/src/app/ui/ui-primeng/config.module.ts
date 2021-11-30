import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExamplesRouterViewerComponent } from '../../shared';
import { CommonModule, CommonExampleConfigs, CommonExampleComponents, debugFields } from '../common';

import { AppComponent } from './app.component';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

@NgModule({
  imports: [
    CommonModule,
    FormlyPrimeNGModule,
    RouterModule.forChild([
      {
        path: '',
        component: AppComponent,
        children: [
          {
            path: '',
            component: ExamplesRouterViewerComponent,
            data: {
              debugFields,
              examples: [...CommonExampleConfigs],
            },
          },
        ],
      },
    ]),
  ],
  declarations: [AppComponent],
  entryComponents: [AppComponent, ...CommonExampleComponents],
})
export class ConfigModule {}
