import React, { Component } from 'react';
import styled from "styled-components";
import { Table, Button } from 'antd';


const columns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
  },
  {
    title: '一级工艺编号',
    dataIndex: 'firstGroupCode',
    key: 'firstGroupCode',
  },
  {
    title: '一级工艺名称',
    dataIndex: 'firstGroupName',
    key: 'firstGroupName',
  },
];

class _CraftTypeIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
        dataSet: [],
        selectedRowKeys: [] // 选择的key数组
    }
  }

  componentDidMount() {
    const dataSource = [
      {
        key: '1',
        num: 1,
        firstGroupCode: '01',
        firstGroupName: '机加',
        isValid: false
      },
      {
        key: '2',
        num: 2,
        firstGroupCode: '02',
        firstGroupName: '涂装',
        isValid: true
      },
      {
        key: '3',
        num: 3,
        firstGroupCode: '03',
        firstGroupName: '下料',
        isValid: true
      },
    ];

    const selectedRowKeysArr = []
    dataSource.map(item => {
      if (item.isValid ) {
        selectedRowKeysArr.push(item.key)
      }
    })

    this.setState({
      dataSet: dataSource,
      selectedRowKeys: selectedRowKeysArr
    })
  }

  saveFun = () => {
    console.log('保存数据：', this.state.selectedRowKeys)
  }
  // 通过key找该条数据并修改
  updateArr = (selectedRowKeys) => {
    const selectedRowKeysArr = selectedRowKeys;
    const dataSet = this.state.dataSet
    for(var i = 0; i< selectedRowKeysArr.length; i++) {
      const selectedItem = selectedRowKeysArr[i];
      for (var j = 0; j< dataSet.length; j++) {
        if (selectedItem.key === dataSet[j].key) {

        }
      }
    }
  }

  render() {
    const rowSelection = {
      // columnTitle: '全选',
      // columnWidth: '150px',
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        // this.updateArr(selectedRowKeys) // 更新数组
        this.setState({
          selectedRowKeys
        })
      },
/*       getCheckboxProps: record => ({
        // defaultChecked: record.isValid === true // 默认选中的列
      }), */
    };
    return (
      <div>
        <ConditionView>
          <Button type="primary" onClick={this.saveFun}>保存</Button>
        </ConditionView>
        <ContentView>
          <Table
            dataSource={this.state.dataSet}
            columns={columns}
            rowSelection={rowSelection}
            pagination={false} />
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