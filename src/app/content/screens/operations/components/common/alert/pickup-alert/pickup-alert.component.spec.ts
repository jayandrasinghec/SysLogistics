import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupAlertComponent } from './pickup-alert.component';

describe('PickupAlertComponent', () => {
  let component: PickupAlertComponent;
  let fixture: ComponentFixture<PickupAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickupAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
