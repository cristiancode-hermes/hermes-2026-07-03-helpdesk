import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  async function createFixture() {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();
    return TestBed.createComponent(BadgeComponent);
  }

  it('should create', async () => {
    const fixture = await createFixture();
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();
    expect(fixture.componentRef).toBeTruthy();
  });

  describe('badgeClass', () => {
    it('should return filled neutral class by default', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Open');
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement.querySelector('span');
      expect(el.className).toContain('bg-neutral-100');
      expect(el.className).toContain('text-neutral-800');
    });

    it('should return filled primary for color=primary variant=filled', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Primary');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('span');
      expect(el.className).toContain('bg-primary-100');
      expect(el.className).toContain('text-primary-800');
    });

    it('should return outline for variant=outline', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Success');
      fixture.componentRef.setInput('color', 'success');
      fixture.componentRef.setInput('variant', 'outline');
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('span');
      expect(el.className).toContain('border-success-300');
      expect(el.className).toContain('text-success-700');
    });

    it('should return subtle for variant=subtle', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Danger');
      fixture.componentRef.setInput('color', 'danger');
      fixture.componentRef.setInput('variant', 'subtle');
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('span');
      expect(el.className).toContain('text-danger-700');
      expect(el.className).toContain('bg-danger-50');
    });

    it('should fall back to filled neutral for unknown color', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Test');
      fixture.componentRef.setInput('color', 'nonexistent');
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('span');
      expect(el.className).toContain('bg-neutral-100');
    });

    it('should display the label text', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('label', 'Open');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent?.trim()).toBe('Open');
    });
  });
});
