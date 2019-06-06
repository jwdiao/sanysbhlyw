import React, { Component } from 'react'
import styled from "styled-components";
import { Input, Button,Select, Table, Popconfirm, message } from 'antd';

import { reqPartTypeList, reqPartSave, reqSetValid } from '../../api'
import EditModel from './edit'
const { Option } = Select;


// 编辑组件
class _PartsTypeIndex extends Component {
  
  constructor(props) {
    super(props)
    this.state ={
      partTypeName: '', // 加工中心名称
      validValue: '', // 是否有效
      listArr: [], // 列表
      pageNum: 1, // 页码
      pageSize: 10, // 每页多少条
      total: 0, // 共多少条
      editVisiable: false, // 新增弹窗是否显示
      editDataObj:{}, // 当前编辑的对象
      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }
  // 查询
  searchFun = () => {
    const { partTypeName, validValue,pageSize } = this.state;
    console.log('工作中心名称为：',partTypeName,' 有效无效值：',validValue)
    this.setState({
      partTypeName,validValue,
      pageNum: 1,
      pageSize
    }, () => {
      // 调用列表
      this.getListDataFun()
    })
  }
  // 工作中心名称回调
  partTypeNameChange = (e) => {
    this.setState({
      partTypeName: e.target.value
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
    // console.log('edit:',record)
    this.setState({
      editVisiable:true,
      editDataObj:record,
    })
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
  // 新增弹窗储存数据
  saveData = async (updateData) => {
    // console.log('ok:',updateData)
    // 调用新增接口
    const res = await reqPartSave(updateData)
    if (res && res.code === 200) {
      message.success(res.data);
    } else {
      message.warning(res.msg);
    }
    // 调用列表接口
    this.getListDataFun()
  }
  // 设为有效
  confirmSetValidFun = async () => {
    const { chekboxSelectedRowKeys } = this.state;
    // console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('至少选择一个！');
      return;
    } else {
      const res = await reqSetValid(chekboxSelectedRowKeys, 1)
      if(res && res.code === 200) {
        message.success('保存成功');
        // 调用列表接口
        this.getListDataFun()
      } else {
        message.warning('保存失败！');
      }
    }
  }
  // 设为无效
  confirmSetInValidFun = async() => {
    const { chekboxSelectedRowKeys } = this.state;
    // console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('至少选择一个！');
      return;
    } else {
      const res = await reqSetValid(chekboxSelectedRowKeys, 0)
      if(res && res.code === 200) {
        message.success('保存成功');
        // 调用列表接口
        this.getListDataFun()
      } else {
        message.warning('保存失败！');
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
    const { pageNum, pageSize, partTypeName, validValue} = this.state;
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
      const { pageNum, pageSize, total } = res.data;

      const dataSource = originalContent.map((content, index)=>{
        return {
          num: ((pageNum - 1) * pageSize) + (index + 1), // 序号
          key: content.id,// 用于列表渲染的key
          partTypeCode: content.partTypeCode, // 零件类型编号
          partTypeName: content.partTypeName, // 零件类型名称
          isFlag: content.isFlag // 是否有效
        }
      })
  
      this.setState({
        listArr: dataSource,
        // pageNum,pageSize,
        total: total
      })
    } else {
      message.error('获取加工零件列表失败！请稍候重试。')
    }
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
  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center'
      },
      {
        title: '零件类型编号',
        dataIndex: 'partTypeCode',
        key: 'partTypeCode',
        align: 'center'
      },
      {
        title: '零件类型名称',
        dataIndex: 'partTypeName',
        key: 'partTypeName',
        align: 'center'
      },
      {
        title: '是否有效',
        dataIndex: 'isFlag',
        key: 'isFlag',
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
    const { partTypeName, editVisiable, editDataObj } = this.state
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
            <InputView placeholder="零件类型" value={partTypeName} onChange={this.partTypeNameChange} style={{ width: '50%',marginRight: '10px' }} />
            <Select defaultValue="" style={{ width: '30%',marginRight: '10px' }} onChange={this.handleChange}>
              <Option value="">全部</Option>
              <Option value="1">有效</Option>
              <Option value="0">无效</Option>
            </Select>
            <Button type="primary" onClick={this.searchFun}>查询</Button>
          </SearchView>
          <OptView>
            <Button type="primary" onClick={this.showModal}>新增</Button>
{/*             <Popconfirm
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
            </Popconfirm>   */} 
            <Button type="primary" onClick={this.confirmSetValidFun}>设为有效</Button>        
            <Button type="primary" onClick={this.confirmSetInValidFun}>设为无效</Button>
          </OptView>
        </ConditionView>
        <ContentView>
          <Table
            dataSource={this.state.listArr}
            columns={columns}
            rowSelection={rowSelection}
            pagination={{
              total: this.state.total,
              pageSize: this.state.pageSize,
              current: this.state.pageNum,
              onChange: this.onPageChange,
            }}
          />
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