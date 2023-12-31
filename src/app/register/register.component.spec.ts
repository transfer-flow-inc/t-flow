import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RegisterComponent} from './register.component';
import {FontAwesomeTestingModule} from "@fortawesome/angular-fontawesome/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {OAuthModule, OAuthService} from "angular-oauth2-oidc";
import {BehaviorSubject, of, throwError} from "rxjs";
import {HttpClientService} from "../../services/http-client/http-client.service";
import {Router} from "@angular/router";
import {CookiesService} from "../../services/cookies/cookies.service";
import {FlashMessageService} from "../../services/flash-message/flash-message.service";
import {GoogleSsoService} from "../../services/sso/Google/google-sso.service";

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockHttpClientService: { isAuthenticated: any, login: any, loginWithGoogle: any; register: any; };
  let mockRouter: { navigate: any; };
  let mockCookiesService: { get: any; delete: any; set: any; };
  let mockFlashMessageService: { addMessage: any; };
  let mockGoogleSsoService: { signInWithGoogle: any; };
  let mockOAuthService: { events: any; getIdentityClaims: any; };
  let router: Router;
  let flashMessageService: FlashMessageService;
  let httpClientService : HttpClientService;

  beforeEach(async () => {

    mockHttpClientService = {
      isAuthenticated: new BehaviorSubject<boolean>(false),
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      register: jest.fn().mockReturnValue(of({token: 'some_token'}))
    };
    jest.spyOn(mockHttpClientService.isAuthenticated, 'next');
    mockFlashMessageService = {
      addMessage: jest.fn()
    }
    mockOAuthService = {
      events: of({ type: 'token_received' }),
      getIdentityClaims: jest.fn().mockReturnValue({})
    };
    mockGoogleSsoService = {
      signInWithGoogle: jest.fn()
    }
    mockCookiesService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
    mockRouter = {
      navigate: jest.fn()
    }

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [ FontAwesomeTestingModule, HttpClientTestingModule, ReactiveFormsModule, FormsModule, OAuthModule.forRoot() ],
      providers: [
        { provide: HttpClientService, useValue: mockHttpClientService },
        { provide: Router, useValue: mockRouter },
        { provide: CookiesService, useValue: mockCookiesService },
        { provide: FlashMessageService, useValue: mockFlashMessageService },
        { provide: GoogleSsoService, useValue: mockGoogleSsoService },
        { provide: OAuthService, useValue: mockOAuthService },
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
    httpClientService = TestBed.inject(HttpClientService);
    flashMessageService = TestBed.inject(FlashMessageService);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

   it('should handle 403 error correctly', () => {
    const mockError = { status: 403 };

    component.handleError(mockError);
    expect(component.error).toBe("Email ou mot de passe incorrect !");
  });

  it('should handle 423 error correctly', () => {
    const mockError = { status: 423 };
    component.handleError(mockError);
    expect(component.error).toBe("Vous devez valider votre compte !");

  });

  it('should navigate to "/accueil" and show a flash message', async () => {
    const message = 'Test message';
    const type = 'success';
    const time = 5000;

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(flashMessageService, 'addMessage');

    await component.navigateToHomeAndFlashMessage(message, type, time);

    expect(router.navigate).toHaveBeenCalledWith(['/accueil']);
    expect(flashMessageService.addMessage).toHaveBeenCalledWith(message, type, time);
  });

  it('should handle non-403 error correctly', () => {
    const mockError = { status: 500 };
    component.handleError(mockError);
    expect(component.error).toBe("Une erreur est survenue !");
  });

  it('should call signInWithGoogle on googleSsoService when signInWithGoogle is called', () => {
    component.signInWithGoogle();
    expect(mockGoogleSsoService.signInWithGoogle).toHaveBeenCalled();
  });

  it('should toggle isChecked when changeIsChecked is called', () => {
    component.isChecked = false;

    component.changeIsChecked();
    expect(component.isChecked).toBe(true);

    component.changeIsChecked();

    expect(component.isChecked).toBe(false);
  });

  it('should handle OAuthEvent of type "token_received"', () => {
    const fakeToken = { token: 'fake-token' };
    mockHttpClientService.loginWithGoogle.mockReturnValue(of(fakeToken));

    component.ngOnInit();

    expect(mockOAuthService.getIdentityClaims).toHaveBeenCalled();
    expect(mockHttpClientService.loginWithGoogle).toHaveBeenCalled();
    expect(mockCookiesService.set).toHaveBeenCalledWith('token', fakeToken.token, 30);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/accueil']);
    mockFlashMessageService.addMessage('Vous vous êtes connecté avec succès', 'success', 4000);
    expect(mockFlashMessageService.addMessage).toHaveBeenCalledWith('Vous vous êtes connecté avec succès', 'success', 4000);
  });

it('should call performRegistration when register is called and isChecked is true', () => {
    component.isChecked = true;
    const performRegistrationSpy = jest.spyOn(component, 'performRegistration');

    component.register();

    expect(performRegistrationSpy).toHaveBeenCalled();
  });

  it('should handle performRegistration Error', () => {
    spyOn(httpClientService, 'register').and.returnValue(throwError('error'));
    spyOn(component, 'handleError');

    component.performRegistration();

    expect(component.handleError).toHaveBeenCalled();


  });

  it('should call httpClientService.register when performRegistration is called', () => {
    mockHttpClientService.register.mockReturnValue(of({ token: 'fake_token' }));

    component.performRegistration();

    expect(mockHttpClientService.register).toHaveBeenCalled();
  });

});
