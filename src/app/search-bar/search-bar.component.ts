import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <input
        [(ngModel)]="searchPhrase"
        (keyup)="onKeyup($event)"
        (input)="onKeyup($event)"
        aria-label="Hae sanoja"
        autocomplete="off"
        class="h-12 px-5 pr-12 rounded-xl border-2 border-warm-200 bg-white text-gray-800 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 focus:shadow-glow w-full transition-all duration-200"
        name="search"
        placeholder="Etsi"
        type="search"
      />
      @if (searchPhrase) {
        <button
          (click)="clear()"
          aria-label="Tyhjennä haku"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-accent-600 p-1.5 rounded-lg hover:bg-accent-50 transition-colors cursor-pointer"
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      }
    </div>
  `
})
export class SearchBarComponent {
  searchPhrase = '';
  searchTerm = output<string>();
  clearRequested = output<void>();

  onKeyup(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      const value = target.value?.trim() ?? '';
      this.searchPhrase = value;
      if (value) {
        this.searchTerm.emit(value.toLowerCase());
      } else {
        this.clearRequested.emit();
      }
    }
  }

  clear(): void {
    this.searchPhrase = '';
    this.clearRequested.emit();
  }

  setValue(value: string): void {
    this.searchPhrase = value;
  }
}
