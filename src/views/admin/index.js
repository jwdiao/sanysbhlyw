import React from 'react'
import MyLayout from '../layout'

import { AmmeterInfoIndex } from '../ammeterInfo'
import { CraftTypeIndex } from '../craftType'
import { WorkCenterIndex } from '../workCenter'
import { DeviceTypeIndex } from '../deviceType'
import { DeviceInfoIndex } from '../deviceInfo'
import { PartsTypeIndex } from '../partsType'
import { PartsInfoIndex } from '../partsInfo'
import { ProducePlanIndex } from '../producePaln'

import { Route, Switch, Redirect } from "react-router-dom";

export default class extends React.Component{
  render(){
    return (
      <MyLayout>
        {/* <h1> BreadCrumbs: Admin</h1> */}
        <Switch>
            <Route exact path="/admin" render={() => (
                <Redirect to="/admin/ammeterInfo"/>
            )}/>
            <Route path="/admin/ammeterInfo" exact={true} component={AmmeterInfoIndex} />
            <Route path="/admin/craftType" exact={true} component={CraftTypeIndex} />
            <Route path="/admin/workCenter" exact={true} component={WorkCenterIndex} />
            <Route path="/admin/deviceType" exact={true} component={DeviceTypeIndex} />
            <Route path="/admin/deviceInfo" exact={true} component={DeviceInfoIndex} />
            <Route path="/admin/partsType" exact={true} component={PartsTypeIndex} />
            <Route path="/admin/partsInfo" exact={true} component={PartsInfoIndex} />
            <Route path="/admin/producePaln" exact={true} component={ProducePlanIndex} />
        </Switch>
      </MyLayout>
    )
  }
}