import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrugPage } from './drug.page';

const routes: Routes = [
  {
    path: '',
    component: DrugPage
  },
  {
    path: 'insert',
    loadChildren: () => import('./insert/insert.module').then( m => m.InsertPageModule)
  },
  {
    path: 'detail',
    loadChildren: () => import('./detail/detail.module').then( m => m.DetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrugPageRoutingModule {}
