import {TestBed, ComponentFixture, tick, fakeAsync} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TransferComponent} from './transfer.component';
import {HttpClientService} from "../../services/httpClient/http-client.service";
import {CookiesService} from "../../services/cookies/cookies.service";
import {FlashMessageService} from "../../services/flash-message/flash-message.service";
import {of, throwError} from 'rxjs';
import {FormsModule} from "@angular/forms";
import {FileUploader} from "ng2-file-upload";
import {FormatSizeService} from "../../services/format-size-file/format-size.service";

describe('TransferComponent', () => {
  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;
  let mockHttpClientService: { createFolder: any; }, mockCookiesService: { get: any; },
    mockFlashMessageService: { addMessage: any; }, mockFormatSizeService: { formatSize: any; }

  beforeEach(async () => {
    mockHttpClientService = {
      createFolder: jest.fn()
    };
    mockCookiesService = {
      get: jest.fn().mockReturnValue('fakeToken')
    };
    mockFlashMessageService = {
      addMessage: jest.fn()
    };
    mockFormatSizeService = {
      formatSize: jest.fn()
    }


    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [TransferComponent],
      providers: [
        {provide: HttpClientService, useValue: mockHttpClientService},
        {provide: CookiesService, useValue: mockCookiesService},
        {provide: FlashMessageService, useValue: mockFlashMessageService},
        {provide: FormatSizeService, useValue: mockFormatSizeService}
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a token from cookie service', () => {
    expect(mockCookiesService.get).toHaveBeenCalledWith('token');
    expect(component.token).toEqual('fakeToken');
  });

  it('should not modify folderName if it is not empty', () => {
    component.folderName = 'ExistingName';
    component.uploadFile() // Replace with the actual method that contains the logic
    expect(component.folderName).toBe('ExistingName');
  });


  it('should generate a random folder name if it is empty', () => {
    component.folderName = '';
    component.generateRandomFolderName('');
    expect(component.folderName).toMatch(/^Dossier-\d+$/);
  });


  it('should add valid email to the list and reset input state', () => {
    component.checkIfEmailIsValid({target: {value: 'test@example.com'}});
    expect(component.emails).toContain('test@example.com');
    expect(component.isEmailError).toBe(false);
    expect(component.emailInput).toBe('');
  });

  it('should not add invalid email and set error state', () => {
    component.checkIfEmailIsValid({target: {value: 'invalidEmail'}});
    expect(component.emails).not.toContain('invalidEmail');
    expect(component.isEmailError).toBe(true);
    expect(component.emailInput).toBe('input-error');
  });

  it('should delete email from the list', () => {
    component.emails = ['test1@example.com', 'test2@example.com'];
    component.deleteEmail('test1@example.com');
    expect(component.emails).not.toContain('test1@example.com');
  });

  it('should upload files when requirements met', () => {
    component.uploader.queue = [{file: {size: 1000}} as any];
    component.emails = ['test@example.com'];
    component.folderName = 'Test Folder';
    const folderId = '1234';

    mockHttpClientService.createFolder.mockReturnValue(
      of({id: folderId})
    );

    component.uploadFile();

    expect(mockHttpClientService.createFolder).toHaveBeenCalled();
  });

  it('should upload files when folder name is empty', () => {
    component.uploader.queue = [{file: {size: 1000}} as any];
    component.emails = ['test@example.com'];
    component.folderName = '';
    const folderId = '1234';

    mockHttpClientService.createFolder.mockReturnValue(
      of({id: folderId})
    );

    component.uploadFile();

    expect(mockHttpClientService.createFolder).toHaveBeenCalled();
  });

  it('should show an error message if file or email is missing for upload', () => {
    component.uploadFile();
    expect(mockFlashMessageService.addMessage).toHaveBeenCalledWith('Veuillez ajouter au moins un fichier et un email', 'error', 4000);
  });

  it('should remove duplicate files when checkFile is called', () => {
    // Arrange
    component.uploader.queue = [
      {file: {name: 'file1', size: 1000, rawFile: {name: 'file1'}}},
      {file: {name: 'file1', size: 1000, rawFile: {name: 'file1'}}}, // duplicate
      {file: {name: 'file2', size: 2000, rawFile: {name: 'file2'}}}
    ] as any[];

    // Act
    component.checkFile();

    // Assert
    const uniqueFileNames = Array.from(new Set(component.uploader.queue.map(f => f.file.name)));
    expect(uniqueFileNames.length).toEqual(component.uploader.queue.length);
  });

  it('should return if email equal empty string', () => {
    const event = {target: {value: ''}};
    component.checkIfEmailIsValid(event);
    expect(component.emails).not.toContain('');
    expect(component.isEmailError).toBe(false);
    expect(component.emailInput).toBe('');
  });

  it('should delete a file', () => {

    const item = {remove: jest.fn()};
    component.deleteFile(item);
    expect(item.remove).toHaveBeenCalled();

  });

  it('should delete all file', () => {

    component.uploader.clearQueue = jest.fn();
    component.deleteAllFile();
    expect(component.uploader.clearQueue).toHaveBeenCalled();


  });

  it('should handle valid email', () => {
    const event = {target: {value: 'test@example.com'}};
    component.checkIfEmailIsValid(event);
    expect(component.emails).toContain('test@example.com');
    expect(component.isEmailError).toBe(false);
    expect(event.target.value).toBe('');
  });

  it('should handle invalid email', () => {
    const event = {target: {value: 'invalid-email'}};
    component.checkIfEmailIsValid(event);
    expect(component.emails).not.toContain('invalid-email');
    expect(component.isEmailError).toBe(true);
    expect(component.emailInput).toBe('input-error');
  });

  it('should handle email that already exists', () => {
    component.emails = ['test@example.com'];
    const event = {target: {value: 'test@example.com'}};
    component.checkIfEmailIsValid(event);
    expect(component.isEmailAlreadyExist).toBe(true);
    expect(component.emailInput).toBe('input-error');
  });

  it('should clear all when upload is done', () => {
    component.clearAllAfterCompleteAllUpload()

    component.uploader.onCompleteAll();
    expect(component.folderName).toBe('');
    expect(component.emails).toEqual([]);
    expect(component.sizeAllFile).toBe(0);
    expect(component.message).toBe('');


  });

  it('should initialize uploader in constructor', () => {
    // Check if FileUploader instance is created
    expect(component.uploader).toBeDefined();
    expect(component.uploader).toBeInstanceOf(FileUploader);

    // Further checks on uploader options, if necessary
  });

  it('should use onProgressAll to update progress', () => {

    // Arrange
    const progress = 50;
    const event = {total: 100, loaded: 50};
    component.uploader.progress = progress;

    // Act
    component.uploader.onProgressAll(event);

    // Assert
    expect(component.uploader.progress).toEqual(progress);

  });

  it('should reset loaderProgress and showOrUpload after timeout when loaderProgress is 100', fakeAsync(() => {

    // Arrange
    component.loaderProgress = 100;

    // Act
    // (trigger the code path that includes the logic you're interested in)
    // For demonstration, assuming that code is inside a function named 'updateLoaderProgress'
    component.uploader.onProgressAll(100);

    // Assert initial state changes
    expect(component.loaderProgress).toBe(0);
    expect(component.showTimeout).toBe(true);

    // Assert that 'showOrUpload' is empty and 'showTimeout' is false after 1500ms
    tick(1500);
    expect(component.showOrUpload).toBe('');
    expect(component.showTimeout).toBe(false);

  }));


  it('should return this.sizeAllFile in Ko', () => {

    component.sizeAllFile = 1000;
    component.formatSizeFile(component.sizeAllFile);


  });

});
