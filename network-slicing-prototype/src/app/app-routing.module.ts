import {HomeComponent} from "./home/home.component";
import {ProductComponent} from "./product/product.component";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {RegisterComponent} from "./auth/register/register.component";



export const routes: Routes = [
  { path: '', redirectTo: "/home", pathMatch: "full"},
  { path: 'home', component: HomeComponent},
  { path: 'products', component: ProductComponent},
  { path: 'register', component: RegisterComponent}

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
