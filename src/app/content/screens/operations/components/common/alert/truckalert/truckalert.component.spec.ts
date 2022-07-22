import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckalertComponent } from './truckalert.component';

describe('TruckalertComponent', () => {
  let component: TruckalertComponent;
  let fixture: ComponentFixture<TruckalertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckalertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckalertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
