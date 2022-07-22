import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNotesComponent } from './input-notes.component';

describe('InputNotesComponent', () => {
  let component: InputNotesComponent;
  let fixture: ComponentFixture<InputNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
