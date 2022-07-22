import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayTransferpictureComponent } from './gateway-transferpicture.component';

describe('GatewayTransferpictureComponent', () => {
  let component: GatewayTransferpictureComponent;
  let fixture: ComponentFixture<GatewayTransferpictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayTransferpictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayTransferpictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
