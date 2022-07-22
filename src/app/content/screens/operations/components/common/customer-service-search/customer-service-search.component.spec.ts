import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerServiceSearchComponent } from './customer-service-search.component';

describe('CustomerServiceSearchComponent', () => {
  let component: CustomerServiceSearchComponent;
  let fixture: ComponentFixture<CustomerServiceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerServiceSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerServiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
