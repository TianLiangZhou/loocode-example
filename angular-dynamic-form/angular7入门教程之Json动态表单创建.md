  表单的交互在web中是必不可少的，不管是在前台应用和后台应用中。有时候我们需要根据后端的数据动态的创建一个表单(当然不是很复杂的表单).
今天我们将通过特定的`Json`来创建一个动态表单. 在学习之前你需要熟悉`angular`, `typescript`这些内容.
你也可以看[第一篇todolist](https://loocode.com/tutorial/10136)文章来入门学习，下面就是我们实现之后的效果:

![ng-form.gif](https://image.loocode.com/upload/20190403/ng-form-min.gif)

#### 准备开始

通过命令创建好项目，部分的`html`和`css`还是复用上次的代码.

```bash
meshell@root$ ng new angular-dynamic-form
```

#### 特定数据

比如我们后台有一个功能叫系统配置项，每个配置项对应了一个名字和值`(可能是多个)`, 值的类型可能是纯数据、对象、数组。我们过通这个特定数据结构来生成表单，
这样后台添加一项配置项我们就不需要改前端代码。假设我们的数据结构像下面这样:

```javascript

const formJson = [
  {key: "version", description: 'APP当前版本号', value: "1.0.0" }, // 普通的值
  {key: "upgrade", description: 'APP升级提示', value: {
      "force": 1, // 强制升级
      "description": "升级描述"
  }}, // 对象值
  {key: "package", description: '系统默认流量包', value: ["10M", "50M", "500M"] } // 数组型
];

```

上面就是我们特定的数据，上期我们学了[Reactive Forms](https://angular.io/guide/reactive-forms), 这次我们将直接使用`ngModel`绑定数据.


#### 代码实现

将数据提供给模板使用，通过`ngFor`指令来循环数据，`ngIf`判断数据类型输出对应的模板。

```typescript

import { Component } from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-dynamic-form';

  formJson = [
    {key: "version", description: 'APP当前版本号', value: "1.0.0" }, // 普通的值
    {key: "upgrade", description: 'APP升级提示', value: {
        "force": 1, // 强制升级
        "description": "升级描述"
    }}, // 对象值
    {key: "package", description: '系统默认流量包', value: ["10M", "50M", "500M", "1G"] } // 数组型
  ];

  constructor(public titleService: Title) {
    this.titleService.setTitle(this.title)
  }

}

```

将数据绑定到模板中，并通过`*ngFor`遍历出所有配置项.

```html

...
  <ng-container *ngFor="let item of formJson; let i = index;">
    <div class="form-group">
        <label>{{ item.description }}: </label>
        <div>

        </div>
    </div>
  </ng-container>

...

```

![form-ngfor.jpg](https://image.loocode.com/upload/20190403/form-ngfor.jpg)


现在我们需要为值类型创建三个不同的模板. 我们需要提供判断值类型的函数.

```typescript
...
export class AppComponent {
  ...
  isArray(obj: any) { // 是数组
    return Array.isArray(obj);
  }

  isObject(obj: any) { // 是对象
    return obj instanceof Object && !this.isArray(obj);
  }
}
...

```

根据类型来编写`ng-template`. 通过`[(ngModel)]`来双向绑定数据.

1. 标量类型
        
通过判断不是数组也不是对象来确定为标量类型

```html

<ng-template [ngIf]="!isArray(item.value) && !isObject(item.value)">
  <div class="form-group row">
    <label class="col-3" for="input{{ item.key | titlecase }}">{{ item.description }}: </label>
    <div class="col-6">
      <input type="text" [(ngModel)]="formJson[i].value" name="{{ item.key }}" value="{{ item.value }}"  class="form-control" id="input{{ item.key | titlecase }}">
    </div>
  </div>
</ng-template>

```

2. 对象

将`Object.keys`函数绑定到`objectKeys`变量以便给模板使用.

```html
<ng-template [ngIf]="isObject(item.value)">
  <div class="form-group row" *ngFor="let key of objectKeys(item.value); first as isFirst;">
    <label class="col-3"><ng-template [ngIf]="isFirst">{{ item.description }}</ng-template></label>
    <div class="col-2">
      <input type="text" disabled value="{{ item.value }}"  class="form-control">
    </div>
    <div class="col-4">
      <input type="text" [(ngModel)]="formJson[i].value[key]" name="{{ item.key + '_' + key }}" value="{{ item.value[key] }}"  class="form-control">
    </div>
  </div>
</ng-template>

```

3. 数组

内部重新遍历内容数组.

```html
 <ng-template [ngIf]="isArray(item.value)">
  <div class="form-group row" *ngFor="let element of item.value; first as isFirst;let j = index;">
    <label class="col-3"><ng-template [ngIf]="isFirst">{{ item.description }}</ng-template></label>
    <div class="col-4">
      <input type="text" class="form-control" [(ngModel)]="formJson[i].value[j]"  name="{{ item.key + j }}" value="{{ element }}" />
    </div>
  </div>
</ng-template>
```

提交数据展示结果.

```html

<form (submit)="submit()">
...
</form>

<div class="content" *ngIf="content">
  {{ content }}
</div>

```

```typescript

  submit() {
    this.content = JSON.stringify(this.formJson);
  }

```

![ng-form.jpg](https://image.loocode.com/upload/20190403/ng-form.jpg)



#### 推荐阅读

1. <https://angular.io/guide/reactive-forms>
2. <https://www.learnrxjs.io/>
3. <https://cn.rx.js.org/>
4. [查看源码](https://github.com/TianLiangZhou/loocode-example/tree/master/angular-dynamic-form)
5. [在线示例](https://example.loocode.com/angular-dynamic-form/dist/angular-dynamic-form/index.html)
