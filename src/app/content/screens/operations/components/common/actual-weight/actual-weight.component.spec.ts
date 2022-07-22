import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualWeightComponent } from './actual-weight.component';

describe('ActualWeightComponent', () => {
  let component: ActualWeightComponent;
  let fixture: ComponentFixture<ActualWeightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActualWeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
