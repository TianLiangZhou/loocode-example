import { Component } from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-dynamic-checkbox';

  count = 0;

  form: FormGroup;

  labels = [
    {'value': 1, 'name': '热门'},
    {'value': 2, 'name': '爆款'},
    {'value': 4, 'name': '最新'},
  ];
  selected: string[];

  constructor(public titleService: Title, public formBuilder: FormBuilder, public http: HttpClient) {
    this.form = this.formBuilder.group({
      'labels': new FormArray([])
    });
    this.getLabels().subscribe(response => {
      this.labels = (response as any).labels;
      this.labels.map( (value, index) => {
          (this.form.controls.labels as FormArray).push(new FormControl());
      });
      this.count = this.labels.length;
    });
  }

  getLabels() {
    return this.http.get('http://www.mocky.io/v2/5c95da8a3600006300941fcd');
  }

  submit($event) {
    this.selected = [];
    this.form.value.labels.map((value, index) => {
      if (value) {
        this.selected.push(this.labels[index].name);
      }
    });
  }
}
