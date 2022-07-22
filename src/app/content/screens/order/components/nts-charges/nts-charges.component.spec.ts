import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NtsChargesComponent } from './nts-charges.component';

describe('NtsChargesComponent', () => {
  let component: NtsChargesComponent;
  let fixture: ComponentFixture<NtsChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NtsChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NtsChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
