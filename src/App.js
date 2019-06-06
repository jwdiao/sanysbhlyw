import React, { Component } from 'react';
import {LocaleProvider} from 'antd'
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
// import moment from 'moment';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn');

import Router from './router'

class App extends Component {
  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Router />
      </LocaleProvider>
    )
  }
}

export default App;
