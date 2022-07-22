import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingNotesComponent } from './routing-notes.component';

describe('RoutingNotesComponent', () => {
  let component: RoutingNotesComponent;
  let fixture: ComponentFixture<RoutingNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoutingNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutingNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
