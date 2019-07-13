import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Menu, Icon, Avatar } from 'antd';
import styled from "styled-components";
import { Durian, menuItemsSuperAdmin,menuItemsNormal } from '../../utils'
const { Sider, Content } = Layout;
const { SubMenu } = Menu;

class MyLayout extends Component {
  loginUser = Durian.get('user');

  state = {
    collapsed: false,
    selectedTabKey: '/admin/ammeterInfo', // 选中的tab key
    selectedTabTitle: '电表信息维护', // 选中的tab title
    openKeys: ['baseDataManage'],
    menuItems: []
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  onOpenChange = openKeys => {
    // console.log('openKeys:',openKeys)
    if (openKeys.length === 1 || openKeys.length === 0) {
      this.setState({
        openKeys
      })
      return
    }
    const latestOpenKey = openKeys[openKeys.length - 1]
    this.setState({
      openKeys: [latestOpenKey]
    })
  };
  getRootKeyFromChildKey = (ChildKey) => {
    const initOpenKeys = []
    this.state.menuItems.forEach(item => {
      const subMenuArr = item.subMenu
      subMenuArr.forEach(menu => {
        if (menu.key === ChildKey) {
          initOpenKeys.push(item.key)
          return;
        }
      })
    })
    return initOpenKeys;
  }
  // 退出
  logoutFun = () => {
    Durian.remove('user');
    Durian.remove('selectedTabKey');
    this.props.history.push('/login');
  }
  // 渲染icon
  renderIcon = (item) => {
    if (item.key==='baseDataManage') {
      return <span className="iconfont menu-icon" style={{ color: '#fff' }}>&#xe60b;</span>
    } else if (item.key==='businessManage') {
       return <span className="iconfont menu-icon" style={{ color: '#fff' }}>&#xe62d;</span>
    }
  }
  componentWillMount() {
    console.log('layout:',Durian.get('user'))
    if (!Durian.get('user')) {
      this.props.history.push('/login')
      return;
    }
    const roleMark = Durian.get('user').remark || '1';
    let menus = []
    if (roleMark === '1') {
      menus = menuItemsSuperAdmin
    } else {
      menus = menuItemsNormal
    }
    this.setState({
      menuItems: menus
    })
    // console.log('uu:',loginUser1)
  }
  componentDidMount() {
    
    // debugger;
    // 左侧tab选中
    let selectedKey = Durian.get('selectedTabKey')
    if (selectedKey && selectedKey.key) {
      this.setState({
        selectedTabKey: selectedKey.key,
        selectedTabTitle: selectedKey.title
      })
    } else {
      selectedKey = {key:this.state.selectedTabKey,title: this.state.selectedTabTitle}
    }

    const initOpenKeys = this.getRootKeyFromChildKey(selectedKey.key)
    this.onOpenChange(initOpenKeys)
  }

  render() {
    const {selectedTabKey, collapsed, selectedTabTitle, menuItems} = this.state
    // console.log('menuItems:',menuItems)
    if (menuItems.length<=0) return null;
    const selectedMenuTitle = menuItems.filter(item=>item.subMenu.findIndex(menu=>menu.title === selectedTabTitle)>-1)[0].title
    return (
      <Layout>
        <Sider trigger={null} collapsible collapsed={collapsed}
          width="250"
          style={{backgroundColor:'rgb(50,65,87)'}}
          className="sider-box"
        >
          <LogoContainer>
              <LogoIconView>
                  <Avatar
                      size={26}
                      src={require('../../assets/images/logo.png')}/>
              </LogoIconView>
              {
                  !collapsed && (
                      <div style={{color: '#5b9fff', fontSize:'20px', marginLeft:'10px'}}>设备互联管理系统</div>
                  )
              }
          </LogoContainer>
          <Menu
            theme="dark"
            style={{backgroundColor: 'rgb(50, 65, 87)'}}
            mode="inline"
            selectedKeys={[selectedTabKey]}
            openKeys={this.state.openKeys}
            onOpenChange={this.onOpenChange}
            onClick={( item, key, keyPath) => {
              // console.log('Menu.Item clicked', item)
              if (!Durian.get('user')) {
                this.props.history.push('/login')
                return;
              }
              const title = item.item.props.children;
              this.setState({
                selectedTabKey: item.key,
                selectedTabTitle: title
              })
              Durian.set('selectedTabKey',{key: item.key, title: title})
              this.props.history.push(item.key);
            }}
          >
            {
              menuItems.map(item => {
                return (
                  <SubMenu
                  
                    key={item.key}
                    title={
                      <span>
                        { this.renderIcon(item) }
                        <span style={{paddingLeft: '5px'}}>{item.title}</span>
                      </span>
                    }
                  >
                    {
                      item.subMenu.map(menu => {
                        return (
                          <Menu.Item key={menu.key}>{menu.title}</Menu.Item>
                        )
                      })
                    }
                  </SubMenu>
                )
              })
            }

          </Menu>
        </Sider>
        <Layout>
          <HeaderStyle>
            <HeaderContainer>
              {/* <Icon
                className="trigger"
                type={collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggle}
              /> */}
              <BreadCrumbs>{`${selectedMenuTitle}-${selectedTabTitle}`}</BreadCrumbs>
            </HeaderContainer>
            <HeaderContainer>
              <div style={{fontSize: 14, fontWeight: "normal"}}>{this.loginUser?this.loginUser.loginAccount:''},欢迎您</div>
              <div style={{fontSize: 16,marginLeft: 20,cursor:'pointer'}} onClick={this.logoutFun}>
                <span className="iconfont" style={{ color: '#666',fontSize:20,verticalAlign:'-4px',display:'inline-block' }}>&#xe64f;</span>
                <span style={{paddingLeft: 5,verticalAlign:'middle',display:'inline-block'}}>退出</span>
              </div>
            </HeaderContainer>
          </HeaderStyle>
          <Content
            style={{
              margin: '20px',
              padding: '15px',
              background: '#fff',
              minHeight: 280,
            }}
          >
            {/* Content */}
            
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(MyLayout)

const HeaderStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0;
  height: 60px;
`
const HeaderContainer = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
padding-right: 40px;
`
const BreadCrumbs = styled.div`
  color: #292929;
  font-size: 22px;
  font-weight: bold;
  padding-left: 20px;
`
const LogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: rgb(25,36,51);
`
const LogoIconView = styled.div`
  display: flex;
  height: 50px;
  // width: 100%;
  background: transparent;
  justify-content: center;
  align-items: center;
  // border: #b3d4fc 2px solid;
`