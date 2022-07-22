import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChargesComponent } from './view-charges.component';

describe('ViewChargesComponent', () => {
  let component: ViewChargesComponent;
  let fixture: ComponentFixture<ViewChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
