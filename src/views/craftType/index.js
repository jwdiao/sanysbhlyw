import React, { Component } from 'react';
import styled from "styled-components";
import { Table, Button, Checkbox,message } from 'antd';
import { Durian} from '../../utils'
import { reqCraftList, reqSaveCraft } from '../../api'


class _CraftTypeIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
        dataSet: []
    }
  }

  componentDidMount() {
    this.getListDataFun()
  }
  getListDataFun = async () => {
    const companyCode = Durian.get('user').companyCode
    const res = await reqCraftList(companyCode)
    if (res && res.code === 200) {
      let originalContent = res.data;
      const dataSource = originalContent.map((item, index) => {
        return {
          num: index+1,// 用于列表展示的序号
          key: item.firstGroupCode,// 用于列表渲染的key
          firstGroupCode: item.firstGroupCode, // 工艺编号
          firstGroupName: item.firstGroupName, // 工艺名称
          isChecked: item.isChecked // 选择使用
        }
      })

      this.setState({
        dataSet: dataSource,
      })
    } else if (res && res.code === 1010) {
      // message.warn('工艺类型列表为空。请首先新增工艺类型。')
    } else {
      message.error('获取工艺类型列表失败！请稍候重试。')
    }
  }

  // 保存
  saveFun = async () => {
    const { dataSet } = this.state;
    const selectedRowKeys = []
    dataSet.forEach((item, index) => {
      if (item.isChecked) {
        selectedRowKeys.push(item)
      }
    })
    if (selectedRowKeys.length<=0) {
      message.warning('请选择！');
    } else {
      const res = await reqSaveCraft(selectedRowKeys)
      if (res && res.code === 200) {
        message.success('保存成功！');
        this.getListDataFun()
      } else {
        message.error('保存失败！请稍候重试。')
      }
    }
  }

  onChange = (record, e) => {
    console.log('record:',record)
    // console.log(`checked = ${e.target.checked}`);
    const { dataSet } = this.state;
    const newArr = dataSet.map((item, index) => {
      let newIsChecked = item.isChecked
      if(item.key === record.key) {
        newIsChecked = e.target.checked
      }
      return {
        ...item,
        isChecked: newIsChecked
      }
    })
    this.setState({
      dataSet: newArr,
    });
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
        title: '一级工艺编号',
        dataIndex: 'firstGroupCode',
        key: 'firstGroupCode',
        align: 'center'
      },
      {
        title: '一级工艺名称',
        dataIndex: 'firstGroupName',
        key: 'firstGroupName',
        align: 'center'
      },
      {
        title: '选择使用',
        align: 'center',
        key: 'action',
        render: (record) => <Checkbox checked={record.isChecked} onChange={e => this.onChange(record, e)}></Checkbox>,
      },
    ];
    const { dataSet } = this.state
    return (
      <div>
        <ConditionView>
          <Button type="primary" onClick={this.saveFun}>保存</Button>
        </ConditionView>
        <ContentView>
          <Table
            className="data-board-table"
            dataSource={dataSet}
            columns={columns}
            pagination={{
              pageSize: 15,
              showQuickJumper: true,
              total: dataSet.length,
              showTotal: ((total) => {
                return `共${total}条`
              })
            }} />
        </ContentView>
      </div>
    )
  }
}

export const CraftTypeIndex = _CraftTypeIndex;

const ConditionView = styled.div`
  // height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  // border: aqua 2px solid;
`
const ContentView = styled.div`
  margin-top: 15px;
`