import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/i18n/language.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet /><app-toast />`
})
export class AppComponent implements OnInit {
  constructor(private theme: ThemeService, private language: LanguageService) {}
  ngOnInit() {
    const _ = this.theme.theme();
    const __ = this.language.lang();
  }
}
