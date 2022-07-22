import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerPopupComponent } from './timer-popup.component';

describe('TimerPopupComponent', () => {
  let component: TimerPopupComponent;
  let fixture: ComponentFixture<TimerPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimerPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
