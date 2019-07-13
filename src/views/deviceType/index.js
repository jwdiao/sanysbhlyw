import React, { Component } from 'react'
import styled from "styled-components";
import { Input, Button,Select, Table, message } from 'antd';

import { deviceTypeColumns } from '../../utils'
import {TableButton} from "../../components/TableButton";
import { reqDeviceTypeList, reqSetFlagForMachineType } from '../../api'
import EditModel from './edit'
const { Option } = Select;


// 编辑组件
class _DeviceTypeIndex extends Component {
  
  constructor(props) {
    super(props)
    this.state ={
      deviceTypeColumns: [],
      listArr: [], // 列表

      filterConditionObj: {
        deviceTypeName: '', // 设备类型名称
        validValue: '', // 是否有效
      },

      pagination: {
        pageNum: 1, // 页码
        pageSize: 15, // 每页多少条
        total: 0, // 共多少条
      },

      editVisiable: false, // 新增弹窗是否显示
      editDataObj:{}, // 当前编辑的对象
      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }

  // 构建表头结构
  constructTableFields = () => {
    let baseColumnsArray = deviceTypeColumns
    return baseColumnsArray.concat(this.getOperationFields())
  }
  // 操作列
  getOperationFields = () => {
    return [
      {
        title: '编辑',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <TableButton
            type='edit'
            onClick={(event) => {
              this.addAndEditFun(record)
              // 防止与行点击事件冲突
              event.stopPropagation()
            }}
        />)
      }
    ];
  }
  componentDidMount() {
    // 构造列
    let tableFields = this.constructTableFields()
    this.setState({
      deviceTypeColumns: tableFields,
    })

    // 调用列表接口
    this.getListDataFun()
  }

  // 获取列表接口
  async getListDataFun() {
    // console.log('oo:',this.state.pageNum)
    const {  pagination, filterConditionObj} = this.state;
    const { pageNum, pageSize, total } = pagination
    const { deviceTypeName, validValue } = filterConditionObj
    const params = {
      "pageNum": pageNum,
      "pageSize": pageSize,
      "query": {
        "deviceTypeName": deviceTypeName, // 零件名称
        "isFlag": validValue // 是否有效（0无效，1有效）
      }
    }
    const res = await reqDeviceTypeList(params)
    if (res && res.code === 200) {
      const originalContent = res.data.list;
      const { total } = res.data;
      const dataSource = originalContent.map((content, index)=>{
        return {
          // num: index+1,
          num: ((pageNum - 1) * pageSize) + (index + 1), // 序号
          key: content.id,// 用于列表渲染的key
          deviceTypeCode: content.typeCode, // 设备类型编号
          deviceTypeName: content.typeName, // 设备类型名称
          isFlag: content.isFlag // 是否有效
        }
      })
  
      this.setState({
        listArr: dataSource,
        pagination: {...pagination,total: res.data.total}
      })
    } else {
      message.error('获取设备类型列表失败！请稍候重试。')
    }
  }
  // 设为有效和无效
  toggleSetValidFun = async(valid) => {
    const { chekboxSelectedRowKeys } = this.state;
    // console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('请勾选需要操作的行！');
      return;
    } else {
      const idStr = chekboxSelectedRowKeys.join(',')
      const res = await reqSetFlagForMachineType(idStr, valid)
      if(res && res.code === 200) {
        message.success('设置成功');
        this.setState({
          chekboxSelectedRowKeys: []
        })
        // 调用列表接口
        this.getListDataFun()
      } else {
        message.warning('设置失败！');
      }
    }
  }
  // 新增&编辑
  addAndEditFun = (record) => {
    // console.log('edit:',record)
    this.setState({
      editVisiable:true,
      editDataObj:record,
    })
  }
  // 分页导航的监听
  onPageChange = (pageNum, pageSize) => {
    // console.log('onPageChange called!', pageNum,pageSize)
    this.setState({
      pageNum: pageNum
    },() => {
      // 调用列表接口
      this.getListDataFun()      
    })
  }
  // Modal点击确定按钮的回调
  onModalOkClickedListener = () => {
    this.setState({
      editVisiable: false,
    })
    //Todo: 重新请求接口更新Data，刷新页面
    this.getListDataFun()
  }
  // Modal点击取消按钮的回调
  onModalCancelClickedListener = () => {
    this.setState({
      editVisiable: false,
    })
  }
  render() {
    const {
      deviceTypeColumns,
      listArr,
      filterConditionObj,
      pagination,
      editVisiable, editDataObj,
      chekboxSelectedRowKeys,
    } = this.state
    const { pageNum, pageSize, total } = pagination
    const rowSelection = {
      selectedRowKeys: chekboxSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          chekboxSelectedRowKeys: selectedRowKeys
        })
      }
    };
    return (
      <div>
        <ConditionView>
          <SearchView>
            <InputView
              placeholder="设备类型名称"
              onCalled={(e) => {
                const { value } = e.target
                // console.log('uuu:',value)
                this.setState({
                  filterConditionObj: {...filterConditionObj, deviceTypeName: value}
                })
              }}
            />
            <SelectView
              onCalled = {(e) => {
                // console.log('e:',e)
                this.setState({
                  filterConditionObj: {...filterConditionObj, validValue: e}
                })
              }}
            />
            <SearchBtnView
              onClickCalled = { () => {
                // console.log('搜索')
                this.setState({
                  pagination: {...pagination, pageNum: 1}
                },() => {
                  this.getListDataFun()
                })
              }}
            />
          </SearchView>
          <OptView>
            <Button type="primary" onClick={() => this.addAndEditFun({})}>新增</Button>
            <Button type="primary" onClick={() => this.toggleSetValidFun('1')}>设为有效</Button>        
            <Button type="primary" onClick={() => this.toggleSetValidFun('0')}>设为无效</Button>
          </OptView>
        </ConditionView>
        <ContentView>
          <Table
            className="data-board-table"
            dataSource={listArr}
            columns={deviceTypeColumns}
            rowSelection={rowSelection}
            pagination={{
              // total: total,
              total: total,
              showTotal: ((total) => {
                return `共${total}条`
              }),
              pageSize: pageSize,
              current: pageNum,
              onChange: this.onPageChange,
            }}
          />
        </ContentView>
        <EditModel
          editVisiable={ editVisiable }
          editDataObj = {editDataObj}
          onOkClickedListener = {this.onModalOkClickedListener}
          onCancelClickedListener={this.onModalCancelClickedListener}
        />
      </div>
    )
  }
}

const InputView = ({placeholder, onCalled}) => {
  return (
    <Input
      placeholder={placeholder}
      onChange={onCalled}
      style={{width: '30%', marginRight: '6px'}}
    />
  )
}
const SelectView = ({onCalled}) => {
  return (
    <Select
      defaultValue="" onChange={onCalled}
      style={{width: '15%', marginRight: '6px'}}
    >
      <Option value="">全部</Option>
      <Option value="1">有效</Option>
      <Option value="0">无效</Option>
    </Select>
  )
}
const SearchBtnView = ({onClickCalled}) => {
  return (
    <Button type="primary" onClick={onClickCalled}>查询</Button>
  )
}
export const DeviceTypeIndex = _DeviceTypeIndex

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
  flex:2;
`
const OptView = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  .ant-btn{ margin-left: 10px; }
`