import React,{ Component } from 'react'
import styled from 'styled-components'
import {TableButton} from "../../components/TableButton";
import { ammeterInfoColumns } from '../../utils'
import EditModel from './edit'
import { reqAmmeterListByPage, reqSetFlagForElectricityInfo } from '../../api'

import { Input, Button,Select, Table, message } from 'antd';
const { Option } = Select;

class _AmmeterInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ammeterColumns: [], // 电流列
      ammeterData: [], // 电流数据

      filterConditionObj: { // 查询条件
        ammeterId: '', // 电表名称
        isValidValue: '', // 有效&无效 
      },

      pagination: {
        pageNum: 1,
        pageSize: 15,
        total: 0
      },

      editVisiable: false, // 新增弹窗是否显示
      editDataObj:{}, // 当前编辑的对象
      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }
  // 构建表头结构
  constructTableFields = () => {
    let baseColumnsArray = ammeterInfoColumns
    return baseColumnsArray.concat(this.getOperationFields())
  }
  getOperationFields = () => {
    return [ {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <TableButton
          type='edit'
          onClick={(event) => {
            this.addAndEditFun(record)
            // 防止与行点击事件冲突
            event.stopPropagation()
          }}
      />
      )
    }]
  }

  componentDidMount() {
    // 构造列
    let tableFields = this.constructTableFields()
    this.setState({
      ammeterColumns: tableFields,
    })

    // 异步获取数据
    this.getListDataFun()
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
      const res = await reqSetFlagForElectricityInfo(idStr, valid)
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
  // 获取列表接口
  async getListDataFun() {
    const { pagination, filterConditionObj } = this.state
    const { pageNum, pageSize } = pagination
    const { ammeterId, isValidValue } = filterConditionObj
    const params = {
      pageNum: pageNum,
      pageSize: pageSize,
      query: {
        deviceId: ammeterId,
        isFlag: isValidValue
      }
    }
    const res = await reqAmmeterListByPage(params)
    if (res && res.code === 200) {
      const originalContent = res.data.list;
      const { pageNum, pageSize } = this.state.pagination;
      const dataSource = originalContent.map((content, index)=>{
        return {
          num: ((pageNum - 1) * pageSize) + (index + 1), // 用于列表展示的序号
          key: content.id,// 用于列表渲染的key
          deviceId: content.deviceId, // 编号
          isFlag: content.isFlag // 是否有效
        }
      })
  
      this.setState({
        ammeterData: dataSource,
        pagination: {...pagination, total: res.data.total}
      })
    } else {
      message.error('获取电表信息列表失败！请稍候重试。')
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
    this.setState((prevState) => {
      return {
        pagination: Object.assign({}, prevState.pagination, { pageNum: pageNum})
      }
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
    const { ammeterColumns, ammeterData, editVisiable, editDataObj, pagination, filterConditionObj, chekboxSelectedRowKeys } = this.state
    const { pageNum, pageSize, total } = pagination
    console.log('pageNum:',pageNum,"pageSize:",pageSize,"total:",total)
    // rowSelection object indicates the need for row selection
    const rowSelection = {
      selectedRowKeys: chekboxSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          chekboxSelectedRowKeys: selectedRowKeys
        })
      },
    };
    return (
      <div>
        <ConditionView>
          <SearchView>
            <InputView
              placeholder="电表编号"
              onCalled={(e) => {
                const { value } = e.target
                // console.log('uuu:',value)
                this.setState({
                  filterConditionObj: {...filterConditionObj, ammeterId: value}
                })
              }}
            />
            <SelectView
              onCalled = {(e) => {
                // console.log('e:',e)
                this.setState({
                  filterConditionObj: {...filterConditionObj, isValidValue: e}
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
          <Table className="data-board-table"
                 rowSelection={rowSelection}
                 columns={ammeterColumns}
                 dataSource={ammeterData}
                 pagination={{
                  total: total,
                  showTotal: ((total) => {
                    return `共${total}条`
                  }),
                  pageSize: pageSize,
                  current: pageNum,
                  onChange: this.onPageChange,
                  showQuickJumper: true,
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

export const AmmeterInfoIndex = _AmmeterInfo;

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