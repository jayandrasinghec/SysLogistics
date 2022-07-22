import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceFailureComponent } from './service-failure.component';

describe('ServiceFailureComponent', () => {
  let component: ServiceFailureComponent;
  let fixture: ComponentFixture<ServiceFailureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceFailureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
