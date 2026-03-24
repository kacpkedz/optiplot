import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wizualizacja } from './wizualizacja';

describe('Wizualizacja', () => {
  let component: Wizualizacja;
  let fixture: ComponentFixture<Wizualizacja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wizualizacja],
    }).compileComponents();

    fixture = TestBed.createComponent(Wizualizacja);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
