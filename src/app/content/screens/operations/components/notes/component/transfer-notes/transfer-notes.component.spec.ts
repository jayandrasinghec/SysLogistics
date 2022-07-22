import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferNotesComponent } from './transfer-notes.component';

describe('TransferNotesComponent', () => {
  let component: TransferNotesComponent;
  let fixture: ComponentFixture<TransferNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
