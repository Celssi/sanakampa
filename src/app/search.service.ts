import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MinimumPair } from './MinimumPair';
import { ProcessPackage } from './ProcessPackage';

export interface SearchState {
  words: string[];
  minimumPairs: MinimumPair[];
  loading: boolean;
  error: boolean;
  numberOfWordSlices: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService implements OnDestroy {
  private worker: Worker | null = null;
  private readonly stateSubject = new BehaviorSubject<SearchState>({
    words: [],
    minimumPairs: [],
    loading: false,
    error: false,
    numberOfWordSlices: 0
  });

  readonly state$ = this.stateSubject.asObservable();

  private initWorker(): void {
    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new Worker(new URL('./app.worker', import.meta.url));

    this.worker.onmessage = ({ data }) => {
      try {
        if (!data || !data.type) {
          this.updateState({ loading: false, error: true });
          return;
        }

        const current = this.stateSubject.value;

        if (data.type === 'minimum') {
          this.updateState({
            minimumPairs: data.result || [],
            loading: false,
            error: false
          });
        } else if (data.type === 'minimum-specific') {
          const newPairs = [...current.minimumPairs, ...(data.result || [])];
          const sorted = newPairs.sort((a, b) => a.change.localeCompare(b.change));
          this.updateState({
            minimumPairs: sorted,
            numberOfWordSlices: current.numberOfWordSlices - 1,
            loading: current.numberOfWordSlices - 1 > 0,
            error: false
          });
        } else if (data.type === 'normal') {
          this.updateState({
            words: data.result || [],
            loading: false,
            error: false
          });
        }
      } catch {
        this.updateState({ loading: false, error: true });
      }
    };

    this.worker.onerror = () => {
      this.updateState({ loading: false, error: true });
    };
  }

  private updateState(partial: Partial<SearchState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...partial });
  }

  search(searchPhrase: string): void {
    if (!searchPhrase || typeof searchPhrase !== 'string') {
      this.updateState({ loading: false });
      return;
    }

    this.initWorker();
    this.updateState({ loading: true, error: false });
    this.worker!.postMessage({ type: 'normal', searchPhrase } as ProcessPackage);
  }

  searchMinimumPairs(searchPhrase: string): void {
    if (!searchPhrase || typeof searchPhrase !== 'string') {
      this.updateState({ loading: false });
      return;
    }

    this.initWorker();
    this.updateState({ loading: true, error: false });
    this.worker!.postMessage({ type: 'minimum', searchPhrase } as ProcessPackage);
  }

  searchSpecificMinimumPairs(wantedChange: string, allWords: string[]): void {
    this.initWorker();
    this.updateState({
      minimumPairs: [],
      loading: true,
      error: false,
      numberOfWordSlices: 0
    });

    const arrays: string[][] = [];
    const words = [...allWords];
    while (words.length > 0) {
      arrays.push(words.splice(0, 100));
    }

    this.updateState({ numberOfWordSlices: arrays.length, loading: true });

    arrays.forEach((sliceOfWords: string[]) => {
      this.worker!.postMessage({
        words: sliceOfWords,
        type: 'minimum-specific',
        wantedChange
      } as ProcessPackage);
    });
  }

  clear(): void {
    this.updateState({
      words: [],
      minimumPairs: [],
      loading: false,
      error: false,
      numberOfWordSlices: 0
    });
  }

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
