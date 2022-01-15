import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants } from 'src/environments/constants';
import { InputDataComponent } from '../input-data/input-data.component';
import { EncryptDecrypt } from '../shared/crypto';
import { HelperRetro } from '../shared/helper.common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  userName: string = '';
  employer: string = '';
  team: string = '';
  sprintNumber: string = '';
  adminMessage: string =
    'The generated URL should need to be shared with team memebers to enter the points for the stories during sprint grooming';
  newLink: string = '';

  private localAddress = '';
  private randomNumber = `${Constants.RandomNumber}`;

  headerData: any;
  headerDataDecrypted: any;
  headerDataDecoded: any;

  constructor(private dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    this.localAddress = window.location.href;

    let tempData = this.GetDataFromLocalStorage('sprintRetro');
    let tempDataUserName = this.GetDataFromLocalStorage('userName');
    if (tempData && tempDataUserName) {
      let key: any;
      await import('crypto-js')
        .then(async (module) => {
          key = module.enc.Utf8.parse(this.randomNumber);
        })
        .catch((err) => {
          console.log(err.message);
        });

      this.headerData = tempData;
      this.headerDataDecrypted = await HelperRetro.decryptHeaderData(tempData);
      this.headerDataDecoded = decodeURIComponent(this.headerData);

      const tempUserName = await EncryptDecrypt.decryptUsingAES256(
        tempDataUserName,
        key
      );

      this.userName = tempUserName.toString().replace(/(^"|"$)/g, '');

      let split = this.headerDataDecrypted.toString().split('-', 3);
      //console.log(split);
      if (split.length > 0) {
        this.employer = split[0].toString().replace(/(^"|"$)/g, '');
        this.team = split[1].toString().replace(/(^"|"$)/g, '');
        this.sprintNumber = split[2].toString().replace(/(^"|"$)/g, '');
      }
      this.headerData = encodeURIComponent(this.headerData);
      this.newLink = `${this.localAddress}planning/${this.headerData}`;
    } else {
      await this.openDialog();
      if (this.userName && this.userName !== '') {
        // do nothing!!
      } else {
        return;
      }
    }
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
        this.StoreCardsLocalStorage('userName', userNameEncrypted);
      });
  }

  async CreateLink(): Promise<void> {
    let key: any;
    await import('crypto-js')
      .then(async (module) => {
        key = module.enc.Utf8.parse(this.randomNumber);
      })
      .catch((err) => {
        console.log(err.message);
      });

    let link = await HelperRetro.encryptHeaderData(
      `${this.employer}-${this.team}-${this.sprintNumber}`
    );
    this.StoreCardsLocalStorage('sprintRetro', link);

    this.headerDataDecrypted = `${this.employer.toUpperCase()}-${this.team.toUpperCase()}-${this.sprintNumber.toUpperCase()}`;
    //console.log(link);
    this.headerData = link;
    this.headerData = encodeURIComponent(this.headerData);
    this.headerDataDecoded = link;
    this.newLink = `${this.localAddress}planning/${this.headerData}`;
  }

  CopyToClipboard(): void {
    navigator.clipboard.writeText(this.newLink);
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

  alphaNumberOnly (e: { charCode: number; which: number; preventDefault: () => void; }) {
    // Accept only alpha numerics, not special characters
    var regex = new RegExp("^[a-zA-Z0-9. ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }

    e.preventDefault();
    return false;
  }

  onPaste(e: { preventDefault: () => void; }) {
    e.preventDefault();
    return false;
  }

  ClearCache(){
    localStorage.removeItem('sprintRetro');
    localStorage.removeItem('userName');
    this.headerDataDecrypted = '';
    this.headerData = '';
    this.headerData = '';
    this.headerDataDecoded = '';
    this.newLink = '';
    this.employer = '';
    this.team = '';
    this.sprintNumber = '';
  }
}
