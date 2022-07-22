import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownGridComponent } from './dropdown-grid.component';

describe('DropdownGridComponent', () => {
  let component: DropdownGridComponent;
  let fixture: ComponentFixture<DropdownGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
