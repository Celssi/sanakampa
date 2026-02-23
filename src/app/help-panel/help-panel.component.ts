import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-help-panel',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="p-6 mt-6 rounded-2xl bg-white/90 backdrop-blur-sm shadow-soft border border-white/50">
        <h2 class="font-serif text-lg font-bold text-accent-700 mb-4">Ohjeet</h2>
        <ul class="space-y-3 text-gray-600 list-disc list-inside">
          <li>
            Asteriski antaa mahdollisuuden korvata yhden tai monta kirjainta. Esim. koir* löytää sanat koira ja koiras.
            <button (click)="tryExample.emit('koir*')" class="text-accent-600 hover:text-accent-700 underline font-medium cursor-pointer ml-1">Kokeile</button>
          </li>
          <li>
            Prosenttimerkki antaa mahdollisuuden korvata yhden kirjaimen. Esim. koir% löytää sanan koira, mutta ei sanaa koiras.
            <button (click)="tryExample.emit('koir%')" class="text-accent-600 hover:text-accent-700 underline font-medium cursor-pointer ml-1">Kokeile</button>
          </li>
          <li>
            (k) korvaa yhden konsonantin, mutta toimii muuten samoin kuin prosenttimerkki. Esim. (k)uu
            <button (click)="tryExample.emit('(k)uu')" class="text-accent-600 hover:text-accent-700 underline font-medium cursor-pointer ml-1">Kokeile</button>
          </li>
          <li>
            (v) korvaa yhden vokaalin, mutta toimii muuten samoin kuin prosenttimerkki. Esim. k(v)tu
            <button (click)="tryExample.emit('k(v)tu')" class="text-accent-600 hover:text-accent-700 underline font-medium cursor-pointer ml-1">Kokeile</button>
          </li>
          <li>
            Voit etsiä minimipareja, joissa on tietty kirjainvaihdos hakemalla esimerkiksi l->j
            <button (click)="tryExample.emit('l->j')" class="text-accent-600 hover:text-accent-700 underline font-medium cursor-pointer ml-1">Kokeile</button>
          </li>
        </ul>
      </div>
    }
  `
})
export class HelpPanelComponent {
  isOpen = input<boolean>(false);
  tryExample = output<string>();
}
