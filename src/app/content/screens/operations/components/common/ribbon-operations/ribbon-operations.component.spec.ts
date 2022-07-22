import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RibbonOperationsComponent } from './ribbon-operations.component';

describe('RibbonOperationsComponent', () => {
  let component: RibbonOperationsComponent;
  let fixture: ComponentFixture<RibbonOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RibbonOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RibbonOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
