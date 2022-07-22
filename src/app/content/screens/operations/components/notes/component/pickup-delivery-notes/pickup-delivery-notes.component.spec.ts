import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupDeliveryNotesComponent } from './pickup-delivery-notes.component';

describe('PickupDeliveryNotesComponent', () => {
  let component: PickupDeliveryNotesComponent;
  let fixture: ComponentFixture<PickupDeliveryNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickupDeliveryNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickupDeliveryNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
