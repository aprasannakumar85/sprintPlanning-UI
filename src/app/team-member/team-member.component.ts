import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/environments/constants';
import { InputDataComponent } from '../input-data/input-data.component';
import { EncryptDecrypt } from '../shared/crypto';
import { HelperRetro } from '../shared/helper.common';

@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styleUrls: ['./team-member.component.css']
})
export class TeamMemberComponent implements OnInit {

  userName: string = '';
  headerData: any;
  headerDataDecrypted: any;

  private randomNumber = `${Constants.RandomNumber}`;

  constructor(private dialog: MatDialog, private route: ActivatedRoute) { }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(() => {
      this.route.url.subscribe(async (urlValue: Array<any>) => {
        this.headerData = decodeURIComponent(urlValue[1].path);
       // console.log(this.headerData);
        this.headerDataDecrypted = await HelperRetro.decryptHeaderData(this.headerData);
      });
    },
    err => console.log('HTTP Error', err));

    let tempDataUserName = this.GetDataFromLocalStorage('userNameTeamMember');

    if (tempDataUserName) {
      let key: any;
      await import('crypto-js')
        .then(async (module) => {
          key = module.enc.Utf8.parse(this.randomNumber);
        })
        .catch((err) => {
          console.log(err.message);
        });

      const tempUserName = await EncryptDecrypt.decryptUsingAES256(
        tempDataUserName,
        key
      );

      this.userName = tempUserName.toString().replace(/(^"|"$)/g, '');
      //alert(this.userName)
      }else {
        await this.openDialog();
        if (this.userName && this.userName !== '') {
          // do nothing!!
        } else {
          return;
        }}
  }

  async openDialog(): Promise<any> {
    const dialogRef = this.dialog.open(InputDataComponent, {
      width: '320px',
      data: { Message: 'Please enter your name to proceed!' },
    });

    await dialogRef
      .afterClosed()
      .toPromise()
      .then(async (result) => {
        let key: any;
        await import('crypto-js')
          .then(async (module) => {
            key = module.enc.Utf8.parse(this.randomNumber);
          })
          .catch((err) => {
            console.log(err.message);
          });

        this.userName = result;
        let userNameEncrypted = await EncryptDecrypt.encryptUsingAES256(
          this.userName,
          key
        );
        this.StoreCardsLocalStorage('userNameTeamMember', userNameEncrypted);
      });
  }

  private StoreCardsLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private GetDataFromLocalStorage(key: string): any {
    let retrievedData = localStorage.getItem(key);
    if (retrievedData) {
      return JSON.parse(retrievedData);
    }
  }

  ClearCache(){
    localStorage.removeItem('userNameTeamMember');
  }
}
