
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
import {Ng2CompleterModule} from "ng2-completer";
import {LoginComponent} from "./auth/login/login.component";
import {AuthService} from "./auth/auth.service";


@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ProductComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2CompleterModule,
    MaterialModule.forRoot(),
    AppRoutingModule
  ],
  // expose our Services and Providers into Angular's dependency injection
  providers: [AuthService],
  entryComponents: [],
})
export class AppModule { }
