import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {Button, Form, Input, message} from "antd";
import styled, { keyframes } from "styled-components";

import { Encrypt, Durian} from '../../utils'
import { reqLogin } from '../../api'

class _LoginPage extends Component {
  constructor(props) {
    super(props);
    this.userName = "";
    this.password = "";
    this.state={
      
    }
  }
  componentDidMount() {
  }
  clearFormFields = () => {
    console.log('clear input fields');
    this.props.form.resetFields();
  }
  handleLoginSubmit = async (e) => {
    e.preventDefault();
    this.props.form.validateFields( async (err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        let userName = values.userName;
        let password = values.password;
        // password = Encrypt.encryptBy3DES(password).toString();

        // syzj syyp 生产计划排程和所有
        const res = await reqLogin(userName,password);
        if (res && res.code === 200 && res.data) {
        
          // res.data.loginAccount = 'zhangsan'
          const { account, companyCode, token} = res.data
          // let token = '82bab92b-3939-4523-a643-32955280037f'
          const user = {
            loginAccount: account,
            companyCode: companyCode,
            token: token
          }
          Durian.set('user', user);
          this.props.history.push('/admin');
        } else {
          message.error('登录失败。请检查用户名或密码后重试。')
        }
      } else {
        message.error('登录失败。请检查用户名或密码后重试。')
      }
    });
  }

  render() {
    const {
      getFieldDecorator, getFieldError
    } = this.props.form;

    // Only show error after a field is touched.
    const userNameError = getFieldError('userName');
    const passwordError = getFieldError('password');

    return (
      <RootView>
        <BackgroundImage alt="" src={require('../../assets/images/pcbg.png')} />
        <ContentView>
          <LoginTableView>
            <LoginLogoView>
              <img style={{ width: '48px', marginBottom: '8px' }} src={require('../../assets/images/logo.png')} alt="" />
              <div style={{ height: '50px' }}>设备互联管理系统</div>
            </LoginLogoView>
            <Form
                onSubmit={this.handleLoginSubmit}
                style={{ width: '100%',height: '200px', overflow: 'hidden' }}
            >
              <Form.Item
                  validateStatus={userNameError ? 'error' : ''}
                  help={userNameError || ''}
                  style={{ marginLeft: '10%', width: '80%' }}
              >
                {getFieldDecorator('userName', {
                  rules: [
                    { required: true, message: '请输入您的用户名!' },
                  ],
                })(
                    <Input
                        placeholder="输入您的用户名"
                        prefix={<span className="iconfont" style={{ color: '#09B6FD' }}>&#xe65a;</span>}
                        allowClear
                        className="login_input"
                    />
                )}
              </Form.Item>
              <Form.Item
                  hasFeedback
                  validateStatus={passwordError ? 'error' : ''}
                  help={passwordError || ''}
                  style={{ marginLeft: '10%', width: '80%' }}
              >
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码!' }],
                })(
                    <Input.Password
                        placeholder="输入您的密码"
                        prefix={<span className="iconfont" style={{ color: '#09B6FD' }}>&#xe777;</span>}
                        className="login_input"
                    />
                )}
              </Form.Item>
              <Form.Item>
                <LoginButtonsView>
                  <Button type={"primary"} htmlType="submit" style={{ width: '80%' }}>登录</Button>
                </LoginButtonsView>
              </Form.Item>
            </Form>
            }

          </LoginTableView>
        </ContentView>
      </RootView >
    );
  }
}

export const LoginPage = withRouter(Form.create()(_LoginPage));;

const RootView = styled.div`
  display: flex;
  background: -webkit-radial-gradient(circle farthest-corner at 50% 75%, #0C2A55, #000023); /* Safari 5.1 - 6.0 */
  background: -o-radial-gradient(circle farthest-corner at 50% 75%,, #0C2A55, #000023); /* Opera 11.6 - 12.0 */
  background: -moz-radial-gradient(circle farthest-corner at 50% 75%,, #0C2A55, #000023); /* Firefox 3.6 - 15 */
  background: radial-gradient(circle farthest-corner at 50% 75%, #0C2A55, #000023); /* 标准的语法 */
  height: 100vh;
`
const breathe = keyframes`
    0% {
      opacity: .2;
    }

    100% {
      opacity: 1;
    }
`

const BackgroundImage = styled.img`
  width:60%;
  display: flex;
  flex-direction: column;
  animation-timing-function: ease-in-out;
  animation-name: ${breathe};
  animation-duration: 2700ms;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  -webkit-animation-timing-function: ease-in-out;
  -webkit-animation-name: ${breathe};
  -webkit-animation-duration: 2700ms;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-direction: alternate;
`

const LoginTableView = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  // height: 400px;
  border: rgba(63,91,184,0.2) solid 2px;
  border-radius: 4px;
  align-self: flex-end;
  justify-content: center;
  align-items: center;
  background-color: rgba(2,11,40,0.5);
  z-index: 100;
`
const LoginLogoView = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 100px;overflow:hidden;
  // border: red solid 2px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  color: white;
  font-size: xx-large;
  z-index: 100;
`
const ContentView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-right: 10%;
  z-index: 100;
`

const LoginButtonsView = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  // border: #1DA57A solid 2px;
  justify-content: center;
  align-items: center;
  z-index: 100;
`
