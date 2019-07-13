import React, {Component} from 'react';
import {Modal, Input, Table, message} from "antd";
import styled from "styled-components";
import freshId from "fresh-id";
import {electricityMeterColumns, http} from "../../../utils";
import {TableButton} from "../../../components/TableButton";

const _ = require('lodash')

const EditableContext = React.createContext();

const Search = Input.Search;

class EditableCell extends React.Component {
    render() {
        const {
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
                                restProps.children
                            }
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}

class _MeterRelationModal extends Component {

    state = {
        visibility:false, //

        relatedData: null,  // 已关联电表数据
        immutableDataSet: null,  // 已关联电表数据(用来保存不可变的数据以供筛选)
        unrelatedData: null, // 未关联电表数据

        relatedColumns: [], // 已关联电表列
        unrelatedColumns: [], // 未关联电表列

        // 筛选条件对象
        filterConditionObj: {
            meterNumber: '',
        },
    };

    componentWillMount() {
        let relatedTableFields = this.constructTableFields('related_data')
        let unrelatedTableFields = this.constructTableFields('unrelated_data')
        this.setState({
            relatedColumns: relatedTableFields,
            unrelatedColumns: unrelatedTableFields,
        })
        this.setState({
            visibility: this.props.meterRelationModalVisible
        })
    }

    async componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.meterRelationModalVisible !== this.props.meterRelationModalVisible) {
            this.setState({
                visibility: nextProps.meterRelationModalVisible,
            })
        }

        // 如果是显示，则请求并构造数据
        if (nextProps.meterRelationModalVisible) {
            const {selectedDeviceObj} = nextProps
            const unrelatedData = await this.constructData('unrelated_data', selectedDeviceObj)
            this.setState({
                relatedData: await this.constructData('related_data', selectedDeviceObj),
                unrelatedData,
                immutableDataSet: unrelatedData,
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

        if (tableType === 'related_data') {
            for (let i = 0; i < 10; i++) {
                dataSet.push(
                    {
                        index: i+1,// 序号
                        key: freshId(),// 唯一ID
                        meterNumber: `223-${i+1}`// 电表编号
                    }
                )
            }
        } else {
            for (let i = 0; i < 20; i++) {
                dataSet.push(
                    {
                        index: i+1,// 序号
                        key: freshId(),// 唯一ID
                        meterNumber: `223-${i+1}`// 电表编号
                    }
                )
            }
        }
        return dataSet
    }

    // 构造数据
    constructData = async (tableType, selectedDeviceObj) => {
        // console.log('MRM selectedDeviceObj', selectedDeviceObj)
        const machineNo = _.get(selectedDeviceObj, 'deviceNumber')
        if (!machineNo) return
        // console.log('constructData', machineNo)
        let params = {
            // pageNum: 0,
            // pageSize: 0,
        }
        let dataSet = []
        if (tableType === 'related_data') {
            let originalContent = await this.callNetworkRequest({
                requestUrl: '/machineInfo/findElectricityRelatedList',
                params: Object.assign({}, params, {
                    machineNo,
                }),
                requestMethod: 'POST'
            })

            if (originalContent.code === 200 && originalContent.data) {
                dataSet = originalContent.data.map((content, index) => {
                    return {
                        index: index + 1,// 用于列表展示的序号
                        key: freshId(),// 用于列表渲染的key
                        dataId: content.id, // 用于 取消关联时使用
                        meterNumber: content.electricityId// 电表编号
                    }
                })
            }
        } else {
            let originalContent = await this.callNetworkRequest({
                requestUrl: '/machineInfo/findNoElectricityRelatedList',
                params: Object.assign({}, params, {
                    pageNum: 0,
                    pageSize: 0,
                    query:{
                        machineNo,
                    }
                }),
                requestMethod: 'POST'
            })

            if (originalContent.code === 200 && originalContent.data) {
                dataSet = originalContent.data.list.map((content, index) => {
                    return {
                        index: index + 1,// 用于列表展示的序号
                        key: freshId(),// 用于列表渲染的key
                        dataId: content.id, // 用于 取消关联时使用
                        meterNumber: content.electricityId// 电表编号
                    }
                })
            }
        }
        console.log('===dataSet===', dataSet)
        return dataSet
    }

    // 构建表头结构
    constructTableFields = (tableType) => {
        let baseColumnsArray = electricityMeterColumns
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
                                customizedText={type === 'related_data'?'取消关联':'确认关联'}
                                onClick={(event) => {
                                    this.toggleRelationship(record, type)
                                    // 防止与行点击事件冲突
                                    event.stopPropagation()
                                }}
                            />

                        </OperationArea>
                    </div>
                );
            },
        }
        return [
            editBaseColumn
        ]
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visibility: false,
        });
        if (this.props.onCancelClickedListener) {
            this.props.onCancelClickedListener()
        }
    }

    // 切换关联状态
    toggleRelationship = async (record, type) => {
        const {selectedDeviceObj} = this.props
        const machineNo = _.get(selectedDeviceObj, 'deviceNumber')
        console.log('toggleRelationship called record, type =', record, type)

        let params = {
            machineNo,
            electricityId: record.meterNumber,
            flag: type === 'unrelated_data' ? '1' : '0'
        }

        // 如果是 取消关联，需要传递id
        if (type === 'related_data') {
            params = Object.assign({}, params, {
                id: record.dataId,
            })
        }
        // 调用接口刷新列表数据
        let originalContent = await this.callNetworkRequest({
            requestUrl: '/machineInfo/setMachineElectricityRelated',
            params,
            requestMethod: 'POST'
        })
        console.log('toggleRelationship originalContent = ',originalContent)

        if (originalContent.code === 200) {
            message.success('操作成功！')
            const unrelatedData = await this.constructData('unrelated_data', selectedDeviceObj)
            this.setState({
                relatedData: await this.constructData('related_data', selectedDeviceObj),
                unrelatedData,
                immutableDataSet: unrelatedData,
            })
        }
    }

    // 搜索回调
    onSearchCalled = () => {
        const {immutableDataSet, filterConditionObj} = this.state
        const {meterNumber} = filterConditionObj
        console.log('onClickCalled1', immutableDataSet, filterConditionObj)
        let filteredData = []
        if (meterNumber!=='') {
            filteredData = immutableDataSet.filter(data=>{
                return data.meterNumber.indexOf(meterNumber)>-1
            })
        } else {
            filteredData = immutableDataSet
        }
        console.log('onClickCalled2',filteredData)
        this.setState({
            unrelatedData: filteredData
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

    render() {
        const {
            visibility,
            relatedData,
            unrelatedData,
            relatedColumns: originalRelatedColumns,
            unrelatedColumns: originalUnrelatedColumns
        } = this.state

        const components = {
            body: {
                cell: EditableCell,
            },
        };

        const relatedColumns = originalRelatedColumns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    title: col.title,
                }),
            };
        });

        const unrelatedColumns = originalUnrelatedColumns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    title: col.title,
                }),
            };
        });

        return (
            <Modal
                title={'电表关联'}
                width='60%'
                bodyStyle={{width: '100%'}}
                visible={visibility}
                // onOk={this.handleSubmit}
                footer={null}
                // confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <StyledContent>
                    <TableControllerView>
                        <TableSearchView style={{width: '100%', justifyContent: 'flex-start'}}>
                            <SearchView
                                key={'tab5_1'}
                                placeHolder="请输入电表编号"
                                onSearchCalled={(value = '') => {
                                    console.log('onSearchCalled called!', value)
                                    this.setState((prevState) => {
                                        return {
                                            filterConditionObj: Object.assign({}, prevState.filterConditionObj, {meterNumber: value})
                                        }
                                    }, ()=>this.onSearchCalled())
                                }}
                            />
                        </TableSearchView>
                        <TableButtonsView/>
                    </TableControllerView>
                    <EditableContext.Provider value={this.props.form}>
                        <Table
                            className="data-board-mini-table-30"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            components={components}
                            bordered={false}
                            dataSource={unrelatedData}
                            columns={unrelatedColumns}
                            pagination={{
                                pageSize:5,
                                showQuickJumper: true,
                            }}
                            loading={unrelatedData===null}
                        />
                        <div style={{height:'1px', backgroundColor:'#ddd', width:'99%', margin:'0 0.5%'}}/>
                        <Table
                            className="data-board-mini-table-70"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            title={()=>'已关联电表'}
                            components={components}
                            bordered={false}
                            dataSource={relatedData}
                            columns={relatedColumns}
                            pagination={false}
                            scroll={{y: 'calc((90vh)/10*3)'}}
                            loading={relatedData===null}
                        />
                    </EditableContext.Provider>
                </StyledContent>
            </Modal>
        );
    }
}

class SearchView extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.key !== this.props.key;
    }

    render() {
        const {placeHolder, onSearchCalled} = this.props
        return (
            <Search
                placeholder={placeHolder}
                enterButton="查询"
                size="default"
                onSearch={onSearchCalled}
                // onChange={(e) => {
                //     const {value} = e.target
                //     onSearchCalled(value)
                // }}
            />
        )
    }
}

export const MeterRelationModal = _MeterRelationModal;

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
  height: 100%;
  // border: #5a8cff 2px solid;
`
const TableControllerView = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 60%;
  // border: red solid 2px;
  padding: 0px 10px 6px 10px;
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