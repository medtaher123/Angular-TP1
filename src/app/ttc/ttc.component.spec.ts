import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TTCComponent } from './ttc.component';

describe('TTCComponent', () => {
  let component: TTCComponent;
  let fixture: ComponentFixture<TTCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TTCComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TTCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
