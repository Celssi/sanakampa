/// <reference lib="webworker" />

import allWords from '../sanat.json';
import * as levenshtein from 'fast-levenshtein';
import { MinimumPair } from './MinimumPair';
import { ProcessPackage } from './ProcessPackage';

function getDifference(a: string, b: string): number {
  if (a.length < b.length) {
    [a, b] = [b, a];
  }

  return [...a].findIndex((chr, i) => chr !== b[i]);
}

const consonants = '[b-df-hj-np-tv-z]';
const consonantRegexp = new RegExp(consonants);

const vowels = '(?![b-df-hj-np-tv-z]).';
const vowelRegexp = new RegExp(vowels);

function getWordCandidates(searchPhrase: string): string[] {
  try {
    // Escape special regex characters except our custom wildcards
    const pattern = '^' +
      searchPhrase
        .replace(/\*/g, '.*')
        .replace(/\%/g, '.')
        .replace(/\(k\)/g, consonants)
        .replace(/\(v\)/g, vowels) +
      '$';

    const regex = new RegExp(pattern);

    let wordCandidates = allWords
      .filter((item) => regex.test(item))
      .filter((w) => !w.endsWith('-') && !w.startsWith('-'));

    wordCandidates = [...new Set(wordCandidates)];
    return wordCandidates;
  } catch (error) {
    console.error('Error creating regex pattern:', error);
    return [];
  }
}

function isWantedChange(change: string, wantedChange: string): boolean {
  if (wantedChange === '(k)->(v)') {
    const changePieces = change.split('->');
    return consonantRegexp.test(changePieces[0]) && vowelRegexp.test(changePieces[1]);
  } else if (wantedChange === '(v)->(k)') {
    const changePieces = change.split('->');
    return vowelRegexp.test(changePieces[0]) && consonantRegexp.test(changePieces[1]);
  }

  return change === wantedChange;
}

function getLengthArrays(words: string[]): string[][] {
  const results = [];

  for (let i = 1; i < 32; i++) {
    results.push(words.filter((w) => w.length === i));
  }

  return results;
}

const lengthArrays = getLengthArrays(allWords);

addEventListener('message', ({ data }: { data: ProcessPackage }) => {
  try {
    if (!data || !data.type) {
      console.error('Invalid message received');
      return;
    }

    if (data.type === 'minimum') {
      const minimumPairs: MinimumPair[] = [];
      const wordCandidates = getWordCandidates(data.searchPhrase);

      wordCandidates.forEach((wordCandidate) => {
        const lengthArray = lengthArrays[wordCandidate.length - 1];
        if (!lengthArray) return;

        lengthArray.forEach((word) => {
          if (levenshtein.get(wordCandidate, word) === 1) {
            const difference = getDifference(wordCandidate, word);
            minimumPairs.push({ word: wordCandidate, pair: word, change: `${wordCandidate[difference]}->${word[difference]}` });
          }
        });
      });

      postMessage({ type: data.type, result: minimumPairs });
    } else if (data.type === 'minimum-specific') {
      let minimumPairs: MinimumPair[] = [];

      if (!data.words || !Array.isArray(data.words)) {
        postMessage({ type: data.type, result: minimumPairs });
        return;
      }

      data.words.forEach((wordCandidate) => {
        const lengthArray = lengthArrays[wordCandidate.length - 1];
        if (!lengthArray) return;

        lengthArray.forEach((word) => {
          if (levenshtein.get(wordCandidate, word) === 1) {
            const difference = getDifference(wordCandidate, word);
            const change = `${wordCandidate[difference]}->${word[difference]}`;

            if (isWantedChange(change, data.wantedChange)) {
              minimumPairs.push({ word: wordCandidate, pair: word, change });
            }
          }
        });
      });

      minimumPairs = minimumPairs.sort((a, b) => a.word.localeCompare(b.word));
      postMessage({ type: data.type, result: minimumPairs });
    } else if (data.type === 'normal') {
      const wordCandidates = getWordCandidates(data.searchPhrase);
      postMessage({ type: data.type, result: wordCandidates });
    }
  } catch (error) {
    console.error('Worker error processing message:', error);
    postMessage({ type: 'error', result: [] });
  }
});
