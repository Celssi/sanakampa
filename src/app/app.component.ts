import {Component, OnInit} from '@angular/core';
import words from '../sanat.json';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {MinimumPair} from './MinimumPair';
import {ProcessPackage} from './ProcessPackage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading = false;
  latestFoundWords: string[];
  latestSearchPhrase: string;
  subject = new Subject();
  showMinimumPairs = false;
  showHelp = false;
  minimumPairs: MinimumPair[] = [];
  numberOfWordSlices = 0;
  worker: Worker;

  constructor() {
    this.initWebWorker();
  }

  ngOnInit(): void {
    this.subject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        map((searchPhrase) => this.filterBy(searchPhrase))
      )
      .subscribe();
  }

  initWebWorker(): void {
    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('./app.worker', import.meta.url));

    this.worker.onmessage = ({data}) => {
      if (data.type === 'minimum') {
        this.minimumPairs = data.result;
      } else if (data.type === 'minimum-specific') {
        this.numberOfWordSlices = this.numberOfWordSlices - 1;
        this.minimumPairs.push(...data.result);
        this.minimumPairs = this.minimumPairs.sort((a, b) => a.change.localeCompare(b.change));
      } else if (data.type === 'normal') {
        this.latestFoundWords = data.result;
      }

      this.loading = false;
    };
  }

  filterBy(str): void {
    this.initWebWorker();

    this.loading = true;
    this.latestSearchPhrase = str;
    this.numberOfWordSlices = 0;

    if (str.indexOf('->') > -1) {
      this.showMinimumPairs = true;
      this.latestFoundWords = [...new Set(words)];
      this.generateSpecificMinimumPairs(str);
    } else if (this.showMinimumPairs) {
      this.generateMinimumPairs(str);
    } else {
      this.generateNormalResults(str);
    }
  }

  search($event): void {
    this.subject.next($event.target.value.toLowerCase());
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
    this.worker.postMessage({type: 'normal', searchPhrase} as ProcessPackage);
  }

  generateMinimumPairs(searchPhrase: string): void {
    this.worker.postMessage({type: 'minimum', searchPhrase} as ProcessPackage);
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
      this.worker.postMessage({words: sliceOfWords, type: 'minimum-specific', wantedChange} as ProcessPackage);
    });
  }

  getDifference(a: string, b: string): number {
    if (a.length < b.length) {
      [a, b] = [b, a];
    }

    return [...a].findIndex((chr, i) => chr !== b[i]);
  }
}
