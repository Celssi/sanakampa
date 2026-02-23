import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MinimumPair } from '../MinimumPair';

@Component({
  selector: 'app-results-list',
  standalone: true,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    @if (showError()) {
      <div class="py-8 px-6 text-center rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="font-semibold text-red-700">Hakutapahtui virhe</p>
        <p class="text-sm mt-1 text-red-600">Yritä uudelleen.</p>
      </div>
    }
    @if (!loading() && !showError() && searchPhrase() && numberOfWordSlices() === 0 && hasNoResults()) {
      <div class="py-10 text-center">
        <p class="font-medium text-gray-700">Sanoja ei löytynyt</p>
        <p class="text-sm mt-2 text-gray-600">
          Kokeile villikortteja: <code class="bg-warm-100 px-2 py-0.5 rounded-lg text-accent-600 font-mono">*</code> (useita kirjaimia) tai
          <code class="bg-warm-100 px-2 py-0.5 rounded-lg text-accent-600 font-mono">%</code> (yksi kirjain)
        </p>
      </div>
    }
    @if (showMinimumPairs() && !loading() && minimumPairs().length > 0) {
      <p class="text-sm text-accent-600 mb-4 font-semibold">{{ minimumPairs().length }} minimiparia löytyi</p>
      @for (minimumPair of minimumPairs(); track minimumPair; let i = $index) {
        <div
          [ngClass]="i % 2 === 0 ? 'bg-warm-50' : 'bg-white'"
          class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-xl hover:bg-accent-50/60 transition-colors border-b border-warm-100 last:border-0"
        >
          <dt class="text-base font-medium text-gray-800">{{ minimumPair.word }}</dt>
          <dt class="text-base font-medium text-gray-800">{{ minimumPair.pair }}</dt>
          <dt class="text-base font-semibold text-accent-600">{{ minimumPair.change }}</dt>
        </div>
      }
    }
    @if (!showMinimumPairs() && !loading() && words().length > 0) {
      <p class="text-sm text-accent-600 mb-4 font-semibold">{{ words().length }} sanaa löytyi</p>
      @for (word of words(); track word; let i = $index) {
        <div
          [ngClass]="i % 2 === 0 ? 'bg-warm-50' : 'bg-white'"
          class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-xl hover:bg-accent-50/60 transition-colors border-b border-warm-100 last:border-0"
        >
          <dt class="text-base font-medium text-gray-800">{{ word }}</dt>
        </div>
      }
    }
  `
})
export class ResultsListComponent {
  words = input<string[]>([]);
  minimumPairs = input<MinimumPair[]>([]);
  loading = input<boolean>(false);
  showError = input<boolean>(false);
  showMinimumPairs = input<boolean>(false);
  searchPhrase = input<string>('');
  numberOfWordSlices = input<number>(0);

  hasNoResults(): boolean {
    if (this.numberOfWordSlices() > 0) return false;
    const showMin = this.showMinimumPairs();
    const words = this.words();
    const pairs = this.minimumPairs();
    return (showMin && pairs.length === 0) || (!showMin && words.length === 0);
  }
}
