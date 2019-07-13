import React, {Component} from 'react'
import {Table, Form, Select, Input, Button, message} from 'antd';
import styled from "styled-components";
import freshId from "fresh-id";
import {
    http,
    isEmpty,
    validStateList,
    validStateListForFilter,
    workingProcedureColumns,
    workingStepColumns
} from '../../utils'
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

        return (
            <EditableContext.Consumer>
                {(form) => {
                    return (
                        <td {...restProps}>
                            {
                                dataIndex === 'isValid'
                                    ? validStateList.filter(state => state.value === record[dataIndex])[0].label
                                    : restProps.children
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
            immutableDataSet: null, // 零件数据(用来保存不可变的数据以供筛选)
            stepData: null, // 工步数据
            clickedPart: null, // 点击的零件

            partColumns: [], // 零件列
            stepColumns: [], // 工步列

            addPartModalVisible: false, //增加零件Modal
            addStepModalVisible: false, //增加程序Modal

            selectedPart: {},
            selectedProcedure: {},

            selectedRowKeysPartTable: [],
            selectedRowKeysProcedureTable: [],

            loading: false,

            // 筛选条件对象
            filterConditionObj: {
                partName: '',
                isValid: '',
            },
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
        const partData = await this.constructData('working_part')
        this.setState({
            partData,
            immutableDataSet: partData,
        }, async () => {
            const {partData} = this.state
            this.setState({
                stepData: await this.constructData('working_step', partData.map(data => data.id)),
                clickedPart: partData.length > 0 ? partData[0] : null,
            })
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
    constructData = async (tableType, ids) => {
        let params = {
            pageNum: 0,
            pageSize: 0,
        }

        let dataSet = []

        if (tableType === 'working_part') {
            let originalContent = await this.callNetworkRequest({
                requestUrl: '/productInfo/find/all',
                params: Object.assign({}, params, {
                    query: {
                        // 查询全部数据，不传递如下两个参数
                        // partName: '',
                        // isFlag: '',
                    }
                }),
                requestMethod: 'POST'
            })

            if (originalContent.code === 200) {
                dataSet = originalContent.data.list.map((content, index) => {
                    return {
                        index: index + 1,// 用于列表展示的序号
                        key: freshId(),// 用于列表渲染的key
                        id: content.id,// 数据库中该条数据的主键
                        partTypeCode: content.partTypeCode,// 零件类型编号
                        partTypeName: content.partTypeName,// 零件类型名称
                        partCode: content.partCode || '--',// 零件编号
                        partName: content.partName || '--',// 零件名称
                        machineNumber: content.machineNo || '--', // 设备编号
                        machineName: content.machineName, // 设备名称
                        isValid: content.isFlag, // 是否有效
                    }
                })
            }
        } else {
            let originalDatas = []
            if (ids.length > 0) {
                let originalContent = await this.callNetworkRequest({
                    requestUrl: '/productProcesses/find/productinfoid',
                    params: Object.assign({}, params, {
                        query: {
                            productInfoId: ids[0] // 接口未提供批量查询，只得这样循环调用接口再拼合数据
                        }
                    }),
                    requestMethod: 'POST'
                })
                if (originalContent.code === 200) {
                    originalDatas = originalDatas.concat(originalContent.data.list)
                }
            }
            console.log('originalDatas', originalDatas)
            dataSet = originalDatas.map((content, index) => {
                let key = freshId()
                return {
                    index: index + 1,// 序号
                    key,
                    procedureKey: key,// 唯一ID
                    id: content.id,// 数据库中该条数据的主键
                    partTypeCode: content.partTypeCode,// 零件类型编号
                    partTypeName: content.partTypeName,// 零件类型名称
                    partCode: content.partCode,// 零件编号
                    partName: content.partName,// 零件名称
                    machineNumber: content.machineNo || '--', // 设备编号
                    machineName: content.machineName, // 设备名称
                    stepName: content.procedureName,// 程序名称
                    procedureNumber: content.processNo,// 工序号
                    procedureName: content.processName,// 工序名称
                    procedureProduceDuration: content.nomalTime,// 工序生产时间(分)
                    procedureMinimumDuration: content.shortTime,// 工序最短时间(分)
                    isValid: content.isFlag// 是否有效
                }
            })
        }
        console.log('===dataSet===', dataSet)
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
        return baseColumnsArray.concat(this.getOperationFields(tableType))
    }

    getOperationFields = (type) => {
        const editBaseColumn = {
            title: '操作',
            dataIndex: 'operation',
            width: '10%',
            render: (text, record) => {
                return (
                    <div>
                        <OperationArea>
                            <TableButton
                                type='edit'
                                size={'small'}
                                onClick={(event) => {
                                    this.edit(record, type)
                                    // 防止与行点击事件冲突
                                    event.stopPropagation()
                                }}
                            />

                            {
                                type === 'working_part' && (
                                    <TableButton
                                        type='edit'
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
        if (type === 'working_part') {
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
        console.log('edit called key=', record, type)
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
        console.log('addPart called key=', record)
        this.setState({
            addPartModalVisible: true,
            selectedPart: record
        })
    }

    // 批量设置零件状态
    togglePartValidation = async (valid) => {
        const {selectedRowKeysPartTable, immutableDataSet} = this.state
        if (selectedRowKeysPartTable.length === 0) {
            message.warning('请勾选需要操作的行！')
            return
        }
        // 批量设置零件状态为有效/无效，并请求接口刷新数据
        let originalContent = await this.callNetworkRequest({
            requestUrl: '/productInfo/update/isflag',
            params: {
                idArr: immutableDataSet.filter(data => selectedRowKeysPartTable.findIndex(key => key === data.key) > -1).map(data => data.id),
                isFlag: !!valid ? '1' : '0',
            },
            requestMethod: 'POST'
        })

        if (originalContent.code === 200) {
            this.setState({
                partData: null,  // 零件数据
                immutableDataSet: null, // 零件数据(用来保存不可变的数据以供筛选)
                selectedRowKeysPartTable: [],// 清空暂存的已选择的行
            })

            const partData = await this.constructData('working_part')
            this.setState({
                partData,
                immutableDataSet: partData,
            }, async () => {
                const {partData} = this.state
                this.setState({
                    stepData: await this.constructData('working_step', partData.map(data => data.id)),
                    clickedPart: partData.length > 0 ? partData[0] : null,
                }, ()=>{
                    // 重新执行搜索
                    this.onSearchCalled()
                })
            })
        }
    }

    // 新增工序
    addWorkingProcedure = (record) => {
        console.log('addWorkingProcedure called key=', record)
        this.setState({
            addStepModalVisible: true,
            // selectedProcedure: _.pick(record,['partNumber','partName','partType'])
            selectedProcedure: record,
        })
    }

    // 批量设置工序状态
    toggleProcedureValidation = async (valid) => {
        const {selectedRowKeysProcedureTable, immutableDataSet, stepData, clickedPart} = this.state
        if (selectedRowKeysProcedureTable.length === 0) {
            message.warning('请勾选需要操作的行！')
            return
        }
        // 批量设置工序状态为有效/无效，并请求接口刷新数据
        let originalContent = await this.callNetworkRequest({
            requestUrl: 'productProcesses/update/isflag',
            params: {
                idArr: stepData.filter(data => selectedRowKeysProcedureTable.findIndex(key => key === data.key) > -1).map(data => data.id),
                isFlag: !!valid ? '1' : '0',
            },
            requestMethod: 'POST'
        })

        // 只重新请求工步的数据，不重新请求零件的数据
        if (originalContent.code === 200) {
            this.setState({
                stepData: null, // 工步数据
                selectedRowKeysProcedureTable: [],// 清空暂存的已选择的行
            })

            this.setState({
                stepData: await this.constructData('working_step', clickedPart ? [clickedPart.id] : immutableDataSet.map(data => data.id)),
            })

            message.success('操作成功！')
        }
    }

    // 点击行的回调
    onRowClicked = async (record) => {
        this.setState({
            stepData: await this.constructData('working_step', [record.id]),
            clickedPart: record,
        })
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

    // 编辑零件Modal点击确定按钮的回调
    onAddEditPartModalOkClickedListener = async () => {
        this.setState({
            addPartModalVisible: false,
        })

        //重新请求接口更新Data，刷新页面
        this.setState({
            partData: null,  // 零件数据
            immutableDataSet: null, // 零件数据(用来保存不可变的数据以供筛选)
            stepData: null, // 工步数据
        })

        const partData = await this.constructData('working_part')
        this.setState({
            partData,
            immutableDataSet: partData,
        }, async () => {
            const {partData, clickedPart} = this.state
            this.setState({
                stepData: await this.constructData('working_step', partData.map(data => data.id)),
                clickedPart: partData.length > 0 ? partData[0] : null
            })
        })

        // 重新执行搜索
        this.onSearchCalled()
    }

    // 编辑工序Modal点击确定按钮的回调
    onAddEditStepModalOkClickedListener = async () => {
        this.setState({
            addStepModalVisible: false
        })

        //重新请求接口更新Data，刷新页面
        this.setState({
            stepData: null, // 工步数据
        })

        const {partData, clickedPart} = this.state
        this.setState({
            stepData: await this.constructData('working_step', clickedPart ? [clickedPart.id] : partData.map(data => data.id)),
        })
    }

    // Modal点击取消按钮的回调
    onModalCancelClickedListener = () => {
        this.setState({
            addPartModalVisible: false,
            addStepModalVisible: false
        })
    }

    // 搜索回调
    onSearchCalled = () => {
        const {partData, immutableDataSet, filterConditionObj} = this.state
        const {partName, isValid} = filterConditionObj
        console.log('onClickCalled', partData, filterConditionObj)
        let filteredData = []
        if (!(partName === '' && isValid === '')) {
            filteredData = immutableDataSet.filter(data => {
                if (partName !== '' && isValid !== '') {
                    return data.partName.indexOf(partName) > -1 && data.isValid === isValid
                } else if (partName !== '') {
                    return data.partName.indexOf(partName) > -1
                } else if (isValid !== '') {
                    return data.isValid === isValid
                }
            })
        } else {
            filteredData = immutableDataSet
        }
        console.log('onSearchCalled', filteredData)

        this.setState({
            partData: filteredData.map((data,index)=>({...data, index: index+1 })),
        }, async ()=>{
            const {clickedPart, partData} = this.state
            this.setState({
                stepData: await this.constructData('working_step', partData.map(data => data.id)),
                clickedPart: partData.length>0 ? partData[0] : null
            })
        })
    }

    render() {
        const {
            partData,
            stepData,
            clickedPart,
            selectedRowKeysPartTable,
            selectedRowKeysProcedureTable,
            factoryList,
            partColumns,
            stepColumns,
            addPartModalVisible,
            selectedPart,
            addStepModalVisible,
            selectedProcedure
        } = this.state;

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
            // if (!col.editable) {
            //   return col;
            // }
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
            // if (!col.editable) {
            //   return col;
            // }
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
                    <EditableContext.Provider value={this.props.form}>
                        <Table
                            className="data-board-table-30"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            title={() => {
                                return (
                                    <TableControllerView>
                                        <TableSearchView style={{width: '100%', justifyContent: 'flex-start'}}>
                                            <InputView
                                                key={'tab3_1'}
                                                placeholder={"请输入零件名称"}
                                                onCalled={(e) => {
                                                    const {value} = e.target
                                                    this.setState((prevState) => {
                                                        return {
                                                            filterConditionObj: Object.assign({}, prevState.filterConditionObj, {partName: value})
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
                                                size={'default'}
                                                onClick={() => this.addPart({})}
                                            >新增</Button>
                                            <Button
                                                style={{marginRight: '10px'}}
                                                type={'primary'}
                                                size={'default'}
                                                onClick={() => this.togglePartValidation(true)}
                                            >设为有效</Button>
                                            <Button
                                                type={'primary'}
                                                size={'default'}
                                                onClick={() => this.togglePartValidation(false)}
                                            >设为无效</Button>
                                        </TableButtonsView>
                                    </TableControllerView>
                                )
                            }}
                            rowSelection={partTableRowSelection}
                            rowClassName={record => {
                                if (clickedPart) {
                                    return record.key === clickedPart.key ? 'table-row-clicked' : ''
                                }
                                return ''
                            }}
                            components={components}
                            bordered={false}
                            dataSource={partData}
                            columns={columnsPart}
                            // rowClassName="editable-row"
                            pagination={{
                                pageSize: 6,
                                showQuickJumper: true,
                                total: partData&&partData.length?partData.length:0,
                                showTotal: ((total) => {
                                  return `共${total}条`
                                }),
                                onChange: async (page, pageSize) => {
                                    const {partData} = this.state
                                    console.log('onChange called : page', page, 'pageSize', pageSize, 'partData', partData)
                                    const clickedPart = partData.filter(data => data.index === ((page - 1) * pageSize + 1))[0]
                                    this.setState({
                                        stepData: await this.constructData('working_step', clickedPart ? [clickedPart.id] : partData.map(data => data.id)),
                                        clickedPart
                                    })
                                }
                            }}
                            loading={partData === null}
                            onRow={(record) => {
                                return {
                                    onClick: (event) => {
                                        // 点击行: 只有在非编辑状态并且没有点击编辑按钮，才可以响应行点击事件
                                        this.onRowClicked(record)
                                    },
                                    // onDoubleClick: (event) => {},
                                    // onContextMenu: (event) => {},
                                    // onMouseEnter: (event) => {},  // 鼠标移入行
                                    // onMouseLeave: (event) => {}
                                };
                            }}
                        />
                        <div style={{height: '1px', backgroundColor: '#ddd', width: '99%', margin: '0 0.5%'}}/>
                        <Table
                            className="data-board-table-70"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            title={() => {
                                return (
                                    <TableControllerView>
                                        <TableSearchView style={{width: '100%', justifyContent: 'flex-start'}}>
                                            <div
                                                style={{fontWeight: 'bold'}}>{`当前零件：${clickedPart ? `${clickedPart.machineName} / ${clickedPart.partTypeName} / ${clickedPart.partName}` : '--'}`}</div>
                                        </TableSearchView>
                                        <TableButtonsView>
                                            <Button
                                                style={{marginRight: '10px'}}
                                                type={'primary'}
                                                size={'default'}
                                                onClick={() => this.toggleProcedureValidation(true)}
                                            >设为有效</Button>
                                            <Button
                                                type={'primary'}
                                                size={'default'}
                                                onClick={() => this.toggleProcedureValidation(false)}
                                            >设为无效</Button>
                                        </TableButtonsView>
                                    </TableControllerView>
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
                            loading={stepData === null}
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
                    onOkClickedListener={this.onAddEditPartModalOkClickedListener}
                    onCancelClickedListener={this.onModalCancelClickedListener}
                    selectedPartObj={selectedPart}
                />
                <AddEditStepModal
                    addStepModalVisible={addStepModalVisible}
                    onOkClickedListener={this.onAddEditStepModalOkClickedListener}
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
                size={'default'}
                allowClear={true}
                style={{width: '20%', marginRight: '6px'}}
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
            size={'default'}
            onClick={onClickCalled}
        >查询</Button>
    )
}

const InputView = ({key, placeholder, onCalled}) => {
    return (
        <Input
            key={key}
            size={'default'}
            style={{width: '40%', marginRight: '6px'}}
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
  width: 100%;
  // border: blue solid 2px;
`


