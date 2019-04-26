import { Component } from '@angular/core';

import * as DocumentEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import {Title} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {ChangeEvent} from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular2中使用ckeditor5教程';
  content = '';

  public Editor = DocumentEditor;

  config = {
    // language: 'zh-cn',
    // toolbar: [],
    // plugins: [  ],
  };

  constructor(public titleService: Title, http: HttpClient) {
    this.titleService.setTitle(this.title);
  }


  onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }



  submit() {

  }

  onChange({editor}: ChangeEvent) {
    const data = editor.getData();
    console.log(data);
    // this.content = data;
  }
}
