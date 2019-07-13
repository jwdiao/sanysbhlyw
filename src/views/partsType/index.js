import React, { Component } from 'react'
import styled from "styled-components";
import { Input, Button,Select, Table, message } from 'antd';

import { reqPartTypeList, reqSetPartValid } from '../../api'
import { partTypeColumns } from '../../utils'
import EditModel from './edit'
const { Option } = Select;


// 编辑组件
class _PartsTypeIndex extends Component {
  
  constructor(props) {
    super(props)
    this.state ={
      partTypeColumn: [], // 表格列
      listArr: [], // 列表

      filterConditionObj: { // 查询条件
        partTypeName: '', // 加工中心名称
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
  // 构建标题结构
  constructTableFields = () => {
    let baseColumnArray = partTypeColumns
    return baseColumnArray.concat(this.getOperationFields())
  }
  // 操作列
  getOperationFields = () => {
    return [
      {
        title: '编辑',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <Button type="primary" size={'small'} ghost onClick={(e) => this.addEditPartType(record, e)}>编辑</Button>
        ),
      }
    ]
  }

  componentWillMount() {
    let partTypeColumn = this.constructTableFields();
    this.setState({
      partTypeColumn: partTypeColumn
    })

    // 获取公司编码
    // this.companyCode = Durian.get('user').companyCode 
  }

  // 设为有效和无效
  toggleSetValidFun = async(valid) => {
    const { chekboxSelectedRowKeys } = this.state;
    // console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('请勾选要操作的行！');
      return;
    } else {
      const res = await reqSetPartValid(chekboxSelectedRowKeys, valid)
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
  componentDidMount() {
    // 调用列表接口
    this.getListDataFun()
  }
  // 获取列表接口
  async getListDataFun() {
    // console.log('oo:',this.state.pageNum)
    const { pagination, filterConditionObj} = this.state;
    const { pageNum, pageSize } = pagination
    const { partTypeName, validValue } = filterConditionObj
    const params = {
      "pageNum": pageNum,
      "pageSize": pageSize,
      "query": {
        "partTypeName": partTypeName, // 零件名称
        "isFlag": validValue // 是否有效（0无效，1有效）
      }
    }
    const res = await reqPartTypeList(params)
    if (res && res.code === 200) {
      const originalContent = res.data.list;
      const { pageNum, pageSize } = this.state.pagination;

      const dataSource = originalContent.map((content, index)=>{
        return {
          num: ((pageNum - 1) * pageSize) + (index + 1), // 序号
          key: content.id,// 用于列表渲染的key
          partTypeCode: content.partTypeCode, // 零件类型编号
          partTypeName: content.partTypeName, // 零件类型名称
          isFlag: content.isFlag // 是否有效
        }
      })
  
      this.setState((prevState) => {
        return {
          listArr: dataSource,
          pagination: Object.assign({}, prevState.pagination, { total: res.data.total }),
        }
      })
    } else {
      message.error('获取加工零件列表失败！请稍候重试。')
    }
  }
  // 分页导航的监听
  onPageChange = (pageNum, pageSize) => {
    // console.log('onPageChange called!', pageNum,pageSize)
    this.setState((prevState) => {
      return {
        pagination: Object.assign({}, prevState.pagination, { pageNum: pageNum})
      }
    },() => {
      // 调用列表接口
      this.getListDataFun()      
    })
  }
  // 新增&编辑弹窗
  addEditPartType = (record) => {
    console.log('edit:',record)
    this.setState({
      editVisiable: true,
      editDataObj: record
    });
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
      partTypeColumn, listArr,
      filterConditionObj,
      editVisiable, editDataObj,
      pagination,
      chekboxSelectedRowKeys
    } = this.state
    const { pageNum, pageSize, total } = pagination;
    // const { partTypeName } = filterConditionObj
    console.log(pageNum, pageSize, total)
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
              placeholder="零件类型名称"
              onCalled={(e) => {
                const { value } = e.target
                // console.log('uuu:',value)
                this.setState({
                  filterConditionObj: {...filterConditionObj, partTypeName: value}
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
            <Button type="primary" onClick={() => this.addEditPartType({})}>新增</Button>
            <Button type="primary" onClick={() => this.toggleSetValidFun('1')}>设为有效</Button>        
            <Button type="primary" onClick={() => this.toggleSetValidFun('0')}>设为无效</Button>
          </OptView>
        </ConditionView>
        <ContentView>
          <Table
            className={'data-board-table'}
            dataSource={listArr}
            columns={partTypeColumn}
            rowSelection={rowSelection}
            pagination={{
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
export const PartsTypeIndex = _PartsTypeIndex

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