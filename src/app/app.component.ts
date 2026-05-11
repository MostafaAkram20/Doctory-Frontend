import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet /><app-toast />`
})
export class AppComponent implements OnInit {
  constructor(private theme: ThemeService) {}
  ngOnInit() {
    // ensure theme signal is evaluated on startup
    const _ = this.theme.theme();
  }
}
