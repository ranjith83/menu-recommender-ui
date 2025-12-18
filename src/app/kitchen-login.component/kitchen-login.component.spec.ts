import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenLoginComponent } from './kitchen-login.component';

describe('KitchenLoginComponent', () => {
  let component: KitchenLoginComponent;
  let fixture: ComponentFixture<KitchenLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KitchenLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
