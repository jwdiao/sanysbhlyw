import React from 'react'
import MyLayout from '../layout'

import {AmmeterInfoIndex} from '../ammeterInfo'
import {CraftTypeIndex} from '../craftType'
import {WorkCenterIndex} from '../workCenter'
import {DeviceTypeIndex} from '../deviceType'
import {DeviceInfoIndex} from '../deviceInfo'
import {PartsTypeIndex} from '../partsType'
import {PartsInfoIndex} from '../partsInfo'
import {ProducePlanIndex} from '../producePaln'

import {Route, Switch, Redirect} from "react-router-dom";
import {Durian} from "../../utils";

const _ = require('lodash')
function Topic({match}) {
    // return <h3>Requested Param: {match.params.id}</h3>;
    const path = match.params.id;
    console.log('path:', path)
    if (path === 'ammeterInfo') {
        return AmmeterInfoIndex
    } else if (path === 'craftType') {
        return CraftTypeIndex
    } else if (path === 'workCenter') {
        return WorkCenterIndex
    } else if (path === 'deviceType') {
        return DeviceTypeIndex
    } else if (path === 'deviceInfo') {
        return DeviceInfoIndex
    } else if (path === 'partsType') {
        return PartsTypeIndex
    } else if (path === 'partsInfo') {
        return PartsInfoIndex
    } else if (path === 'producePaln') {
        return ProducePlanIndex
    } else {
        return '<div>test</div>'
    }
}

export default class extends React.Component {
    state = {
        currentSelectedTab: ''
    }

    componentDidMount() {
        const currentSelectedTab = Durian.get('selectedTabKey')
        this.setState({
            currentSelectedTab
        })
    }

    componentWillReceiveProps(nextProps) {
        console.log('ADMIN ROUTE componentWillReceiveProps called', nextProps, this.props)
        if (this.props !== nextProps) {
            const currentSelectedTab = Durian.get('selectedTabKey')
            this.setState({
                currentSelectedTab
            })
        }
    }

    render() {
        const {currentSelectedTab} = this.state
        const resolvedPath = _.get(currentSelectedTab, 'key')
        return (
            <MyLayout>
                <Switch>
                    <Route exact path="/admin" render={() => {
                        if (resolvedPath) {
                            const routerPathArray = resolvedPath.split('/')
                            const routerComponentPath = routerPathArray[routerPathArray.length-1]
                            return (
                                <Redirect to={`/admin/${routerComponentPath}`}/>
                            )
                        }
                        return (
                            <Redirect to="/admin/ammeterInfo"/>
                        )
                    }}/>
                    <Route path="/admin/ammeterInfo" exact={true} component={AmmeterInfoIndex}/>
                    <Route path="/admin/craftType" exact={true} component={CraftTypeIndex}/>
                    <Route path="/admin/workCenter" exact={true} component={WorkCenterIndex}/>
                    <Route path="/admin/deviceType" exact={true} component={DeviceTypeIndex}/>
                    <Route path="/admin/deviceInfo" exact={true} component={DeviceInfoIndex}/>
                    <Route path="/admin/partsType" exact={true} component={PartsTypeIndex}/>
                    <Route path="/admin/partsInfo" exact={true} component={PartsInfoIndex}/>
                    <Route path="/admin/producePaln" exact={true} component={ProducePlanIndex}/>
                </Switch>
            </MyLayout>
        )
    }
}