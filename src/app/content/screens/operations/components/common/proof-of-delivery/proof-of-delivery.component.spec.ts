import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfDeliveryComponent } from './proof-of-delivery.component';

describe('ProofOfDeliveryComponent', () => {
  let component: ProofOfDeliveryComponent;
  let fixture: ComponentFixture<ProofOfDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProofOfDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProofOfDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
