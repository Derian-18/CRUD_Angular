import { Routes } from '@angular/router';
import { ProductoCrudComponent } from './components/crud.component';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' }, // Redirige la raíz a /productos
  { path: 'productos', component: ProductoCrudComponent },  // Define la ruta /productos
  { path: '**', redirectTo: 'productos' }                   // Captura cualquier otra ruta inválida
];