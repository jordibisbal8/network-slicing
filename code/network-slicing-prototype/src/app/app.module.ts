
import {HomeComponent} from "./home/home.component";
import {AppRoutingModule} from "./app-routing.module";
import {ProductComponent} from "./product/product.component";

import '../styles/styles.scss';
import {MaterialModule} from "@angular/material";
import {HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./auth/register/register.component";

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    ProductComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    AppRoutingModule
  ],
  // expose our Services and Providers into Angular's dependency injection
  providers: [],
  entryComponents: [],
})
export class AppModule { }
