import { Component } from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-dynamic-form';

  count = 0;

  formJson = [
    {key: 'version', description: 'APP当前版本号', value: '1.0.0' }, // 普通的值
    {key: 'upgrade', description: 'APP升级提示', value: {
        'force': 1, // 强制升级
        'description': '升级描述'
      }}, // 对象值
    {key: 'package', description: '系统默认流量包', value: ['10M', '50M', '500M'] } // 数组型
  ];

  objectKeys = Object.keys;

  content = null;

  constructor(public titleService: Title) {
    this.titleService.setTitle(this.title);
    this.count = this.formJson.length;
  }

  isArray(obj: any) { // 是数组
    return Array.isArray(obj);
  }

  isObject(obj: any) { // 是对象
    return obj instanceof Object && !this.isArray(obj);
  }

  submit() {
    this.content = JSON.stringify(this.formJson);
  }
}
