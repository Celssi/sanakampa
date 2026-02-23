import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import words from '../sanat.json';
import { SearchService } from './search.service';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { ResultsListComponent } from './results-list/results-list.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchBarComponent, HelpPanelComponent, ResultsListComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(SearchBarComponent) searchBar!: SearchBarComponent;

  showMinimumPairs = false;
  showHelp = false;
  latestSearchPhrase = '';

  private subject = new Subject<string>();
  private subscription: Subscription | null = null;
  private searchState = {
    words: [] as string[],
    minimumPairs: [] as { word: string; pair: string; change: string }[],
    loading: false,
    error: false,
    numberOfWordSlices: 0
  };

  private searchService = inject(SearchService);

  ngOnInit(): void {
    this.subscription = this.searchService.state$.subscribe((state) => {
      this.searchState = { ...state };
    });

    this.subscription.add(this.subject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((phrase) => this.filterBy(phrase)));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.searchService.ngOnDestroy();
  }

  get words(): string[] {
    return this.searchState.words;
  }

  get minimumPairs(): { word: string; pair: string; change: string }[] {
    return this.searchState.minimumPairs;
  }

  get loading(): boolean {
    return this.searchState.loading;
  }

  get searchError(): boolean {
    return this.searchState.error;
  }

  get numberOfWordSlices(): number {
    return this.searchState.numberOfWordSlices;
  }

  onSearch(phrase: string): void {
    this.latestSearchPhrase = phrase;
    this.subject.next(phrase);
  }

  onClearSearch(): void {
    this.latestSearchPhrase = '';
    this.searchService.clear();
    this.searchBar?.setValue('');
  }

  onTryExample(example: string): void {
    this.searchBar?.setValue(example);
    this.onSearch(example);
  }

  filterBy(str: string): void {
    if (!str || typeof str !== 'string') {
      return;
    }

    try {
      if (str.indexOf('->') > -1) {
        this.showMinimumPairs = true;
        const allWords = [...new Set(words as string[])];
        this.searchService.searchSpecificMinimumPairs(str, allWords);
      } else if (this.showMinimumPairs) {
        this.searchService.searchMinimumPairs(str);
      } else {
        this.searchService.search(str);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  }

  toggleShowHelp(): void {
    this.showHelp = !this.showHelp;
  }

  toggleShowMinimumPairs(): void {
    this.showMinimumPairs = !this.showMinimumPairs;
    if (this.showMinimumPairs && this.latestSearchPhrase) {
      this.searchService.searchMinimumPairs(this.latestSearchPhrase);
    }
  }
}
