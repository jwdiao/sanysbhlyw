import { http } from '../utils'
const { get, post, download, uploadFile } = http

// 登陆
export const reqLogin = (username, password) => post('/sanyBasicUser/login',{
  loginAccount: username,
  loginPwd: password
})


//电表信息 == 列表（不分页）===没有使用需要删掉
export const reqAmmeterList = (deviceId, isFlag) => post('/electricity/findlist',{
  deviceId: deviceId,
  isFlag: isFlag
})
//电表信息 == 列表（分页）
export const reqAmmeterListByPage = (data) => post('/electricity/findlistByPage',
    data
        ?{
          pageNum: data.pageNum,
          pageSize: data.pageSize,
          query: {
            deviceId: data.query.deviceId,
            isFlag: data.query.isFlag
          }
        }
        :{})
//电表信息 == 新增&编辑(id为空时候为新增，不为空的时候修改，isFlag 是否有效（0无效，1有效）)
export const reqSaveElectricityInfo = (data) => post('/electricity/saveElectricityInfo', {
  "id": data.id,
  "deviceId": data.deviceId,
  "isFlag": data.isFlag
})
//电表信息 == 设为有效&设为无效 (0无效，1有效)
export const reqSetFlagForElectricityInfo = (idsStr, isFlag) => post('/electricity/setFlagForElectricityInfo', {
  "ids": idsStr,
  "isFlag": isFlag
})



//工艺类型 == 通过子公司编码获取工艺类型
export const reqCraftCheckedList = (companyCode) => get('/basicCompanyGroup/find/'+companyCode)
// 工艺类型 == 列表 通过子公司编号查询子公司对应的工艺和基础工艺的匹配关系列表
export const reqCraftList = (companyCode) => get('/basicCompanyGroup/finnd/all/'+companyCode)
// 工艺类型 == 新增&编辑
export const reqSaveCraft = (dataArr) => post('/basicCompanyGroup/save',
  dataArr
)


// 工作中心 == 列表
export const reqFindCenterList = (data) => post('/basicCompanyCenter/findlist', data?{
  "workCenterName": data.workCenterName, // 加工中心名字
  "isFlag": data.isFlag, // 是否有效（0无效，1有效）
}:{})
// 工作中心 == 新增&编辑
export const reqSaveCenter = (data) => data.id ? post('/basicCompanyCenter/saveCenter', {
  'id': data.id,
  "isFlag": data.isFlag,
  "workCenterCode": data.workCenterCode,
  "workCenterName": data.workCenterName,
}): post('/basicCompanyCenter/saveCenter', {
  "isFlag": data.isFlag,
  "workCenterCode": data.workCenterCode,
  "workCenterName": data.workCenterName,
})
// 工作中心== 设为有效&设为无效 (0无效，1有效)
export const reqSetCenterValid = (idsStr, isFlag) => post('/basicCompanyCenter/setFlagForCenter', {
  "ids": idsStr,
  "isFlag": isFlag
})


// 加工零件类型== 列表
export const reqPartTypeList = (data) => post('/productType/find/all', data?{
  "pageNum": data.pageNum,
  "pageSize": data.pageSize,
  "query": {
    "partTypeName": data.query.partTypeName, // 零件名称
    "isFlag": data.query.isFlag, // 是否有效（0无效，1有效）
    "machineNo": data.query.machineNo // 非必填
  }
}:{})
// 加工零件类型== 新增&编辑
export const reqPartSave = (data) => data.id ? post('/productType/save', {
  "id": data.id,
  "partTypeCode": data.partTypeCode,
  "partTypeName": data.partTypeName,
  "isFlag": data.isFlag
}) : post('/productType/save', {
  "partTypeCode": data.partTypeCode,
  "partTypeName": data.partTypeName,
  "isFlag": data.isFlag
})
// 加工零件类型== 设为有效&设为无效 (0无效，1有效)
export const reqSetPartValid = (idsArr, isFlag) => post('/productType/update/isflag', {
  "idArr": idsArr,
  "isFlag": isFlag
})


// 生产设备类型== 列表
export const reqDeviceTypeList = (data) => post('/machineType/findlist', data?{
  "pageNum": data.pageNum,
  "pageSize": data.pageSize,
  "query": {
    "typeName": data.query.deviceTypeName, // 设备名称
    "isFlag": data.query.isFlag // 是否有效（0无效，1有效）
  }
}:{})
// 生产设备类型== 新增&编辑（id为空时候为新增，不为空的时候修改，isFlag 是否有效（0无效，1有效））
export const reqSaveMachineType = (data) => post('/machineType/saveMachineType', {
  "id": data.id,
  "typeCode": data.typeCode,
  "typeName": data.typeName,
  "isFlag": data.isFlag
})
// 生产设备类型== 设为有效&设为无效 (0无效，1有效)
export const reqSetFlagForMachineType = (idsStr, isFlag) => post('/machineType/setFlagForMachineType', {
  "ids": idsStr,
  "isFlag": isFlag
})

// 获取PLC设备类型
export const getPlcType = ({companyCode, type}) => post('/basicCode/find/companycode/typecode',{
  "compnyCode": companyCode,
  "typeCode": type
})

// 生产计划排程== 列表
export const reqFindByPlanDate = (params) => post('/machineworkingplanMain/findByPlanDate', {
  pageNum: params.pageNum,
  pageSize: params.pageSize,
  query: {
    planDate: params.query.planDate,
    companyCode: params.query.companyCode
  }
})
// 生产计划排程== 新增&编辑
export const reqWorkPlanSave = (data) => post('/machineworkingplanMain/save', {
  id: data.id, // 编辑的行标识
  planDate: data.planDate, // 日期
  machineNo: data.machineNo, // 设备编号
  machineName: data.machineName,
  partTypeCode: data.partTypeCode, // 加工零件类型
  partTypeName: data.partTypeName, // 加工零件类型
  partCode: data.partCode, // 零件
  partName: data.partName, // 加工零件名称
  // overNumDay: data.overNumDay, // 白班完成数
  // overNumNight: data.overNumNight, // 夜班完成数
  planNumDay: data.planNumDay, // 白班生产数
  planNumNight: data.planNumNight, // 夜班完成数
  isFlag: data.isFlag // 是否有效
})

// 获取设备下拉
export const reqDeveceFindlist = (data) => post('/machineInfo/findlist', {
  "pageNum": data.pageNum,
  "pageSize": data.pageSize,
  "query": {
    "isFlag": data.query.isFlag,
  }
})
// 获取某个子公司下面已经关联过工序工步的零件列表(获取零件名称下拉)
export const reqPartFindAllByMPt = (data) => post('/productInfo/find/all/distinct', {
  "machineNo": data.machineNo,
  "partTypeCode": data.partTypeCode
})
// 生产计划排程== 通过id删除
export const reqDelPlanByIds = (idArr) => post('/machineworkingplanMain/delete/ids', {
  idArr: idArr
})
// 生产排程计划-下载导入模板 
export const reqdownloadPlan = (data) => download('/machineworkingplanMain/download/template', {
  companyCode: data.companyCode,
  planDate: data.planDate // 其中planDate格式为yyyy-MM-dd
})
// 生产排程计划-导入
export const reqUploadPlan = (data,callback) => uploadFile('/machineworkingplanMain/save/upload', data, callback)
