import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidateOrdersComponent } from './consolidate-orders.component';

describe('ConsolidateOrdersComponent', () => {
  let component: ConsolidateOrdersComponent;
  let fixture: ComponentFixture<ConsolidateOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsolidateOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidateOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
