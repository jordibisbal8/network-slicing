import {HomeComponent} from "./home/home.component";
import {AppRoutingModule} from "./app-routing.module";
import {VirtualNetworkListComponent} from "./virtual-network/virtual-network-list.component";

import '../styles/styles.scss';
import {MaterialModule} from "@angular/material";
import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./auth/register/register.component";
import {Ng2CompleterModule} from "ng2-completer";
import {LoginComponent} from "./auth/login/login.component";
import {AuthService} from "./auth/auth.service";
import {CheckSignatureDialogComponent} from "./auth/login/check-signature.dialog.component";
import {VirtualNetworkRequestComponent} from "./virtual-network/virtual-network-request";
import {ShowAddressDialogComponent} from "./auth/register/show-address.dialog.component";
import {ClipboardModule} from "ngx-clipboard/dist";
import {VirtualNodeDialogComponent} from "./virtual-network/dialogs/virtual-node.dialog.component";
import {HttpClient} from "./http-client.component";
import {VirtualNetworkTileComponent} from "./virtual-network/virtual-network-tile.component";
import {ContactComponent} from "./contact/contact.component";
import {ProjectHeaderComponent} from "./project-header";
import {VirtualNetworkDetailComponent} from "./virtual-network/virtual-network-detail.component";
import {AngularDateTimePickerModule} from "angular2-datetimepicker";
import {AuctionComponent} from "./auction/auction.component";
import {AuctionService} from "./services/auction-service";
import {SettingsComponent} from "./settings/settings.component";
import {SubstrateNetworkComponent} from "./substrate-network/substrate-network.component";
import {PeeringNodeDialogComponent,} from "./substrate-network/dialogs/peering-node.dialog.component";
import {SubstrateNetworkService} from "./services/substrate-network.service";
import {VirtualNetworkService} from "./services/virtual-network.service";
import {AuctionResultDialogComponent} from "./virtual-network/dialogs/auction-result.dialog.component";
import {EvaluationComponent} from "./evaluation/evaluation.component";
import {EvaluationService} from "./services/evaluation-service";


@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    AuctionComponent,
    AuctionResultDialogComponent,
    CheckSignatureDialogComponent,
    ContactComponent,
    EvaluationComponent,
    HomeComponent,
    LoginComponent,
    PeeringNodeDialogComponent,
    ProjectHeaderComponent,
    RegisterComponent,
    SettingsComponent,
    SubstrateNetworkComponent,
    ShowAddressDialogComponent,
    VirtualNetworkDetailComponent,
    VirtualNetworkListComponent,
    VirtualNetworkRequestComponent,
    VirtualNodeDialogComponent,
    VirtualNetworkTileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2CompleterModule,
    MaterialModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    AngularDateTimePickerModule,
    ClipboardModule
  ],
  // expose our Services and Providers into Angular's dependency injection
  providers: [AuthService, AuctionService, EvaluationService, HttpClient, SubstrateNetworkService, VirtualNetworkService],
  entryComponents: [CheckSignatureDialogComponent, ShowAddressDialogComponent, PeeringNodeDialogComponent,
                    VirtualNodeDialogComponent, AuctionResultDialogComponent],
})
export class AppModule { }
