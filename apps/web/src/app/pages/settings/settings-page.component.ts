import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { TagService } from '../../services/tag.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/button.component';
import { BadgeComponent } from '../../shared/badge.component';
import { ModalComponent } from '../../shared/modal.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent, BadgeComponent, ModalComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage categories, tags, and users</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
        @for (tab of tabs; track tab) {
          <button (click)="activeTab.set(tab)"
            class="px-4 py-2 text-sm font-medium rounded-md transition-all"
            [class]="activeTab() === tab ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'">
            {{ tab }}
          </button>
        }
      </div>

      @switch (activeTab()) {
        @case ('Categories') {
          <!-- Categories -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card">
            <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Categories</h3>
              <app-button variant="primary" size="sm" (click)="openCategoryModal()">Add Category</app-button>
            </div>
            @if (categoryService.loading()) {
              <app-loading-skeleton type="row" [count]="4" class="px-6" />
            } @else if (categoryService.categories().length === 0) {
              <app-empty-state title="No categories" description="Create categories to organize tickets" />
            } @else {
              <div class="divide-y divide-neutral-100 dark:divide-neutral-700">
                @for (cat of categoryService.categories(); track cat.id) {
                  <div class="px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full" [style.background-color]="cat.color"></span>
                      <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ cat.name }}</span>
                      @if (cat.description) {
                        <span class="text-xs text-neutral-500">{{ cat.description }}</span>
                      }
                    </div>
                    <div class="flex gap-2">
                      <button (click)="editCategory(cat)" class="text-xs text-primary-600 hover:text-primary-700">Edit</button>
                      <button (click)="deleteCategory(cat)" class="text-xs text-danger-600 hover:text-danger-700">Delete</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        @case ('Tags') {
          <!-- Tags -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card">
            <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Tags</h3>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="newTagName" placeholder="New tag name" (keydown.enter)="createTag()"
                  class="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <app-button variant="primary" size="sm" [disabled]="!newTagName().trim()" (click)="createTag()">Add</app-button>
              </div>
            </div>
            @if (tagService.loading()) {
              <app-loading-skeleton type="text" [count]="4" class="px-6" />
            } @else if (tagService.tags().length === 0) {
              <app-empty-state title="No tags" description="Create tags to label tickets" />
            } @else {
              <div class="px-6 py-4 flex flex-wrap gap-2">
                @for (tag of tagService.tags(); track tag.id) {
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                    {{ tag.name }}
                    <button (click)="deleteTag(tag)" class="text-primary-500 hover:text-primary-700">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

        @case ('Users') {
          <!-- Users -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card">
            <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Users</h3>
            </div>
            @if (userService.loading()) {
              <app-loading-skeleton type="row" [count]="4" class="px-6" />
            } @else if (userService.users().length === 0) {
              <app-empty-state title="No users" />
            } @else {
              <div class="divide-y divide-neutral-100 dark:divide-neutral-700">
                @for (u of userService.users(); track u.id) {
                  <div class="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ u.name }}</p>
                      <p class="text-xs text-neutral-500">{{ u.email }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <app-badge [label]="u.role" [color]="u.role === 'admin' ? 'primary' : 'neutral'" variant="subtle" />
                      @if (u.id !== currentUser?.id) {
                        <select [value]="u.role" (change)="changeRole(u.id, $any($event.target).value)"
                          class="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Category Modal -->
    <app-modal [isOpen]="categoryModalOpen()" [title]="editingCategory ? 'Edit Category' : 'New Category'" (close)="closeCategoryModal()">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name *</label>
          <input type="text" [(ngModel)]="categoryFormName"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Color</label>
          <div class="flex gap-2">
            @for (color of presetColors; track color) {
              <button (click)="categoryFormColor.set(color)"
                class="w-8 h-8 rounded-full border-2 transition-all"
                [style.background-color]="color"
                [class]="categoryFormColor() === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'">
              </button>
            }
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
          <input type="text" [(ngModel)]="categoryFormDescription"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <app-button variant="secondary" (click)="closeCategoryModal()">Cancel</app-button>
          <app-button variant="primary" [loading]="categorySaving()" (click)="saveCategory()">
            {{ editingCategory ? 'Update' : 'Create' }}
          </app-button>
        </div>
      </div>
    </app-modal>

    <!-- Delete Category Confirm -->
    <app-modal [isOpen]="categoryDeleteOpen()" title="Delete Category" size="sm" (close)="categoryDeleteOpen.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to delete this category?</p>
        <div class="flex justify-end gap-3">
          <app-button variant="secondary" (click)="categoryDeleteOpen.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="categorySaving()" (click)="doDeleteCategory()">Delete</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class SettingsPageComponent {
  readonly categoryService = inject(CategoryService);
  readonly tagService = inject(TagService);
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);

  readonly tabs = ['Categories', 'Tags', 'Users'];
  readonly activeTab = signal('Categories');

  readonly newTagName = signal('');

  // Category modal
  readonly categoryModalOpen = signal(false);
  readonly categoryDeleteOpen = signal(false);
  readonly categoryFormName = signal('');
  readonly categoryFormColor = signal('#6366f1');
  readonly categoryFormDescription = signal('');
  readonly categorySaving = signal(false);
  protected editingCategory: any = null;
  protected deletingCategory: any = null;

  protected readonly presetColors = [
    '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#eab308',
    '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4', '#78716c',
  ];

  protected get currentUser() { return this.authService.currentUser(); }

  openCategoryModal(): void {
    this.editingCategory = null;
    this.categoryFormName.set('');
    this.categoryFormColor.set('#6366f1');
    this.categoryFormDescription.set('');
    this.categoryModalOpen.set(true);
  }

  editCategory(cat: any): void {
    this.editingCategory = cat;
    this.categoryFormName.set(cat.name);
    this.categoryFormColor.set(cat.color);
    this.categoryFormDescription.set(cat.description || '');
    this.categoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.categoryModalOpen.set(false);
    this.editingCategory = null;
  }

  saveCategory(): void {
    if (!this.categoryFormName().trim()) return;
    this.categorySaving.set(true);
    const data = {
      name: this.categoryFormName().trim(),
      color: this.categoryFormColor(),
      description: this.categoryFormDescription().trim() || undefined,
    };

    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory.id, data).subscribe({
        next: () => { this.categorySaving.set(false); this.closeCategoryModal(); },
        error: () => this.categorySaving.set(false),
      });
    } else {
      this.categoryService.create(data).subscribe({
        next: () => { this.categorySaving.set(false); this.closeCategoryModal(); },
        error: () => this.categorySaving.set(false),
      });
    }
  }

  deleteCategory(cat: any): void {
    this.deletingCategory = cat;
    this.categoryDeleteOpen.set(true);
  }

  doDeleteCategory(): void {
    if (!this.deletingCategory) return;
    this.categorySaving.set(true);
    this.categoryService.delete(this.deletingCategory.id).subscribe({
      next: () => { this.categorySaving.set(false); this.categoryDeleteOpen.set(false); this.deletingCategory = null; },
      error: () => this.categorySaving.set(false),
    });
  }

  createTag(): void {
    const name = this.newTagName().trim();
    if (!name) return;
    this.tagService.create({ name }).subscribe({
      next: () => this.newTagName.set(''),
    });
  }

  deleteTag(tag: any): void {
    this.tagService.delete(tag.id).subscribe();
  }

  changeRole(userId: string, role: string): void {
    this.userService.updateRole(userId, role).subscribe();
  }
}
