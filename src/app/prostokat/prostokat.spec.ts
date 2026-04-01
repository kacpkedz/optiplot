import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prostokat } from './prostokat';

describe('Prostokat', () => {
  let component: Prostokat;
  let fixture: ComponentFixture<Prostokat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prostokat],
    }).compileComponents();

    fixture = TestBed.createComponent(Prostokat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
