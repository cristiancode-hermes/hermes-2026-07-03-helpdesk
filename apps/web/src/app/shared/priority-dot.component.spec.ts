import { TestBed } from '@angular/core/testing';
import { PriorityDotComponent } from './priority-dot.component';

describe('PriorityDotComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  async function createFixture() {
    await TestBed.configureTestingModule({
      imports: [PriorityDotComponent],
    }).compileComponents();
    return TestBed.createComponent(PriorityDotComponent);
  }

  it('should create', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('priority', 'low');
    fixture.detectChanges();
    expect(fixture.componentRef).toBeTruthy();
  });

  describe('dotClass', () => {
    it('should return neutral-400 for low priority', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'low');
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('span span');
      expect(dot.className).toContain('bg-neutral-400');
    });

    it('should return warning-400 for medium priority', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'medium');
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('span span');
      expect(dot.className).toContain('bg-warning-400');
    });

    it('should return accent-500 for high priority', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'high');
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('span span');
      expect(dot.className).toContain('bg-accent-500');
    });

    it('should return danger-500 animate-pulse for urgent', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'urgent');
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('span span');
      expect(dot.className).toContain('bg-danger-500');
      expect(dot.className).toContain('animate-pulse');
    });

    it('should fall back to neutral-400 for unknown priority', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'unknown');
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('span span');
      expect(dot.className).toContain('bg-neutral-400');
    });

    it('should display the priority label as text', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('priority', 'high');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent?.trim().toLowerCase()).toContain('high');
    });
  });
});
