import React, { Component } from 'react'
import {Table, Form, Select, Input, Button, message} from 'antd';
import styled from "styled-components";
import freshId from "fresh-id";
import {http, isEmpty, validStateList, workingProcedureColumns, workingStepColumns} from '../../utils'
import {TableButton} from "../../components/TableButton";
import {AddEditPartModal} from "./components/AddEditPartModal";
import {AddEditStepModal} from "./components/AddEditStepModal";

const EditableContext = React.createContext();

const Option = Select.Option

const _ = require('lodash')

class EditableCell extends React.Component {
  render() {
    const {
      factoryList,
      editing,
      dataIndex,
      title,
      record,
      index,
      ...restProps
    } = this.props;

    // if(dataIndex && record){
    //     console.log('dataIndex', dataIndex, 'record[dataIndex]', record[dataIndex])
    // }

    return (
        <EditableContext.Consumer>
          {(form) => {
            return (
                <td {...restProps}>
                  {
                    (
                        // 是否有效-下拉选框
                        dataIndex === 'isValid' && record[dataIndex] !== ''
                            ? validStateList.filter(status => status.value === parseInt(record[dataIndex]))[0].label //避免使用字面量作为value: 如 value为1,2,3...，显示的是'待发货/待发货'
                            : (
                                // 零件类型-下拉选择框
                                dataIndex === 'partType' && record[dataIndex] !== ''
                                    ? factoryList.filter(factory => factory.value === record[dataIndex])[0].label
                                    : restProps.children
                            )
                    )
                  }
                </td>
            );
          }}
        </EditableContext.Consumer>
    );
  }
}

class _PartsInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      partData: null,  // 零件数据
      stepData: null, // 工步数据

      partColumns: [], // 零件列
      stepColumns: [], // 工步列

      addPartModalVisible: false, //增加零件Modal
      addStepModalVisible: false, //增加程序Modal

      selectedPart: {},
      selectedProcedure: {},

      selectedRowKeysPartTable: [],
      selectedRowKeysProcedureTable: [],

      loading: false,
    };
  }

  // 零件表格 行勾选状态的监听
  onPartTableSelectChange = (selectedRowKeys) => {
    console.log('onPartTableSelectChange called: ', selectedRowKeys);
    this.setState({selectedRowKeysPartTable: selectedRowKeys});
  }

  // 工序表格 行勾选状态的监听
  onProcedureTableSelectChange = (selectedRowKeys) => {
    console.log('onProcedureTableSelectChange called: ', selectedRowKeys);
    this.setState({selectedRowKeysProcedureTable: selectedRowKeys});
  }

  componentWillMount() {
    // console.log('shippingtableA componentWillMount called', this.props)
    //Todo:For test only
    let partTableFields = this.constructTableFields('working_part')
    let stepTableFields = this.constructTableFields('working_step')
    this.setState({
      partColumns: partTableFields,
      stepColumns: stepTableFields,
    })
  }

  async componentDidMount() {
    // const result = await http.post('/factory/factoryList', {})
    // if (result.ret === '200') {
    //   this.setState({
    //     factoryList: result.data.content.map(item => ({
    //       key: `factory_${item.code}`,
    //       value: item.code,
    //       label: item.name
    //     }))
    //   })
    // } else {
    //   message.error('获取工厂列表失败！请稍候重试。')
    // }

    // Todo: this is mocked data, FOR TEST ONLY
    this.setState({
      partData: this.constructMockData('working_part'),
      stepData: this.constructMockData('working_step'),
    })

  }

  componentWillReceiveProps(nextProps, nextState) {
    // console.log('componentWillReceiveProps called', nextProps, this.props)
    const {tableType: tableTypeThis} = this.props
    const {tableType: tableTypeNext} = nextProps
    if (tableTypeThis !== tableTypeNext) {
      // console.log('componentWillReceiveProps entered')
      let partTableFields = this.constructTableFields('working_part')
      let stepTableFields = this.constructTableFields('working_step')

      this.setState({
        partColumns: partTableFields,
        stepColumns: stepTableFields,
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log('shouldComponentUpdate called', nextProps, nextState)
    return nextState !== this.state || nextProps !== this.props;
  }

  // 测试：构造测试数据
  constructMockData = (tableType) => {
    let dataSet = []

    if (tableType === 'working_part') {
      for (let i = 0; i < 10; i++) {
        dataSet.push(
            {
              index: i+1,// 序号
              key: freshId(),// 唯一ID
              partType:'行星轮',// 零件类型名称
              partNumber:i+1,// 零件编号
              partName: `${Math.ceil(Math.random()*10)}D-${i%2===0?'一':'二'}级`,// 零件名称
              isValid:i%2===0?1:2 // 是否有效
            }
        )
      }
    } else {
      for (let i = 0; i < 20; i++) {
        dataSet.push(
            {
              index: i+1,// 序号
              key: freshId(),// 唯一ID
              partName: `${Math.ceil(Math.random()*10)}D-${i%2===0?'一':'二'}级`,// 零件名称
              stepName: `O${100+i}`,// 程序名称
              procedureNumber:i+1,// 工序号
              procedureName: `${Math.ceil(Math.random()*10)}D-${i%2===0?'一':'二'}级`,// 工序名称
              procedureProduceDuration: 30,// 工序生产时间(分)
              procedureMinimumDuration: 24,// 工序最短时间(分)
              isValid:i%2===0?1:2// 是否有效
            }
        )
      }
    }
    return dataSet
  }

  // 构建表头结构
  constructTableFields = (tableType) => {
    let baseColumnsArray = []
    switch (tableType) {
      case 'working_part':
        baseColumnsArray = workingProcedureColumns
        break
      case 'working_step':
        baseColumnsArray = workingStepColumns
        break
      default:
        break
    }
    console.log('this.getOperationFields(tableType)', this.getOperationFields(tableType))
    return baseColumnsArray.concat(this.getOperationFields(tableType))
  }

  getOperationFields = (type) => {
    const editBaseColumn = {
      title: '操作',
      dataIndex: 'operation',
      width: '15%',
      render: (text, record) => {
        return (
            <div>
              <OperationArea>
                <TableButton
                    type='edit'
                    onClick={(event) => {
                      this.edit(record, type)
                      // 防止与行点击事件冲突
                      event.stopPropagation()
                    }}
                />

                {
                  type === 'working_part' && (
                      <TableButton
                          type='duplicate'
                          customizedText={'新增程序'}
                          onClick={(event) => {
                            this.addWorkingProcedure(record)
                            event.stopPropagation()
                          }}
                      />
                  )
                }

              </OperationArea>
            </div>
        );
      },
    }
    if (type === 'working_part'){
      return [
        editBaseColumn
      ]
    } else {
      return [
        editBaseColumn
      ]
    }
  }

  // 编辑(零件 或 工序)
  edit = (record, type) => {
    console.log('edit called key=',record, type)
    if (type === 'working_part') {
      this.setState({
        addPartModalVisible: true,
        selectedPart: record
      })
    } else {
      this.setState({
        addStepModalVisible: true,
        selectedProcedure: record
      })
    }
  }

  // 新增零件
  addPart = (record) => {
    console.log('addPart called key=',record)
    this.setState({
      addPartModalVisible: true,
      selectedPart: record
    })
  }

  // 批量设置零件状态
  togglePartValidation = (valid) => {
    const {selectedRowKeysPartTable} = this.state
    if (selectedRowKeysPartTable.length === 0) {
      message.error('请勾选需要操作的行！')
      return
    }
    // todo:调用接口，批量设置零件状态为有效/无效，并请求接口刷新数据

  }

  // 新增工序
  addWorkingProcedure = (record) => {
    console.log('addWorkingProcedure called key=',record)
    this.setState({
      addStepModalVisible: true,
      selectedProcedure: _.pick(record,['partNumber','partName','partType'])
    })
  }

  // 批量设置工序状态
  toggleProcedureValidation = (valid) => {
    const {selectedRowKeysProcedureTable} = this.state
    if (selectedRowKeysProcedureTable.length === 0) {
      message.error('请勾选需要操作的行！')
      return
    }
    // todo:调用接口，批量设置工序状态为有效/无效，并请求接口刷新数据

  }

  // // 点击行的回调：传入参数订单的详情，之后使用该编号调用接口即可得到订单中的物料
  // onRowClicked = (record) => {
  //   console.log('onRowClicked called', record)
  //   const {onRowClickedListener} = this.props
  //   if (onRowClickedListener) {
  //     onRowClickedListener(record)
  //   }
  // }

  // 调用网络请求
  callNetworkRequest = async ({requestUrl, params, requestMethod}) => {
    let result
    if (requestMethod === 'POST') {
      result = await http.post(requestUrl, params)
    } else {
      result = await http.get(requestUrl)
    }
    console.log(`request: ${requestUrl}`, 'params:', params, 'result:', result)
    return result
  }

  // Modal点击确定按钮的回调
  onModalOkClickedListener = () => {
    this.setState({
      addPartModalVisible: false,
      addStepModalVisible: false
    })
    //Todo: 重新请求接口更新Data，刷新页面
  }

  // Modal点击取消按钮的回调
  onModalCancelClickedListener = () => {
    this.setState({
      addPartModalVisible: false,
      addStepModalVisible: false
    })
  }

  render() {
    const {partData, stepData, selectedRowKeysPartTable, selectedRowKeysProcedureTable, factoryList, partColumns, stepColumns, addPartModalVisible, selectedPart, addStepModalVisible, selectedProcedure} = this.state;

    const partTableRowSelection = {
      selectedRowKeys: selectedRowKeysPartTable,
      onChange: this.onPartTableSelectChange,
    };

    const procedureTableRowSelection = {
      selectedRowKeys: selectedRowKeysProcedureTable,
      onChange: this.onProcedureTableSelectChange,
    };

    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columnsPart = partColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          factoryList: factoryList,
        }),
      };
    });

    const columnsStep = stepColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          factoryList: factoryList,
        }),
      };
    });

    return (
        <div>
          <StyledContent>
            <TableControllerView>
              <TableSearchView style={{width: '100%', justifyContent: 'flex-start'}}>
                <InputView
                    key={'tab3_1'}
                    placeholder={"请输入零件名称"}
                    onCalled={(e) => {
                      const {value} = e.target
                      this.setState((prevState) => {
                        return {
                          tab3_obj: Object.assign({}, prevState.tab3_obj, {recordNumber: value})
                        }
                      })
                    }}
                />

                <SelectView
                    key={'tab3_2'}
                    placeHolder="选择有效状态"
                    options={validStateList}
                    onChangeCalled={(value = '') => {
                      this.setState((prevState) => {
                        const validState = validStateList.filter(factory => factory.value === value)[0]
                        if (validState) {
                          return {
                            tab3_obj: Object.assign({}, prevState.tab3_obj,
                                {clientFactory: validState.label}
                            )
                          }
                        }
                        return {
                          tab3_obj: Object.assign({}, prevState.tab3_obj,
                              {clientFactory: ''}
                          )
                        }
                      })
                    }}
                />

                <SearchButton
                    onClickCalled={() => {}}
                />

              </TableSearchView>
              <TableButtonsView/>
            </TableControllerView>
            <EditableContext.Provider value={this.props.form}>
              <Table
                  className="data-board-table-30"
                  // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                  title={()=>{
                    return (
                        <TableButtonsView style={{justifyContent:'flex-start', height:'20px'}}>
                          <Button
                              style={{marginRight:'10px'}}
                              type={'primary'}
                              size={'small'}
                              onClick={() => this.addPart({})}
                          >新增</Button>
                          <Button
                              style={{marginRight:'10px'}}
                              type={'primary'}
                              size={'small'}
                              onClick={() => this.togglePartValidation(true)}
                          >设为有效</Button>
                          <Button
                              type={'primary'}
                              size={'small'}
                              onClick={() => this.togglePartValidation(false)}
                          >设为无效</Button>
                        </TableButtonsView>
                    )
                  }}
                  rowSelection={partTableRowSelection}
                  components={components}
                  bordered={false}
                  dataSource={partData}
                  columns={columnsPart}
                  // rowClassName="editable-row"
                  pagination={{
                    pageSize:4,
                    showQuickJumper: true,
                  }}
                  loading={partData===null}
                  // onRow={(record) => {
                  //   return {
                  //     onClick: (event) => {
                  //       // 点击行: 只有在非编辑状态并且没有点击编辑按钮，才可以响应行点击事件
                  //       this.onRowClicked(record)
                  //     },
                  //     // onDoubleClick: (event) => {},
                  //     // onContextMenu: (event) => {},
                  //     // onMouseEnter: (event) => {},  // 鼠标移入行
                  //     // onMouseLeave: (event) => {}
                  //   };
                  // }}
              />
              <div style={{height:'1px', backgroundColor:'#ddd', width:'99%', margin:'0 0.5%'}}/>
              <Table
                  className="data-board-table-70"
                  // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                  title={()=>{
                    return (
                        <TableButtonsView style={{justifyContent:'flex-start', height:'20px'}}>
                          <Button
                              style={{marginRight:'10px'}}
                              type={'primary'}
                              size={'small'}
                              onClick={() => this.toggleProcedureValidation(true)}
                          >设为有效</Button>
                          <Button
                              type={'primary'}
                              size={'small'}
                              onClick={() => this.toggleProcedureValidation(false)}
                          >设为无效</Button>
                        </TableButtonsView>
                    )
                  }}
                  rowSelection={procedureTableRowSelection}
                  components={components}
                  bordered={false}
                  dataSource={stepData}
                  columns={columnsStep}
                  // rowClassName="editable-row"
                  // pagination={{
                  //   pageSize:8,
                  //   showQuickJumper: true,
                  //   onChange: this.cancel,
                  // }}
                  pagination={false}
                  scroll={{y: 'calc((100vh - 330px)/10*5)'}}
                  loading={stepData===null}
                  // onRow={(record) => {
                  //   return {
                  //     onClick: (event) => {
                  //       // 点击行: 只有在非编辑状态并且没有点击编辑按钮，才可以响应行点击事件
                  //       this.onRowClicked(record)
                  //     },
                  //     // onDoubleClick: (event) => {},
                  //     // onContextMenu: (event) => {},
                  //     // onMouseEnter: (event) => {},  // 鼠标移入行
                  //     // onMouseLeave: (event) => {}
                  //   };
                  // }}
              />
            </EditableContext.Provider>
          </StyledContent>
          <AddEditPartModal
              addPartModalVisible={addPartModalVisible}
              onOkClickedListener={this.onModalOkClickedListener}
              onCancelClickedListener={this.onModalCancelClickedListener}
              selectedPartObj={selectedPart}
          />
          <AddEditStepModal
              addStepModalVisible={addStepModalVisible}
              onOkClickedListener={this.onModalOkClickedListener}
              onCancelClickedListener={this.onModalCancelClickedListener}
              selectedProcedureObj={selectedProcedure}
          />
        </div>

    );
  }
}

class SelectView extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.key !== this.props.key;
  }

  render() {
    const {placeHolder, options, onChangeCalled} = this.props
    return (
        <Select
            allowClear={true}
            style={{width: '15%', marginRight: '6px'}}
            placeholder={placeHolder}
            onChange={onChangeCalled}
        >
          {
            options.map(option => {
              return (
                  <Option
                      key={option.key}
                      value={option.value}>
                    {option.label}
                  </Option>
              )
            })
          }
        </Select>
    )
  }
}

const SearchButton = ({onClickCalled}) => {
  return (
      <Button
          type="primary"
          onClick={onClickCalled}
      >查询</Button>
  )
}

const InputView = ({key, placeholder, onCalled}) => {
  return (
      <Input
          key={key}
          style={{width: '30%', marginRight: '6px'}}
          placeholder={placeholder}
          onChange={onCalled}
          onPressEnter={onCalled}
      />
  )
}

const _PartsInfoIndex = Form.create()(_PartsInfo);
export const PartsInfoIndex = _PartsInfoIndex;

const OperationArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white;
  height: calc(100vh - 130px);
  // border: #5a8cff 2px solid;
`
const TableControllerView = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  // border: red solid 2px;
  padding: 0px 10px;
`

const TableSearchView = styled.div`
  display: flex;
  flex-direction: row;
  // flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  width: 70%;
  // border: yellow solid 2px;
`
const TableButtonsView = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  width: 30%;
  // border: blue solid 2px;
`


