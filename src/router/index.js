import React, {Component} from 'react'

import {HashRouter as Router, Route, Switch, Redirect} from "react-router-dom";

import NotFound from '../views/common/NotFound' // 404页面
import {LoginPage} from '../views/login' // 登陆页面
import Admin from '../views/admin';
import {Durian} from "../utils"; // 右侧内容 == 路由分发页面

const _ = require('lodash')

class getRouters extends Component{
    state = {
        currentSelectedTab: '',
        loggedInUser:'',
    }

    componentDidMount() {
        console.log('ROUTER INDEX componentDidMount called', this.props)
        const currentSelectedTab = Durian.get('selectedTabKey')
        const loggedInUser = Durian.get('user')
        this.setState({
            currentSelectedTab,
            loggedInUser
        })
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log('ROUTER INDEX componentWillReceiveProps called', nextProps, this.props)
        if (this.props !== nextProps) {
            const currentSelectedTab = Durian.get('selectedTabKey')
            const loggedInUser = Durian.get('user')
            this.setState({
                currentSelectedTab,
                loggedInUser
            })
        }
    }

    render() {
        const {currentSelectedTab, loggedInUser} = this.state
        const resolvedPath = _.get(currentSelectedTab, 'key')
        const loggedInAccount = _.get(loggedInUser, 'loginAccount')
        console.log('ROUTER INDEX:',resolvedPath,loggedInAccount)
        return (
            <Router>
                <Switch>
                    <Route path="/" exact={true}
                           render={() => {
                               console.log('router/index render called!',resolvedPath,loggedInAccount)
                               if (resolvedPath && loggedInAccount) {
                                   return (
                                       <Redirect to={`${resolvedPath}`}/>
                                   )
                               }
                               return (
                                   <Redirect to="/login"/>
                               )
                           }}/>
                    <Route path="/login" exact={true} component={LoginPage}/>
                    <Route path="/test" exact={true} component={NotFound}/>
                    <Route path="/admin" exact={false} component={Admin}/>
                    <Route component={NotFound}/>
                </Switch>
            </Router>
        )
    }
}

export default getRouters;