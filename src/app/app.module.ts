import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), 
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyDWt6y4laxeTBq2RYDY6Jg4_pOkdxwsjUE",
      authDomain: "directed-sonar-241507.firebaseapp.com",
      databaseURL: "https://directed-sonar-241507.firebaseio.com",
      projectId: "directed-sonar-241507",
      storageBucket: "directed-sonar-241507.appspot.com",
      messagingSenderId: "816396321770",
      appId: "1:816396321770:web:193e84ee21b16d41"
    }, 'Petcoffee'), // imports firebase/app needed for everything
    // AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireStorageModule // imports firebase/storage only needed for storage features

  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
