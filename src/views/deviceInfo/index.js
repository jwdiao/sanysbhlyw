import React, { Component } from 'react'
import {Button, Form, Input, Select, Table, message} from "antd";
import freshId from "fresh-id";
import {deviceInfoColumns, validStateList, http} from "../../utils";
import styled from "styled-components";
import {AddEditDeviceModal} from "./components/AddEditDeviceModal";
import {TableButton} from "../../components/TableButton";
import DevicePicModal from "./components/DevicePicModal";
import {MeterRelationModal} from "./components/MeterRelationModal";

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

class _DeviceInfoIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceData: null,  // 设备数据
      deviceColumns: [], // 设备列
      addDeviceModalVisible: false, //增加/编辑设备Modal
      devicePicModalVisible: false, //查看设备图片Modal
      meterRelationModalVisible: false, //电表关联Modal
      selectedDevice: {},
      selectedRowKeys: [],
      loading: false,
    };
  }

  // 零件表格 行勾选状态的监听
  onDeviceTableSelectChange = (selectedRowKeys) => {
    console.log('onDeviceTableSelectChange called: ', selectedRowKeys);
    this.setState({selectedRowKeys});
  }

  componentWillMount() {
    // console.log('shippingtableA componentWillMount called', this.props)
    //Todo:For test only
    let tableFields = this.constructTableFields()
    this.setState({
      deviceColumns: tableFields,
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
      deviceData: this.constructMockData(),
    })
  }

  componentWillReceiveProps(nextProps, nextState) {
    // console.log('componentWillReceiveProps called', nextProps, this.props)
    const {tableType: tableTypeThis} = this.props
    const {tableType: tableTypeNext} = nextProps
    if (tableTypeThis !== tableTypeNext) {
      // console.log('componentWillReceiveProps entered')
      let tableFields = this.constructTableFields()
      this.setState({
        deviceColumns: tableFields,
      })
    }
  }

  // 测试：构造测试数据
  constructMockData = () => {
    let dataSet = []
    for (let i = 0; i < 15; i++) {
      dataSet.push(
          {
            index: i+1,// 序号
            key: freshId(),// 唯一ID
            belongingTechnique: '机加',// 归属工艺
            belongingCenterName: '机加工作中心',// 归属中心
            deviceType:'数控机床',// 设备类型
            deviceNumber:'PM'+ (i+1),// 设备编号
            deviceName: 'rm',// 设备名称
            deviceModel: '型号I',// 设备型号
            deviceUnit:'单位I', // 设备单位
            devicePic: {
                uid: '-1',
                name: 'xxx.png',
                status: 'done',
                url: 'http://pic18.nipic.com/20120204/8339340_144203764154_2.jpg',
            }, // 设备图片
          }
      )
    }
    return dataSet
  }

  // 构建表头结构
  constructTableFields = () => {
    let baseColumnsArray = deviceInfoColumns
    return baseColumnsArray.concat(this.getOperationFields())
  }

  getOperationFields = () => {
    return [{
      title: '电表关联',
      dataIndex: 'relatedMeter',
      width: '15%',
      render: (text, record) => {
        return (
            <div>
              <OperationArea>
                <a 
                    style={{textDecoration:'underline'}}
                    onClick={()=>{
                      this.setState({
                        meterRelationModalVisible: true
                      })
                    }}
                >电表1,电表2</a>
              </OperationArea>
            </div>
        );
      },
    },{
      title: '设备图片',
      dataIndex: 'deviceView',
      width: '5%',
      render: (text, record) => {
        return (
            <div>
              <OperationArea>
                <TableButton
                    type='duplicate'
                    customizedText={'查看'}
                    onClick={(event) => {
                      this.showDevicePic(record)
                      // 防止与行点击事件冲突
                      event.stopPropagation()
                    }}
                />
              </OperationArea>
            </div>
        );
      },
    },{
      title: '操作',
      dataIndex: 'operation',
      width: '5%',
      render: (text, record) => {
        return (
            <div>
              <OperationArea>
                <TableButton
                    type='edit'
                    onClick={(event) => {
                      this.edit(record)
                      // 防止与行点击事件冲突
                      event.stopPropagation()
                    }}
                />
              </OperationArea>
            </div>
        );
      },
    }]

  }

  // 显示设备图片
  showDevicePic = (record) => {
    console.log('edit called key=',record)
    this.setState({
      devicePicModalVisible: true,
      selectedDevice: record
    })
  }

  // 编辑设备
  edit = (record) => {
    console.log('edit called key=',record)
    this.setState({
      addDeviceModalVisible: true,
      selectedDevice: record
    })
  }

  // 新增设备
  addPart = (record) => {
    console.log('addPart called key=',record)
    this.setState({
      addDeviceModalVisible: true,
      selectedDevice: record
    })
  }

  // 批量设设备状态
  togglePartValidation = (valid) => {
    const {selectedRowKeys} = this.state
    if (selectedRowKeys.length === 0) {
      message.error('请勾选需要操作的行！')
      return
    }
    // todo:调用接口，批量设置零件状态为有效/无效，并请求接口刷新数据

  }

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
      addDeviceModalVisible: false,
      devicePicModalVisible: false,
      meterRelationModalVisible: false
    })
    //Todo: 重新请求接口更新Data，刷新页面
  }

  // Modal点击取消按钮的回调
  onModalCancelClickedListener = () => {
    this.setState({
      addDeviceModalVisible: false,
      devicePicModalVisible: false,
      meterRelationModalVisible: false
    })
  }

  render() {
    const {
      deviceData,
      selectedRowKeys,
      factoryList,
      deviceColumns,
      addDeviceModalVisible,
      devicePicModalVisible, //查看设备图片Modal
      meterRelationModalVisible, //电表关联Modal
      selectedDevice
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onDeviceTableSelectChange,
    };

    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columnsPart = deviceColumns.map((col) => {
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
                    placeholder={"请输入设备名称"}
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
                  className="data-board-table"
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
                  rowSelection={rowSelection}
                  components={components}
                  bordered={false}
                  dataSource={deviceData}
                  columns={columnsPart}
                  rowClassName="editable-row"
                  pagination={{
                    pageSize:10,
                    showQuickJumper: true,
                  }}
                  loading={deviceData===null}
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
          <AddEditDeviceModal
              addDeviceModalVisible={addDeviceModalVisible}
              onOkClickedListener={this.onModalOkClickedListener}
              onCancelClickedListener={this.onModalCancelClickedListener}
              selectedDeviceObj={selectedDevice}
          />
          <DevicePicModal
              devicePicModalVisible={devicePicModalVisible}
              selectedDeviceObj={selectedDevice}
              onCancelClickedListener={this.onModalCancelClickedListener}
          />
          <MeterRelationModal
              meterRelationModalVisible={meterRelationModalVisible}
              selectedDeviceObj={selectedDevice}
              onCancelClickedListener={this.onModalCancelClickedListener}
          />
        </div>
    )
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

export const DeviceInfoIndex = Form.create()(_DeviceInfoIndex)

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