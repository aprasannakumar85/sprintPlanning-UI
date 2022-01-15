import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from 'src/environments/constants';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { SprintPlanning } from './models/sprintPlanning.model';

@Injectable({
  providedIn: 'root'
})
export class SprintPlanningService {
  private sprintPlanningServerAPI = `${Constants.PLANNING_SERVER_API_PATH_BASE}`;

  constructor(private http: HttpClient) {
  }

  getSignalRConnection(): Observable<any> {
    return this.http.get<any>(`${this.sprintPlanningServerAPI}negotiate`)
    .pipe(catchError(this.handleError));
  }

  async getSprintPlanningData(employer: string, team: string, sprintId: string): Promise<Observable<any>> {
    return this.http
      .get<SprintPlanning[]>(`${this.sprintPlanningServerAPI}getSprintPlanningData/${employer}/${team}/${sprintId}`)
      .pipe(catchError(this.handleError));
  }

  async createUpdateSprintPlanningData(sprintPlanningData: SprintPlanning): Promise<Observable<SprintPlanning>> {
    return this.http
      .post<SprintPlanning>(`${this.sprintPlanningServerAPI}createSprintPlan`, sprintPlanningData)
      .pipe(catchError(this.handleError));
  }

  async createSprintPlanningTeamMember(sprintPlanningData: SprintPlanning): Promise<Observable<SprintPlanning>> {
    return this.http
      .post<SprintPlanning>(`${this.sprintPlanningServerAPI}createSprintPlanTeamMember`, sprintPlanningData)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}, body was: ${err.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
