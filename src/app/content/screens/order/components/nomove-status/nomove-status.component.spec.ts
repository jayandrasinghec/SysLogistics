import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NomoveStatusComponent } from './nomove-status.component';

describe('NomoveStatusComponent', () => {
  let component: NomoveStatusComponent;
  let fixture: ComponentFixture<NomoveStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NomoveStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NomoveStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
