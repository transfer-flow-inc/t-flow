import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NavbarComponent} from './navbar.component';
import {ThemeService} from '../../services/theme/theme.service';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {HttpClient} from "@angular/common/http";
import {DateTimeProvider, OAuthLogger, OAuthService, UrlHelperService} from "angular-oauth2-oidc";
import {FooterComponent} from "../footer/footer.component";
import {HttpClientService} from "../../services/http-client/http-client.service";
import {JwtTokenService} from "../../services/jwt-token/jwt-token.service";
import {CookiesService} from "../../services/cookies/cookies.service";
import {of} from "rxjs";
import {faMoon} from "@fortawesome/free-solid-svg-icons";


describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockHttpClientService: Partial<HttpClientService>;
  let mockJwtTokenService: Partial<JwtTokenService>;
  let mockCookiesService: Partial<CookiesService>;
  let themeService: ThemeService;
  let mockFooterComponent: Partial<FooterComponent>;

  beforeEach(() => {

    mockHttpClientService = {
      isAuthenticated$: of(true),
      isAdministrator$: of(true),
    };

    mockJwtTokenService = {
      getUserRole: () => 'ADMIN',
    };

    mockCookiesService = {
      get: () => 'mock-token',
    };


    mockFooterComponent = {
      ngOnInit: () => {
      },
    };


    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [FontAwesomeModule, HttpClientTestingModule],
      providers: [
        {provide: HttpClientService, useValue: mockHttpClientService},
        {provide: JwtTokenService, useValue: mockJwtTokenService},
        {provide: CookiesService, useValue: mockCookiesService},
        ThemeService,
        HttpClient,
        OAuthService,
        DateTimeProvider,
        UrlHelperService,
        OAuthLogger,
        FooterComponent
      ],
    });

    themeService = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    spyOn(FooterComponent.prototype, 'ngOnInit').and.callThrough();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle isMenuOpen and update navbarToggleValue and iconShow', () => {
    expect(component.isMenuOpen).toBe(false);
    expect(component.navbarToggleValue).toBe('hide');
    expect(component.iconShow).toBe('show');
    component.openMenu();
    expect(component.isMenuOpen).toBe(true);
    expect(component.navbarToggleValue).toBe('showNav');
    expect(component.iconShow).toBe('hidden');
    component.openMenu();
    expect(component.isMenuOpen).toBe(false);
    expect(component.navbarToggleValue).toBe('reverse');
    expect(component.iconShow).toBe('hidden');
  });



  it('should get the isAdministrator', () => {

    spyOn(mockHttpClientService, 'isAuthenticated$').and.returnValue(of(true));
    spyOn(mockHttpClientService, 'isAdministrator$').and.returnValue(of(true));

    component.ngOnInit();

    expect(component.isAuthenticated).toBe(true);
    expect(component.isAdministrator).toBe(true);

  });

  it('should toggle theme', () => {
    spyOn(themeService, 'toggleTheme')

    component.toggleTheme();



  });

  it('should change navbarToggleValue && iconShow', fakeAsync(() => {
    spyOn(component, 'openMenu').and.callThrough();
    component.isMenuOpen = true;

    component.openMenu();
    expect(component.navbarToggleValue).toBe('reverse');

    tick(200);

    expect(component.navbarToggleValue).toBe('hide');
    expect(component.iconShow).toBe('hidden');
  }));

});
