import React, {Component} from 'react'
import {Button, Form, Input, Select, Table, message} from "antd";
import freshId from "fresh-id";
import {deviceInfoColumns, validStateList, http, validStateListForFilter, Durian} from "../../utils";
import styled from "styled-components";
import {AddEditDeviceModal} from "./components/AddEditDeviceModal";
import {TableButton} from "../../components/TableButton";
import DevicePicModal from "./components/DevicePicModal";
import {MeterRelationModal} from "./components/MeterRelationModal";
import {getPlcType, reqCraftCheckedList} from "../../api";

const EditableContext = React.createContext();

const Option = Select.Option

class EditableCell extends React.Component {
    render() {
        const {
            plcTypeList,
            editing,
            dataIndex,
            title,
            record,
            index,
            ...restProps
        } = this.props;

        const plcType = (dataIndex === 'plcType' && plcTypeList) ? plcTypeList.filter(state => parseInt(state.value) === parseInt(record[dataIndex]))[0] : null

        return (
            <EditableContext.Consumer>
                {(form) => {
                    return (
                        <td {...restProps}>
                            {
                                dataIndex === 'isValid'
                                    ? validStateList.filter(state => state.value === record[dataIndex])[0].label
                                    : (
                                        dataIndex === 'plcType' && plcTypeList
                                            ? plcType ? plcType.label : '--'
                                            : restProps.children
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
            dataSet: null,  // 设备数据
            immutableDataSet: null,  // 设备数据(用来保存不可变的数据以供筛选)
            deviceColumns: [], // 设备列
            addDeviceModalVisible: false, //增加/编辑设备Modal
            devicePicModalVisible: false, //查看设备图片Modal
            meterRelationModalVisible: false, //电表关联Modal
            selectedDevice: {},
            selectedRowKeys: [],
            loading: false,
            plcTypeList: [],

            // 筛选条件对象
            filterConditionObj: {
                deviceName: '',
                isValid: '',
            },
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
        const dataSet = await this.constructData()
        this.setState({
            dataSet,
            immutableDataSet: dataSet
        })

        //获取列表数据：机床类型
        const companyCode = Durian.get('user').companyCode
        const res = await getPlcType({companyCode, type: '05'})
        console.log('getPlcType called', res)
        if (res && res.code === 200) {
            let originalContent = res.data;
            const plcTypeList = originalContent.map((item, index) => {
                return {
                    key: item.codeCode,// 用于列表渲染的key
                    value: item.codeCode, // 机床类型编号
                    label: item.codeName, // 机床类型名称
                }
            })
            this.setState({
                plcTypeList,
            })
        } else if (res && res.code === 1010) {
            // message.warn('工艺类型列表为空。请首先进行【工艺类型维护】。')
        } else {
            message.error('获取PLC设备类型列表失败！请稍候重试。')
        }
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

    // 构造数据
    constructData = async () => {
        let params = {
            pageNum: 0,
            pageSize: 0,
        }
        let dataSet = []
        let originalContent = await this.callNetworkRequest({
            requestUrl: '/machineInfo/findlist',
            params: Object.assign({}, params, {
                // 查询全部数据
                query: {

                }
            }),
            requestMethod: 'POST'
        })

        if (originalContent.code === 200) {
            console.log('==originalContent==', originalContent)
            dataSet = originalContent.data.list.map((content, index) => {
                return {
                    index: index + 1,// 用于列表展示的序号
                    key: freshId(),// 用于列表渲染的key
                    id: content.id,// 数据库中该条数据的主键

                    belongingTechniqueCode: content.firstGroupCode,// 归属工艺
                    belongingTechnique: content.firstGroupName,// 归属工艺名称

                    belongingCenterCode: content.workCenterCode,// 归属工作中心编号(不显示)
                    belongingCenterName: content.workCenterName,// 归属工作中心名称

                    deviceTypeCode: content.machineTypeCode,// 设备类型编号(不显示)
                    deviceTypeName: content.machineTypeName,// 设备类型名称

                    plcType: content.plcType, // PLC设备类型

                    deviceNumber: content.machineNo,// 设备编号
                    deviceName: content.machineName,// 设备名称
                    deviceModel: content.machineModel,// 设备型号
                    deviceUnit: content.dataUnit, // 设备单位
                    devicePic: {
                        uid: '-1',
                        name: 'device_pic.png',
                        status: 'done',
                        url: content.imgUrl,// Todo: 图片格式要再次确认下，历史数据没有文件名后缀，无法显示
                    }, // 设备图片
                    isValid: content.isFlag || '1', // 是否有效

                    electricityStr: content.electricityStr || '暂无'// 显示的电表关联字符串
                }
            })
        }

        return dataSet
    }

    // 测试：构造测试数据
    constructMockData = () => {
        let dataSet = []
        for (let i = 0; i < 15; i++) {
            dataSet.push(
                {
                    index: i+1,// 序号
                    key: freshId(),// 唯一ID

                    belongingTechniqueCode: 'JIJIA',
                    belongingTechnique: '机加',// 归属工艺

                    belongingCenterCode: 'CEnTER',
                    belongingCenterName: '机加工作中心',// 归属工作中心

                    deviceTypeCode:'Type-1',// 设备类型
                    deviceTypeName: '数控机床',

                    plcType: 1, // PLC设备类型

                    deviceNumber:'PM'+ (i+1),// 设备编号
                    deviceName: 'rm'+ (i+1),// 设备名称
                    deviceModel: '型号I',// 设备型号
                    deviceUnit:'单位I', // 设备单位
                    devicePic: {
                        uid: '-1',
                        name: 'xxx.png',
                        status: 'done',
                        url: 'http://pic18.nipic.com/20120204/8339340_144203764154_2.jpg',
                    }, // 设备图片
                    isValid:i%2===0?'0':'1',// 是否有效

                    electricityStr: 'M-001,M-002,M-003' // 显示的电表关联字符串
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
            width: '8%',
            render: (text, record) => {
                return (
                    <div>
                        <OperationArea>
                            <a
                                style={{textDecoration: 'underline'}}
                                onClick={(event) => {
                                    this.showMeterRelations(record)
                                    // 防止与行点击事件冲突
                                    event.stopPropagation()
                                }}
                            >{record.electricityStr}</a>
                        </OperationArea>
                    </div>
                );
            },
        }, {
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
                                disabled={!record.devicePic.url || record.devicePic.url === ''}
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
        }, {
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
    showMeterRelations = (record) => {
        console.log('showMeterRelations called key=', record)
        this.setState({
            meterRelationModalVisible: true,
            selectedDevice: record
        })
    }


    // 显示设备图片
    showDevicePic = (record) => {
        console.log('showDevicePic called key=', record)
        this.setState({
            devicePicModalVisible: true,
            selectedDevice: record
        })
    }

    // 编辑设备
    edit = (record) => {
        console.log('edit called key=', record)
        this.setState({
            addDeviceModalVisible: true,
            selectedDevice: record
        })
    }

    // 新增设备
    addPart = (record) => {
        console.log('addPart called key=', record)
        this.setState({
            addDeviceModalVisible: true,
            selectedDevice: record
        })
    }

    // 批量设设备状态
    toggleMachineValidation = async (valid) => {
        const {selectedRowKeys, immutableDataSet} = this.state
        if (selectedRowKeys.length === 0) {
            message.warning('请勾选需要操作的行！')
            return
        }
        // 批量设置零件状态为有效/无效，并请求接口刷新数据
        let idsString = ''
        let idsArray = immutableDataSet.filter(data => selectedRowKeys.findIndex(key => key === data.key) > -1).map(data => data.id)
        idsArray.forEach(v=>{
            if (v!==''){
                idsString += v+','
            }
        })
        let originalContent = await this.callNetworkRequest({
            requestUrl: '/machineInfo/setFlagForMachineInfo',
            params: {
                ids: idsString,
                isFlag: !!valid ? '1' : '0',
            },
            requestMethod: 'POST'
        })

        if (originalContent.code === 200) {
            this.setState({
                showModal: false,
                dataSet: null,  // 零件数据
                immutableDataSet: null, // 零件数据(用来保存不可变的数据以供筛选)
                selectedRowKeys: [],// 清空暂存的已选择的行
            })

            const dataSet = await this.constructData()
            this.setState({
                dataSet,
                immutableDataSet: dataSet
            })

            message.success('操作成功！')
        }
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

    // 通用：Modal点击取消按钮的回调
    onModalCancelClickedListener = () => {
        this.setState({
            addDeviceModalVisible: false,
            devicePicModalVisible: false,
        })
    }

    // 添加/编辑设备Modal点击确定按钮的回调
    onAddEditDeviceModalOkClickedListener = () => {
        this.setState({
            addDeviceModalVisible: false,
        }, async ()=>{
            const dataSet = await this.constructData()
            this.setState({
                dataSet,
                immutableDataSet: dataSet
            })
        })
    }

    // 电表关联Modal点击取消按钮的回调
    onMeterRelationModalCancelClickedListener = () => {
        this.setState({
            meterRelationModalVisible: false
        }, async ()=>{
            const dataSet = await this.constructData()
            this.setState({
                dataSet,
                immutableDataSet: dataSet
            })
            this.onSearchCalled()
        })
    }

    // 搜索回调
    onSearchCalled = () => {
        const {dataSet, immutableDataSet, filterConditionObj} = this.state
        const {deviceName, isValid} = filterConditionObj
        console.log('onClickCalled', dataSet, filterConditionObj)
        let filteredData = []
        if (!(deviceName === '' && isValid === '')) {
            filteredData = immutableDataSet.filter(data => {
                if (deviceName !== '' && isValid !== '') {
                    return data.deviceName.indexOf(deviceName) > -1 && data.isValid === isValid
                } else if (deviceName !== '') {
                    return data.deviceName.indexOf(deviceName) > -1
                } else if (isValid !== '') {
                    return data.isValid === isValid
                }
            })
        } else {
            filteredData = immutableDataSet
        }
        console.log('onClickCalled', filteredData)
        this.setState({
            dataSet: filteredData
        })
    }

    render() {
        const {
            dataSet,
            selectedRowKeys,
            plcTypeList,
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
            // if (!col.editable) {
            //   return col;
            // }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    plcTypeList,
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
                                            filterConditionObj: Object.assign({}, prevState.filterConditionObj, {deviceName: value})
                                        }
                                    })
                                }}
                            />

                            <SelectView
                                key={'tab3_2'}
                                placeHolder="选择有效状态"
                                options={validStateListForFilter}
                                onChangeCalled={(value = '') => {
                                    this.setState((prevState) => {
                                        const validState = validStateList.filter(state => state.value === value)[0]
                                        if (validState) {
                                            return {
                                                filterConditionObj: Object.assign({}, prevState.filterConditionObj,
                                                    {isValid: validState.value}
                                                )
                                            }
                                        }
                                        return {
                                            filterConditionObj: Object.assign({}, prevState.filterConditionObj,
                                                {isValid: ''}
                                            )
                                        }
                                    })
                                }}
                            />

                            <SearchButton
                                onClickCalled={this.onSearchCalled}
                            />

                        </TableSearchView>
                        <TableButtonsView>
                            <Button
                                style={{marginRight: '10px'}}
                                type={'primary'}
                                onClick={() => this.addPart({})}
                            >新增</Button>
                            <Button
                                style={{marginRight: '10px'}}
                                type={'primary'}
                                onClick={() => this.toggleMachineValidation(true)}
                            >设为有效</Button>
                            <Button
                                type={'primary'}
                                onClick={() => this.toggleMachineValidation(false)}
                            >设为无效</Button>
                        </TableButtonsView>
                    </TableControllerView>
                    <EditableContext.Provider value={this.props.form}>
                        <Table
                            className="data-board-table"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            rowSelection={rowSelection}
                            components={components}
                            bordered={false}
                            dataSource={dataSet}
                            columns={columnsPart}
                            rowClassName="editable-row"
                            pagination={{
                                pageSize: 15,
                                showQuickJumper: true,
                                total: dataSet&&dataSet.length?dataSet.length:0,
                                showTotal: ((total) => {
                                  return `共${total}条`
                                })
                            }}
                            loading={dataSet === null}
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
                    onOkClickedListener={this.onAddEditDeviceModalOkClickedListener}
                    onCancelClickedListener={this.onModalCancelClickedListener}
                    selectedDeviceObj={selectedDevice}
                    plcTypeList={plcTypeList}
                />
                <DevicePicModal
                    devicePicModalVisible={devicePicModalVisible}
                    selectedDeviceObj={selectedDevice}
                    onCancelClickedListener={this.onModalCancelClickedListener}
                />
                <MeterRelationModal
                    meterRelationModalVisible={meterRelationModalVisible}
                    selectedDeviceObj={selectedDevice}
                    onCancelClickedListener={this.onMeterRelationModalCancelClickedListener}
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
            style={{width: '26%', marginRight: '6px'}}
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
  padding: 0 0 10px 0;
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