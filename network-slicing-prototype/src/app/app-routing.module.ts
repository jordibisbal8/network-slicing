import {HomeComponent} from "./home/home.component";
import {VirtualNetworkComponent} from "./virtual-network/virtual-network.component";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./auth/register/register.component";
import {LoginComponent} from "./auth/login/login.component";
import {ContactComponent} from "./contact/contact.component";
import {VirtualNetworkRequestComponent} from "./virtual-network/virtual-network-request";



export const routes: Routes = [
  { path: '', redirectTo: "/home", pathMatch: "full"},
  { path: 'contact', component: ContactComponent},
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'virtual-network', component: VirtualNetworkComponent},
  { path: 'virtual-network-request', component: VirtualNetworkRequestComponent},
  { path: 'register', component: RegisterComponent},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
