import React, { Component } from 'react'
import styled from "styled-components";
import { Button, Table, Popconfirm, message, DatePicker } from 'antd';
import EditModel from './edit'

// 编辑组件
class _ProducePlanIndex extends Component {
  
  constructor(props) {
    super(props)
    this.state ={
      validValue: '1', // 是否有效
      listArr: [], // 列表
      editVisiable: false, // 新增弹窗是否显示
      editDataObj:{}, // 当前编辑的对象
      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }
  // 日期
  onDateChange = (date, dateString) => {
    console.log(dateString)
  }
  // 查询
  searchFun = () => {
    
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
    // 调用新增接口
    this.getListDataFun()
  }
  // 删除
  delFun = () => {
    const { chekboxSelectedRowKeys } = this.state;
    console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('至少选择一个！');
      return;
    }
    // 调用接口
    this.getListDataFun()
  }
  // 导入模板下载
  importTemplateFun() {

  }
  // 导入
  importFun() {

  }
  componentDidMount() {
    this.getListDataFun()
  }
  getListDataFun() {
    const originalContent = [
      {
        id: '1',
        date: '2019-05-28',
        deviceCode: '01',
        deviceName: '机加',
        partsType: '行星轮',
        partsName: '2D-级',
        planProduceNum: '15',
        finishProduceNum: '10',
        isValid: '1'
      },
      {
        id: '2',
        date: '2019-05-28',
        deviceCode: '02',
        deviceName: '涂装',
        partsType: '行星轮',
        partsName: '2D-级',
        planProduceNum: '15',
        finishProduceNum: '10',
        isValid: '0'
      },
      {
        id: '3',
        date: '2019-05-28',
        deviceCode: '03',
        deviceName: '下料',
        partsType: '行星轮',
        partsName: '2D-级',
        planProduceNum: '15',
        finishProduceNum: '10',
        isValid: '1'
      },
    ];
    const dataSource = originalContent.map((item, index)=>{
      return {
        num: index+1,// 用于列表展示的序号
        key: item.id,// 用于列表渲染的key
        date: item.date,
        deviceCode: item.deviceCode,
        deviceName: item.deviceName,
        partsType: item.partsType,
        partsName: item.partsName,
        planProduceNum: item.planProduceNum,
        finishProduceNum: item.finishProduceNum,
        isValid: item.isValid
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
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        align: 'center'
      },
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
        align: 'center'
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
        align: 'center'
      },
      {
        title: '加工零件类型',
        dataIndex: 'partsType',
        key: 'partsType',
        align: 'center'
      },
      {
        title: '加工零件名称',
        dataIndex: 'partsName',
        key: 'partsName',
        align: 'center'
      },
      {
        title: '计划生产数',
        dataIndex: 'planProduceNum',
        key: 'planProduceNum',
        align: 'center'
      },
      {
        title: '完成生产数',
        dataIndex: 'finishProduceNum',
        key: 'finishProduceNum',
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
    const { editVisiable, editDataObj } = this.state
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
            <DatePicker
              onChange={this.onDateChange}
              style={{ width: '40%',marginRight: '10px' }} />
            <Button type="primary" onClick={this.searchFun}>查询</Button>
          </SearchView>
          <OptView>
            <Button type="primary" onClick={this.importTemplateFun}>导入模板下载</Button>
            <Button type="primary" onClick={this.importFun}>导入</Button>
            <Button type="primary" onClick={this.showModal}>新增</Button> 
            <Popconfirm
              title="确定删除?"
              cancelText="取消"
              okText="确定"
              onConfirm={this.delFun}
            >
              <Button type="primary">删除</Button>
            </Popconfirm>           
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

export const ProducePlanIndex = _ProducePlanIndex