import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing'; // Nueva forma
import { provideHttpClient } from '@angular/common/http'; // Nueva forma
import { provideRouter } from '@angular/router'; // Nueva forma
import { AuthService } from './authservice';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),        // Reemplaza a HttpClientModule
        provideHttpClientTesting(), // Reemplaza a HttpClientTestingModule
        provideRouter([])           // Reemplaza a RouterTestingModule
      ]
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn should reflect token presence', () => {
    expect(service.isLoggedIn()).toBeFalsy();
    service.setAuth('abc', { name: 'x' });
    expect(service.isLoggedIn()).toBeTruthy();
    localStorage.removeItem('token'); 
    expect(service.isLoggedIn()).toBeFalsy();
  });

  it('updateStoredUser merges partial data', () => {
    service.setAuth('tok', { name: 'initial', foo: 'bar' } as any);
    service.updateStoredUser({ name: 'changed' });
    const u = service.getCurrentUser() as any;
    expect(u.name).toBe('changed');
    expect(u.foo).toBe('bar');
  });
});