import React, { Component } from 'react'
import styled from "styled-components";
import { Input, Button,Select, Table, Popconfirm, message } from 'antd';

import EditModel from './edit'
const { Option } = Select;

// 编辑组件
class _WorkCenterIndex extends Component {
  
  constructor(props) {
    super(props)
    this.state ={
      centerName: '', // 加工中心名称
      validValue: '1', // 是否有效
      listArr: [], // 列表
      editVisiable: false, // 新增弹窗是否显示
      editDataObj:{}, // 当前编辑的对象
      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }
  // 查询
  searchFun = () => {
    const { centerName, validValue } = this.state;
    console.log('工作中心名称为：',centerName,' 有效无效值：',validValue)
  }
  // 工作中心名称回调
  centerNameChange = (e) => {
    this.setState({
      centerName: e.target.value
    })
  }
  // 是否有效下拉
  handleChange = (value) => {
    // console.log(`selected ${value}`);
    this.setState({
      validValue: value
    })
  }
  // 编辑
  handleEdit = (record, e) => {
    console.log('edit:',record)
    this.setState({
      editVisiable:true,
      editDataObj:record,
    })
  }
  // 修改
  updateDataHandle = (values)=> {
    console.log('updata:',values)
    // 调用修改接口
  }

  // 新增弹窗
  showModal = () => {
    this.setState({
      editVisiable: true,
      editDataObj:{}
    });
  }
  // 弹窗取消
  onModelCancel = e => {
    console.log(e);
    this.setState({
      editVisiable: false,
    });
  } 
  // 弹窗储存数据
  saveData = (updateData) => {
    console.log('ok:',updateData)
    // 新增一条
/*     const { listArr } = this.state
    listArr.push(updateData)
    this.setState({
      listArr: listArr
    }) */
    // 调用新增接口
    this.getListDataFun()
  }
  // 设为有效
  confirmSetValidFun = () => {
    const { chekboxSelectedRowKeys } = this.state;
    console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('至少选择一个！');
      return;
    }
    // 调用接口
    this.getListDataFun()
  }
  // 设为无效
  confirmSetInValidFun = () => {
    const { chekboxSelectedRowKeys } = this.state;
    console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('至少选择一个！');
      return;
    }
    // 调用接口
    this.getListDataFun()
  }
  componentDidMount() {
    this.getListDataFun()
  }
  getListDataFun() {
    const originalContent = [
      {
        id: '1',
        workCenterCode: '01',
        workCenterName: '机加',
        isValid: '1'
      },
      {
        id: '2',
        workCenterCode: '02',
        workCenterName: '涂装',
        isValid: '0'
      },
      {
        id: '3',
        workCenterCode: '03',
        workCenterName: '下料',
        isValid: '1'
      },
    ];
    const dataSource = originalContent.map((content, index)=>{
      return {
        num: index+1,// 用于列表展示的序号
        key: content.id,// 用于列表渲染的key
        workCenterCode: content.workCenterCode,
        workCenterName: content.workCenterName,
        isValid: content.isValid
      }
    })

    this.setState({
      listArr: dataSource,
    })
  }
  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center'
      },
      {
        title: '工作中心编号',
        dataIndex: 'workCenterCode',
        key: 'workCenterCode',
        align: 'center'
      },
      {
        title: '工作中心名称',
        dataIndex: 'workCenterName',
        key: 'workCenterName',
        align: 'center'
      },
      {
        title: '是否有效',
        dataIndex: 'isValid',
        key: 'isValid',
        align: 'center'
      },
      {
        title: '编辑',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <Button type="primary" ghost onClick={(e) => this.handleEdit(record, e)}>编辑</Button>
        ),
      },
    ];
    const { centerName, editVisiable, editDataObj } = this.state
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          chekboxSelectedRowKeys: selectedRowKeys
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    return (
      <div>
        <ConditionView>
          <SearchView>
            <InputView placeholder="工作中心名称" value={centerName} onChange={this.centerNameChange} style={{ width: '50%',marginRight: '10px' }} />
            <Select defaultValue="1" style={{ width: '30%',marginRight: '10px' }} onChange={this.handleChange}>
              <Option value="1">有效</Option>
              <Option value="0">无效</Option>
            </Select>
            <Button type="primary" onClick={this.searchFun}>查询</Button>
          </SearchView>
          <OptView>
            <Button type="primary" onClick={this.showModal}>新增</Button>
            <Popconfirm
              title="确定设为有效?"
              cancelText="取消"
              okText="确定"
              onConfirm={this.confirmSetValidFun}
            >
              <Button type="primary">设为有效</Button>
            </Popconfirm>    
            <Popconfirm
              title="确定设为无效?"
              cancelText="取消"
              okText="确定"
              onConfirm={this.confirmSetInValidFun}
            >
              <Button type="primary">设为无效</Button>
            </Popconfirm>           
            {/* <Button type="primary" onClick={this.setInValidFun}>设为无效</Button> */}
          </OptView>
        </ConditionView>
        <ContentView>
          <Table
            dataSource={this.state.listArr}
            columns={columns}
            rowSelection={rowSelection}
            pagination={false} />
        </ContentView>
        <EditModel
          editVisiable={ editVisiable }
          onModelCancel={ this.onModelCancel}
          saveData= { this.saveData }
          editDataObj = {editDataObj}
          updateDataHandle = {this.updateDataHandle}
        />
      </div>
    )
  }
}

export const WorkCenterIndex = _WorkCenterIndex

const ConditionView = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  // border: aqua 2px solid;
`
const ContentView = styled.div`
  margin-top: 15px;
`
const SearchView = styled.div`
  flex:1;
`
const OptView = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  .ant-btn{ margin-left: 10px; }
`
const InputView = styled(Input)`
width: 300px;
border:1px solid red;
background:#ff0;

`