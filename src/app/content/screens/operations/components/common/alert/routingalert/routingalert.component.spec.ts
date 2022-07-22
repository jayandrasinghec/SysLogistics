import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingalertComponent } from './routingalert.component';

describe('RoutingalertComponent', () => {
  let component: RoutingalertComponent;
  let fixture: ComponentFixture<RoutingalertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoutingalertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutingalertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
