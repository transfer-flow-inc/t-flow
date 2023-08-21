import { TestBed } from '@angular/core/testing';

import { AutorizeGuardService } from './autorize-guard.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('AutorizeGuardService', () => {
  let service: AutorizeGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AutorizeGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});