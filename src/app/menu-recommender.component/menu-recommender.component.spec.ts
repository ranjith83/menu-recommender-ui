import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRecommenderComponent } from './menu-recommender.component';

describe('MenuRecommenderComponent', () => {
  let component: MenuRecommenderComponent;
  let fixture: ComponentFixture<MenuRecommenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuRecommenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRecommenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
