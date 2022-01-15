import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material-module.module';
import { AdminComponent } from './admin/admin.component';
import { TeamMemberComponent } from './team-member/team-member.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { InputDataComponent } from './input-data/input-data.component';
import { DataBoardComponent } from './data-board/data-board.component';
import { RemoveQuotesPipe } from './shared/remove-quotes.pipe';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'planning/:header', component: TeamMemberComponent  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    TeamMemberComponent,
    PageNotFoundComponent,
    InputDataComponent,
    DataBoardComponent,
    RemoveQuotesPipe
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
