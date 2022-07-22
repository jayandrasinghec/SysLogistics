import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialChargesComponent } from './special-charges.component';

describe('SpecialChargesComponent', () => {
  let component: SpecialChargesComponent;
  let fixture: ComponentFixture<SpecialChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
