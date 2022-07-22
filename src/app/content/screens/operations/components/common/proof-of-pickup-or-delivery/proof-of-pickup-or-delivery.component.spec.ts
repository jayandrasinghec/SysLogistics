import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfPickupOrDeliveryComponent } from './proof-of-pickup-or-delivery.component';

describe('ProofOfPickupOrDeliveryComponent', () => {
  let component: ProofOfPickupOrDeliveryComponent;
  let fixture: ComponentFixture<ProofOfPickupOrDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofOfPickupOrDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofOfPickupOrDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
