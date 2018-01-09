import {HomeComponent} from "./home/home.component";
import {VirtualNetworkListComponent} from "./virtual-network/virtual-network-list.component";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./auth/register/register.component";
import {LoginComponent} from "./auth/login/login.component";
import {ContactComponent} from "./contact/contact.component";
import {VirtualNetworkRequestComponent} from "./virtual-network/virtual-network-request";
import {VirtualNetworkDetailComponent} from "./virtual-network/virtual-network-detail.component";
import {AuctionComponent} from "./auction/auction.component";
import {SettingsComponent} from "./settings/settings.component";



export const routes: Routes = [
  { path: '', redirectTo: "/home", pathMatch: "full"},
  { path: 'auction', component: AuctionComponent},
  { path: 'contact', component: ContactComponent},
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: 'settings', component: SettingsComponent},
  { path: 'virtual-network', component: VirtualNetworkListComponent},
  { path: 'virtual-network/:id', component: VirtualNetworkDetailComponent},
  { path: 'virtual-network-request', component: VirtualNetworkRequestComponent},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
