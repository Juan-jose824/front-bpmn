import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisMain } from './analisis-main';

describe('AnalisisMain', () => {
  let component: AnalysisMain;
  let fixture: ComponentFixture<AnalysisMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
