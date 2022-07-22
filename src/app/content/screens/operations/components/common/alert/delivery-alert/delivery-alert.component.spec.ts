import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAlertComponent } from './delivery-alert.component';

describe('DeliveryAlertComponent', () => {
  let component: DeliveryAlertComponent;
  let fixture: ComponentFixture<DeliveryAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
