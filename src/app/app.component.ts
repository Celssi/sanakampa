import {Component, OnInit, OnDestroy} from '@angular/core';
import words from '../sanat.json';
import {Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {MinimumPair} from './MinimumPair';
import {ProcessPackage} from './ProcessPackage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  loading = false;
  latestFoundWords: string[] = [];
  latestSearchPhrase = '';
  subject = new Subject<string>();
  showMinimumPairs = false;
  showHelp = false;
  minimumPairs: MinimumPair[] = [];
  numberOfWordSlices = 0;
  worker: Worker | null = null;
  private subscription: Subscription | null = null;

  constructor() {
    this.initWebWorker();
  }

  ngOnInit(): void {
    this.subscription = this.subject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        map((searchPhrase: string) => this.filterBy(searchPhrase))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Terminate worker to free up resources
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  initWebWorker(): void {
    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('./app.worker', import.meta.url));

    this.worker.onmessage = ({data}) => {
      try {
        if (!data || !data.type) {
          console.error('Invalid message received from worker');
          this.loading = false;
          return;
        }

        if (data.type === 'minimum') {
          this.minimumPairs = data.result || [];
        } else if (data.type === 'minimum-specific') {
          this.numberOfWordSlices = this.numberOfWordSlices - 1;
          this.minimumPairs.push(...(data.result || []));
          this.minimumPairs = this.minimumPairs.sort((a, b) => a.change.localeCompare(b.change));
        } else if (data.type === 'normal') {
          this.latestFoundWords = data.result || [];
        }

        this.loading = false;
      } catch (error) {
        console.error('Error processing worker message:', error);
        this.loading = false;
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.loading = false;
    };
  }

  filterBy(str: string): void {
    // Input validation
    if (!str || typeof str !== 'string') {
      this.loading = false;
      return;
    }

    this.initWebWorker();

    this.loading = true;
    this.latestSearchPhrase = str;
    this.numberOfWordSlices = 0;

    try {
      if (str.indexOf('->') > -1) {
        this.showMinimumPairs = true;
        this.latestFoundWords = [...new Set(words)];
        this.generateSpecificMinimumPairs(str);
      } else if (this.showMinimumPairs) {
        this.generateMinimumPairs(str);
      } else {
        this.generateNormalResults(str);
      }
    } catch (error) {
      console.error('Error during search:', error);
      this.loading = false;
    }
  }

  search($event: Event): void {
    const target = $event.target as HTMLInputElement;
    if (target && target.value) {
      this.subject.next(target.value.toLowerCase());
    }
  }

  toggleShowHelp(): void {
    this.showHelp = !this.showHelp;
  }

  toggleShowMinimumPairs(): void {
    this.showMinimumPairs = !this.showMinimumPairs;

    if (this.showMinimumPairs) {
      this.generateMinimumPairs(this.latestSearchPhrase);
    }
  }

  generateNormalResults(searchPhrase: string): void {
    this.worker!.postMessage({type: 'normal', searchPhrase} as ProcessPackage);
  }

  generateMinimumPairs(searchPhrase: string): void {
    this.worker!.postMessage({type: 'minimum', searchPhrase} as ProcessPackage);
  }

  generateSpecificMinimumPairs(wantedChange: string): void {
    this.minimumPairs = [];
    const allWords = [...this.latestFoundWords];
    const arrays = [];

    while (allWords.length > 0) {
      arrays.push(allWords.splice(0, 100));
    }

    this.numberOfWordSlices = arrays.length;
    arrays.forEach((sliceOfWords: string[]) => {
      this.worker!.postMessage({words: sliceOfWords, type: 'minimum-specific', wantedChange} as ProcessPackage);
    });
  }
}
