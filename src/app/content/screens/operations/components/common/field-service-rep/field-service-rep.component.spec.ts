import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldServiceRepComponent } from './field-service-rep.component';

describe('FieldServiceRepComponent', () => {
  let component: FieldServiceRepComponent;
  let fixture: ComponentFixture<FieldServiceRepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldServiceRepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldServiceRepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
