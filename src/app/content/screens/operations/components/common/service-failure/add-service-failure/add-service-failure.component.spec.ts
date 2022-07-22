import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServiceFailureComponent } from './add-service-failure.component';

describe('AddServiceFailureComponent', () => {
  let component: AddServiceFailureComponent;
  let fixture: ComponentFixture<AddServiceFailureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServiceFailureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServiceFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
