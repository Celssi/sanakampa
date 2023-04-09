/// <reference lib="webworker" />

import allWords from '../sanat.json';
import * as levenshtein from 'fast-levenshtein';
import {MinimumPair} from './MinimumPair';
import {ProcessPackage} from './ProcessPackage';

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
  let wordCandidates = allWords
    .filter((item) =>
      new RegExp('^' + searchPhrase.replace(/\*/g, '.*').replace(/\%/g, '.').replace(/\(k\)/g, consonants).replace(/\(v\)/g, vowels) + '$').test(item)
    )
    .filter((w) => !w.endsWith('-') && !w.startsWith('-'));

  wordCandidates = [...new Set(wordCandidates)];
  return wordCandidates;
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

addEventListener('message', ({data}: { data: ProcessPackage }) => {
  if (data.type === 'minimum') {
    const minimumPairs: MinimumPair[] = [];
    const wordCandidates = getWordCandidates(data.searchPhrase);

    wordCandidates.forEach((wordCandidate) => {
      lengthArrays[wordCandidate.length - 1].forEach((word) => {
        if (levenshtein.get(wordCandidate, word) === 1) {
          const difference = getDifference(wordCandidate, word);
          minimumPairs.push({word: wordCandidate, pair: word, change: `${wordCandidate[difference]}->${word[difference]}`});
        }
      });
    });

    postMessage({type: data.type, result: minimumPairs});
  } else if (data.type === 'minimum-specific') {
    let minimumPairs: MinimumPair[] = [];

    data.words.forEach((wordCandidate) => {
      lengthArrays[wordCandidate.length - 1].forEach((word) => {
        if (levenshtein.get(wordCandidate, word) === 1) {
          const difference = getDifference(wordCandidate, word);
          const change = `${wordCandidate[difference]}->${word[difference]}`;

          if (isWantedChange(change, data.wantedChange)) {
            minimumPairs.push({word: wordCandidate, pair: word, change});
          }
        }
      });
    });

    minimumPairs = minimumPairs.sort((a, b) => a.word.localeCompare(b.word));
    postMessage({type: data.type, result: minimumPairs});
  } else if (data.type === 'normal') {
    const wordCandidates = getWordCandidates(data.searchPhrase);
    postMessage({type: data.type, result: wordCandidates});
  }
});
