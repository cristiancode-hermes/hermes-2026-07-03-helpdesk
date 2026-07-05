import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  async function createFixture() {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();
    return TestBed.createComponent(PaginationComponent);
  }

  it('should create', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    expect(fixture.componentRef).toBeTruthy();
  });

  describe('visiblePages', () => {
    it('should show all pages when total <= 5', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 1);
      fixture.componentRef.setInput('totalPages', 3);
      fixture.detectChanges();
      const pages = (fixture.componentInstance as any).visiblePages();
      expect(pages).toEqual([1, 2, 3]);
    });

    it('should center around current page when in middle', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 5);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();
      const pages = (fixture.componentInstance as any).visiblePages();
      expect(pages).toEqual([3, 4, 5, 6, 7]);
    });

    it('should show first 5 pages when near start', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 2);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();
      const pages = (fixture.componentInstance as any).visiblePages();
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should show last 5 pages when near end', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 9);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();
      const pages = (fixture.componentInstance as any).visiblePages();
      expect(pages).toEqual([6, 7, 8, 9, 10]);
    });

    it('should return empty array when totalPages is 0', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 1);
      fixture.componentRef.setInput('totalPages', 0);
      fixture.detectChanges();
      const pages = (fixture.componentInstance as any).visiblePages();
      expect(pages).toEqual([]);
    });
  });

  describe('goToPage', () => {
    it('should emit pageChange when valid page is clicked', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();

      const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
      (fixture.componentInstance as any).goToPage(5);
      expect(emitSpy).toHaveBeenCalledWith(5);
    });

    it('should NOT emit when clicking same page', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();

      const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
      (fixture.componentInstance as any).goToPage(3);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should NOT emit when page below 1', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();

      const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
      (fixture.componentInstance as any).goToPage(0);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should NOT emit when page exceeds total', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.detectChanges();

      const emitSpy = jest.spyOn(fixture.componentInstance.pageChange, 'emit');
      (fixture.componentInstance as any).goToPage(11);
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    it('should render nothing when totalPages is 0', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 1);
      fixture.componentRef.setInput('totalPages', 0);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.flex')).toBeNull();
    });

    it('should highlight current page button', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 2);
      fixture.componentRef.setInput('totalPages', 5);
      fixture.detectChanges();
      const buttons: HTMLElement[] = fixture.nativeElement.querySelectorAll('button');
      const currentBtn = Array.from(buttons).find(b => b.textContent?.trim() === '2');
      expect(currentBtn).toBeTruthy();
      expect(currentBtn?.className).toContain('bg-primary-600');
    });

    it('should display page count info', async () => {
      const fixture = await createFixture();
      fixture.componentRef.setInput('page', 3);
      fixture.componentRef.setInput('totalPages', 10);
      fixture.componentRef.setInput('totalItems', 95);
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Page 3 of 10');
      expect(text).toContain('95 total');
    });
  });
});
