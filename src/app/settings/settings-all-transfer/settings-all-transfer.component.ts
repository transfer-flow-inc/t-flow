import { Component, OnInit } from '@angular/core';
import { HttpClientService } from "../../../services/http-client/http-client.service";
import { JwtTokenService } from "../../../services/jwt-token/jwt-token.service";
import { environment } from "../../../environments/environment";
import { FolderInterface } from "../../../interfaces/Files/folder-interface";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import {FormatSizeService} from "../../../services/format-size-file/format-size.service";
import {ThemeService} from "../../../services/theme/theme.service";

@Component({
  selector: 'app-settings-all-transfer',
  templateUrl: './settings-all-transfer.component.html',
  styleUrls: ['./settings-all-transfer.component.css']
})
export class SettingsAllTransferComponent implements OnInit {
  userId: string | null = "";
  allFolder: FolderInterface[] = [];
  loading: boolean = true;
  loadingImg: string = "";
  isDataFound: boolean = true;
  isFolderEmpty: boolean = true;
  errorMessage: boolean = false;
  binIcon: IconDefinition = faTrashAlt;
  folderSize: string = "0";

  constructor(
    private httpClientService: HttpClientService,
    private JwtService: JwtTokenService,
    private formatSizeService: FormatSizeService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.initializeUserId();
    this.loadAllFolders();
    this.getTheme();
  }

  initializeUserId(): void {
    if (this.JwtService.getToken()) {
      this.userId = this.JwtService.getUserId();
    }
  }

  loadAllFolders(): void {
    if (this.userId) {
      this.httpClientService.getAllFolderByUserId(environment.apiURL + "user/folders/" + this.userId).subscribe({
        next: (data: FolderInterface[]) => {
          this.handleFolders(data);
        }, error: () => {
          this.setErrorMessage();
        }
      })
    }
  }

  handleFolders(data: FolderInterface[]): void {
    this.loading = false;
    this.allFolder = data;
    this.isFolderEmpty = false;
    this.isDataFound = true;
    if (this.allFolder[0]?.id === null) {
      this.isFolderEmpty = true;
      this.isDataFound = false;
    }
  }

  setErrorMessage(): void {
    this.errorMessage = true;
  }

  checkIfFolderIsExpired(folder: FolderInterface): boolean {
    const currentDate = new Date();
    const folderDate = new Date(folder.expiresAt);
    return folderDate < currentDate;
  }

  formatSize(size: number): string {
    return this.formatSizeService.formatSize(size);
  }

  deleteFolder(folder: FolderInterface): void {
    this.httpClientService.deleteFolder(environment.apiURL + "folder/" + folder.id).subscribe( {
      next: () => {
        this.removeFolderFromList(folder);
      }, error: () => {
      }
    });
  }

  removeFolderFromList(folder: FolderInterface): void {
    this.allFolder.splice(this.allFolder.indexOf(folder), 1);
    if (this.allFolder.length === 0) {
      this.isFolderEmpty = true;
      this.isDataFound = false;
    }
  }

  getTheme() {
    this.themeService.currentThemeSubject.subscribe((theme) => {
        this.loadingImg = (theme) === "light" ? "assets/images/logo_dark.png" : "assets/images/logo_light.png";
    });
  }

}
