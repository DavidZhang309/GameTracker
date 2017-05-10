import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TestAppComponent }  from './test-app.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ TestAppComponent ],
  bootstrap:    [ TestAppComponent ]
})
export class TestAppModule { }
