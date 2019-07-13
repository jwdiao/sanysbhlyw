import React, { Component } from 'react'
import styled from "styled-components";
import { Button, Table, message, DatePicker, Upload, Modal } from 'antd';
import EditModel from './edit'
import { producePlanColumns, Durian } from '../../utils'
import { reqFindByPlanDate, reqDelPlanByIds, reqdownloadPlan, reqUploadPlan } from '../../api'
import moment from 'moment';
import {EventEmitter} from "events";
const eventEmitter = new EventEmitter()

// 导入
const propsImportExcel = {
  accept: '.xls,.xlsx',
  name: 'file',//upload file name
  showUploadList: false,
  // action: `${http.baseUploadUrl}/material/upload`,
  // action: `http://10.88.195.191:9099/machineworkingplanMain/save/upload`,
  multiple:false,
  onStart(file){
      // console.log('onStart', file, file.name);
  },
  onSuccess(ret, file) {
      // console.log('onSuccess', ret, file.name);
      if (ret.ret === '500') {
          message.error(ret.msg)
      } else if (ret.code === 200) {
          message.success('数据导入成功！')
          // 获取列表数据
          // this.getListDataFun()
          eventEmitter.emit('refresh_data')
      }
  },
  onError(err) {
      // console.log('onError', err);
  },
  onProgress({ percent }, file) {
      // console.log('onProgress', `${percent}%`, file.name);
  },
  customRequest({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials,
    }) {
      const formData = new FormData();
      formData.append('uploadFile', file) // 把需要传递的参数append到formData中
      reqUploadPlan(formData, onProgress).then(({ data: response }) => {
        onSuccess(response, file);
      }).catch(onError);
    }
};

// 编辑组件
class _ProducePlanIndex extends Component {
  constructor(props) {
    super(props)
    this.companyCode = '' // 公司编码
    this.state ={
      producePlanColumn: [], // 列
      listArr: [], // 列表
      filterConditionObj: { // 查询条件
        dateStr: ''
      },

      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },

      editVisiable: false, // 新增&编辑弹窗是否显示
      editDataObj:{}, // 当前编辑的对象

      chekboxSelectedRowKeys: [] // 选中的checkbox
    }
  }
  // 构建标题结构
  constructTableFields = () => {
    let baseColumnArray = producePlanColumns
    return baseColumnArray.concat(this.getOperationFields())
  }
  // 操作列
  getOperationFields = () => {
    return [
      {
        title: '编辑',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <Button type="primary"
          disabled={!(record.overNum===0 && record.overNumDay===0 && record.overNumNight===0)}
          ghost onClick={(e) => this.addPlan(record, e)}>编辑</Button>
        ),
      }
    ]
  }
  componentWillMount() {
    let producePlanColumn = this.constructTableFields();
    this.setState({
      producePlanColumn: producePlanColumn
    })

    // 获取公司编码
    this.companyCode = Durian.get('user').companyCode 
  }
  componentDidMount() {
    // 获取列表数据
    this.getListDataFun()
    // 事件监听器
    this.eventE1 = eventEmitter.addListener('refresh_data', async ()=>{
      this.getListDataFun()
    })
  }
  componentWillUnmount() {
    eventEmitter.removeAllListeners()
  }
  // 搜索条件日期回调
  onDateChange = (date, dateString) => {
    // console.log(dateString)
    this.setState((prevState) =>{
      return {
        filterConditionObj: Object.assign({}, prevState.filterConditionObj, { dateStr: dateString })
      }
    })
  }
  // 查询
  searchFun = () => {
    this.setState((prevState) => {
      return {
        pagination: Object.assign({}, prevState.pagination, { pageNum: 1})
      }
    }, () => {
      // 调用列表
      this.getListDataFun()
    })
  }

  // 新增&编辑弹窗
  addPlan = (record) => {
    console.log('edit:',record)
    this.setState({
      editVisiable: true,
      editDataObj: record
    });
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

  // 删除
  delFun = async () => {
    const { chekboxSelectedRowKeys } = this.state;
    console.log('chekboxSelectedRowKeys:',chekboxSelectedRowKeys)
    if(chekboxSelectedRowKeys.length<=0) {
      message.warning('请勾选要操作的行！');
      return;
    }
    // return;
    Modal.confirm({
      title: '确认删除?',
      // content: 'When clicked the OK button, this dialog will be closed after 1 second',
      onOk:async() => {
        // 调用接口
        const res = await reqDelPlanByIds(chekboxSelectedRowKeys)
        if (res && res.code === 200) {
          message.success('删除成功！')
          this.getListDataFun()
        } else {
          message.error('删除失败！')
        }
      },
      onCancel() {},
    });
  }
  // 导入模板下载
  importTemplateFun = async() => {
    const dateStr = this.state.filterConditionObj.dateStr ? this.state.filterConditionObj.dateStr : moment(new Date()).format('YYYY-MM-DD')
    // console.log('dateStr:',dateStr)
    // return;
    const res = await reqdownloadPlan({
      companyCode: this.companyCode,
      planDate: dateStr // 其中planDate格式为yyyy-MM-dd
    })
    const blob = new Blob([res],{type: "application/vnd.ms-excel"}); // type不写也行
    const fileName = dateStr+'日生产计划.xlsx'; // 文件名称
    if ('download' in document.createElement('a')) { // 非IE下载          
      const elink = document.createElement('a');
      elink.download = fileName; //下载后文件名
      elink.style.display = 'none';
      elink.href = URL.createObjectURL(blob); //创建下载的链接
      document.body.appendChild(elink);
      elink.click(); //点击下载
      URL.revokeObjectURL(elink.href); // 释放URL 对象
      document.body.removeChild(elink); //下载完成移除元素
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  }


  async getListDataFun() {
    const { filterConditionObj, pagination } = this.state
    const { pageNum, pageSize, total } = pagination
    // console.log('查询条件是：',filterConditionObj.dateStr)
    const params = {
      pageNum: pageNum,
      pageSize: pageSize,
      query: {
        planDate: filterConditionObj.dateStr,
        companyCode: this.companyCode
      }
    }
    // console.log('params:',params)
    const res = await reqFindByPlanDate(params)
    if (res && res.code === 200) {
      const originalContent = res.data.list;
      let newDataArr = []
      newDataArr = originalContent.map((item, index)=>{
        // 注意转换的时候IE不能直接转为('YYYY-MM-DD'),
        const dateFormateStr = moment(item.planDate).format('YYYY/MM/DD').split('/').join('-')
        // console.log('ttttttttt:',item.planDate,dateFormate)
        return {
          // num: index+1,// 用于列表展示的序号
          num: ((pageNum - 1) * pageSize) + (index + 1), // 序号
          key: item.id,// 用于列表渲染的key
          planDate: dateFormateStr,
          machineNo: item.machineNo, // 设备编号
          machineName: item.machineName, // 设备名称
          partTypeName: item.partTypeName, // 加工零件类型名称
          partTypeCode: item.partTypeCode, // 加工零件类型code
          partCode: item.partCode, // 加工零件code        
          partName: item.partName, // 加工零件名称        
          planNumDay: item.planNumDay, // 白班生产数
          overNumDay: item.overNumDay, // 白班完成数
          planNumNight: item.planNumNight, // 夜班生产数
          overNumNight: item.overNumNight, // 夜班完成数
          overNum: item.overNum, // 白夜班总完成数
          isFlag: item.isFlag // 是否有效
        }
      })
      console.log('dataSource:',newDataArr)
  
      this.setState((prevState) => {
        return {
          listArr: newDataArr,
          pagination: Object.assign({}, prevState.pagination, { total: res.data.total})
        }
      })      
    }
  }
  // 分页导航的监听
  onPageNumChange = (pageNum, pageSize) => {
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
  render() {
    const {
      producePlanColumn,
      editVisiable, editDataObj, pagination,
      chekboxSelectedRowKeys
    } = this.state
    const { pageNum, pageSize, total } = pagination
    // console.log(pageNum, pageSize, total)
    const rowSelection = {
      selectedRowKeys: chekboxSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        this.setState({
          chekboxSelectedRowKeys: selectedRowKeys
        })
      },
      getCheckboxProps: record => ({
        disabled: !(record.overNum===0 && record.overNumDay===0 && record.overNumNight===0) // Column configuration not to be checked
      }),
    };
    return (
      <div>
        <ConditionView>
          <SearchView>
            <DatePicker
              onChange={this.onDateChange}
              style={{ width: '40%',marginRight: '10px' }} />
            <Button type="primary" onClick={this.searchFun}>查询</Button>
          </SearchView>
          <OptView>
            <Button type="primary" onClick={this.importTemplateFun}>导入模板下载</Button>
            <Upload {...propsImportExcel}>
              <Button type="primary">导入</Button>
            </Upload>
            <Button type="primary" onClick={() => this.addPlan({})}>新增</Button> 
            <Button type="primary" onClick={this.delFun}>删除</Button>         
          </OptView>
        </ConditionView>
        <ContentView>
          <Table
            className={'data-board-table'}
            dataSource={this.state.listArr}
            columns={ producePlanColumn }
            rowSelection={rowSelection}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              onChange: this.onPageNumChange,
              total: total,
              showTotal: ((total) => {
                return `共${total}条`
              })
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

export const ProducePlanIndex = _ProducePlanIndex