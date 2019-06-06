import React, {Component} from 'react';
import {Modal, Input, Table} from "antd";
import styled from "styled-components";
import freshId from "fresh-id";
import {electricityMeterColumns} from "../../../utils";
import {TableButton} from "../../../components/TableButton";

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
        unrelatedData: null, // 未关联电表数据

        relatedColumns: [], // 已关联电表列
        unrelatedColumns: [], // 未关联电表列
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
            relatedData: this.constructMockData('related_data'),
            unrelatedData: this.constructMockData('unrelated_data'),
        })

    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.meterRelationModalVisible !== this.props.meterRelationModalVisible) {
            this.setState({
                visibility: nextProps.meterRelationModalVisible
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

    // 构建表头结构
    constructTableFields = (tableType) => {
        let baseColumnsArray = electricityMeterColumns
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
    toggleRelationship = (record, type) => {
        console.log('toggleRelationship called record, type =',record, type)

        // if (type === 'related_data') {
        //     this.setState({
        //         addPartModalVisible: true,
        //         selectedPart: record
        //     })
        // } else {
        //     this.setState({
        //         addStepModalVisible: true,
        //         selectedProcedure: record
        //     })
        // }

        //Todo: 调用接口刷新列表数据
    }

    render() {
        const {visibility, relatedData, unrelatedData, relatedColumns: originalRelatedColumns, unrelatedColumns: originalUnrelatedColumns} = this.state

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
                                placeHolder="请输入电表名称"
                                onSearchCalled={(value = '') => {
                                    console.log('onSearchCalled called!', value)
                                    this.setState((prevState) => {
                                        return {
                                            tab5_obj: Object.assign({}, prevState.tab5_obj, {material: value}, {materialDescription: value})
                                        }
                                    })
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
                            dataSource={relatedData}
                            columns={relatedColumns}
                            pagination={{
                                pageSize:5,
                                showQuickJumper: true,
                            }}
                            loading={relatedData===null}
                        />
                        <div style={{height:'1px', backgroundColor:'#ddd', width:'99%', margin:'0 0.5%'}}/>
                        <Table
                            className="data-board-mini-table-70"
                            // bodyStyle={{minHeight: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)'}}
                            title={()=>'未关联电表'}
                            components={components}
                            bordered={false}
                            dataSource={unrelatedData}
                            columns={unrelatedColumns}
                            pagination={false}
                            scroll={{y: 'calc((90vh)/10*3)'}}
                            loading={unrelatedData===null}
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
                onChange={(e) => {
                    const {value} = e.target
                    onSearchCalled(value)
                }}
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