import React, { Component } from 'react';
import styled from "styled-components";

class NotFound extends Component {
  render() {
    return (
      <RootView>
        <PageContent>
          <NotFoundImage alt="" src={require('../../assets/images/404.png')} />
          <p>您访问的页面不存在！</p>
        </PageContent>
      </RootView>
    );
  }
}

export default NotFound;

const RootView = styled.div`
  width:100%;
  background:#fff;
  height: 100vh;
`
const PageContent = styled.div`
  display:flex;
  width:100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const NotFoundImage = styled.img`
  width:34%;
  margin:0 auto;
  margin-top:30%;
`
