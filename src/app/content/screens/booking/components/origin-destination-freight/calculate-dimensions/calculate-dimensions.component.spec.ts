import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateDimensionsComponent } from './calculate-dimensions.component';

describe('CalculateDimensionsComponent', () => {
  let component: CalculateDimensionsComponent;
  let fixture: ComponentFixture<CalculateDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateDimensionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
