import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HelperRetro } from '../shared/helper.common';
import { SprintPlanning } from '../shared/models/sprintPlanning.model';
import { SprintPlanningService } from '../shared/sprint-planning.service';
import * as signalR from '@microsoft/signalr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HubConnection } from '@microsoft/signalr';

@Component({
  selector: 'app-data-board',
  templateUrl: './data-board.component.html',
  styleUrls: ['./data-board.component.css'],
})
export class DataBoardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() headerData: string;
  @Input() Admin: boolean;
  @Input() userName: string;

  headerDataDecrypted: any;
  headerDataDecoded: any;
  employer: string = '';
  team: string = '';
  sprintNumber: string = '';
  selectedPoints: string = '';

  adminView:boolean = false;
  showPoints: boolean = false;

  sprintPlanServiceSubscription = new Subscription();
  private hubConnection: HubConnection;

  private _sprintPlanning = new BehaviorSubject<SprintPlanning[]>([]);
  readonly sprintPlanning$ = this._sprintPlanning.asObservable();

  private sprintPlanning: SprintPlanning[] = [];
  sprintPlanningList: SprintPlanning[] = [];

  constructor(
    private sprintPlanningService: SprintPlanningService,
    private _snackBar: MatSnackBar,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.sprintPlanning = [];
    this.adminView = this.Admin;
    if (!this.changeData()) {
      return;
    }

    if (!this.Admin) {
      return;
    }

    this.sprintPlanServiceSubscription.add(
      this._sprintPlanning.subscribe((data) => {
        this.sprintPlanningList = data;
        this.changeDetector.detectChanges();
      })
    );

    this.sprintPlanServiceSubscription.add(
      this.sprintPlanningService.getSignalRConnection().subscribe((con) => {
        const options = {
          accessTokenFactory: () => con.accessToken,
        };
        this.hubConnection = new signalR.HubConnectionBuilder()
          .withUrl(con.url, options)
          .configureLogging(signalR.LogLevel.Information)
          .build();

        this.hubConnection.on('sprintPlanningTeamData', (data: any) => {
          let tempData = new SprintPlanning();
          tempData = data;
          // console.log(tempData);
          if (
            tempData.employer !== this.employer ||
            tempData.team !== this.team ||
            tempData.sprintId !== this.sprintNumber
          ) {
            return;
          }

          this.sprintPlanning.forEach((t, i) => {
            if (
              tempData.employer === t.employer &&
              tempData.team === t.team &&
              t.sprintId === t.sprintId &&
              tempData.teamMember === t.teamMember
            ) {
              this.sprintPlanning.splice(i, 1);
            }
          });

          this.sprintPlanning.push(tempData);
          this._sprintPlanning.next(this.sprintPlanning);
          //console.log(this.sprintPlanningList)
        });

        this.hubConnection
          .start()
          .catch((err) => console.error(err.toString()));
      })
    );
  }

  ngOnChanges() {
    this.sprintPlanning = [];
    this.adminView = this.Admin;
    if (!this.changeData()) {
      return;
    }

    if (!this.Admin) {
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.sprintPlanServiceSubscription) {
      this.sprintPlanServiceSubscription.unsubscribe();
    }
  }

  private async changeData(): Promise<boolean> {
    if (!this.headerData) {
      return false;
    }
    this.headerDataDecrypted = await HelperRetro.decryptHeaderData(
      this.headerData
    );
    let split = this.headerDataDecrypted.toString().split('-', 3);
    if (!split || split.length <= 0) {
      return false;
    }

    this.employer = split[0].toString().replace(/(^"|"$)/g, '');
    this.team = split[1].toString().replace(/(^"|"$)/g, '');
    this.sprintNumber = split[2].toString().replace(/(^"|"$)/g, '');
    if (!this.Admin) {
      await this.createSprintPlanningTeamMember();
    } else {
      await this.GetRetoData();
    }
    return true;
  }

  async createSprintPlanningTeamMember() {
    //alert(this.userName)
    let sprintPlanning = new SprintPlanning();
    sprintPlanning.employer = this.employer;
    sprintPlanning.team = this.team;
    sprintPlanning.points = '';
    sprintPlanning.sprintId = this.sprintNumber;
    sprintPlanning.teamMember = this.userName;

    this.sprintPlanServiceSubscription.add(
      (
        await this.sprintPlanningService.createSprintPlanningTeamMember(
          sprintPlanning
        )
      ).subscribe(
        (data) => {
          // console.log(data);
        },
        (error) => {
          console.log(error);
          this._snackBar.open(
            'there is a server exception, please contact  hosting team',
            'Dismiss',
            {
              duration: 10000,
            }
          );
        }
      )
    );
  }

  async createUpdateSprintPlanningData(points: string) {
    this.selectedPoints = `You have selected: ${points}`;

    let sprintPlanning = new SprintPlanning();
    sprintPlanning.employer = this.employer;
    sprintPlanning.team = this.team;
    sprintPlanning.points = points;
    sprintPlanning.sprintId = this.sprintNumber;
    sprintPlanning.teamMember = this.userName;

    this.sprintPlanServiceSubscription.add(
      (
        await this.sprintPlanningService.createUpdateSprintPlanningData(
          sprintPlanning
        )
      ).subscribe(
        (data) => {
          //console.log(data);
        },
        (error) => {
          console.log(error);
          this._snackBar.open(
            'there is a server exception, please contact  hosting team',
            'Dismiss',
            {
              duration: 10000,
            }
          );
        }
      )
    );
  }

  async GetRetoData() {
    this.sprintPlanServiceSubscription.add(
      (
        await this.sprintPlanningService.getSprintPlanningData(
          this.employer,
          this.team,
          this.sprintNumber
        )
      ).subscribe(
        (data: SprintPlanning[]) => {
         // console.log(data)
          this.sprintPlanning = data;
          this._sprintPlanning.next(this.sprintPlanning);
        },
        (error) => {
          this.sprintPlanning = [];
          console.log(error);
        }
      )
    );
  }

  Flip(){
    //alert(this.showPoints)
    if(!this.showPoints){
      this.showPoints = true;
    }
  }

  Reset(){
    if(!this.showPoints){
      return;
    }
    this.showPoints = false;
    this.sprintPlanning.forEach(element => {
      element.points = '0';
    });
  }
}
