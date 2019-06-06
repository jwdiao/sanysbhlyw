import React from 'react'

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import { HashRouter as Router, Route, Switch } from "react-router-dom";

import NotFound from '../views/common/NotFound' // 404页面
import { LoginPage } from '../views/login' // 登陆页面
import Admin from '../views/admin'; // 右侧内容 == 路由分发页面

const getRouters = () => {
  return (
        <Router basename="/sanysbhlyw">
              <Switch>
                  <Route path="/" exact={true} component={LoginPage} />
                  <Route path="/login" exact={true} component={LoginPage} />
                  <Route path="/admin" exact={false} component={Admin} />
                  <Route component={NotFound} />
              </Switch>
        </Router>
  )
}

export default getRouters;