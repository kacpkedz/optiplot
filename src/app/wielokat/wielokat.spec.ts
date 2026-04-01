import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wielokat } from './wielokat';

describe('Wielokat', () => {
  let component: Wielokat;
  let fixture: ComponentFixture<Wielokat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wielokat],
    }).compileComponents();

    fixture = TestBed.createComponent(Wielokat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
