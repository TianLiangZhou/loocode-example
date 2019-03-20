import {Component, Inject, Input} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {LOCAL_STORAGE, WebStorageService} from "angular-webstorage-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-demo-todo';

  list = [];

  @Input() todo: string;

  private KEY = 'todo';

  count = 0;

  constructor(@Inject(LOCAL_STORAGE) public webStorage: WebStorageService, public titleService: Title) {
    this.titleService.setTitle(this.title);
    let storage = this.webStorage.get(this.KEY);
    if (storage !== null) {
      this.list = storage;
      this.count = storage.length;
    }
  }

  enter($event: KeyboardEvent) {
    if (($event.key === 'Enter' || $event.which === 13) && this.todo) {
        this.list.push(this.todo);
        this.webStorage.set(this.KEY, this.list);
        this.count++;
        this.todo = '';
        return;
    }
    console.log($event);
  }

  delete(i: number) {
    this.list.splice(i, 1);
    this.webStorage.set(this.KEY, this.list);
    this.count--;
  }
}
