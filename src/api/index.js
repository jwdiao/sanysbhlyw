import { http } from '../utils'
const { get, post, download, uploadFile } = http

// 登陆
export const reqLogin = (username, password) => post('/sanyBasicUser/login',{
  loginAccount: username,
  loginPwd: password
})

// 获取工艺类型列表(typeCode: 00：工艺类型)
/* export const reqTypeCode = (typeCode) => post('/basicCode/find/companycode/typecode', {
  typeCode: typeCode,
  compnyCode: '0'
}) */
// 通过子公司编号查询子公司对应的工艺和基础工艺的匹配关系列表
export const reqCraftList = (companyCode) => get('/basicCompanyGroup/finnd/all/'+companyCode)

// 保存子公司工艺类型
export const reqSaveCraft = (dataArr) => post('/basicCompanyGroup/save',
  dataArr
)

// 工作中心 == 列表
export const reqFindCenterList = () => post('/basicCompanyCenter/findlist', {
  "workCenterName": '', // 加工中心名字
  "isFlag": '', // 是否有效（0无效，1有效）
})

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

// 加工零件类型== 列表
export const reqPartTypeList = (data) => post('/productType/find/all', {
  "pageNum": data.pageNum,
  "pageSize": data.pageSize,
  "query": {
    "partTypeName": data.query.partTypeName, // 零件名称
    "isFlag": data.query.isFlag // 是否有效（0无效，1有效）
  }
})
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
export const reqSetValid = (idArr, isFlag) => post('/productType/update/isflag', {
  "idArr": idArr,
  "isFlag": isFlag
})


// 生产设备类型== 列表
export const reqDeviceTypeList = (data) => post('/machineType/findlist', {
/*   "pageNum": data.pageNum,
  "pageSize": data.pageSize,
  "query": {
    "partTypeName": data.query.partTypeName, // 零件名称
    "isFlag": data.query.isFlag // 是否有效（0无效，1有效）
  } */

  typeName: data.typeName,
  isFlag: data.isFlag
})
// 生产设备类型== 新增&编辑
export const reqSaveMachineType = (data) => post('/machineType/saveMachineType', {
  "id": data.id?data.id:'',
  "typeCode": data.deviceTypeCode,
  "typeName": data.deviceTypeName,
  "isFlag": data.isFlag
})
/* export const reqSaveMachineType = (data) => data.id ? post('/machineType/saveMachineType', {
  "id": data.id,
  "typeCode": data.partTypeCode,
  "typeName": data.partTypeName,
  "isFlag": data.isFlag
}) : post('/machineType/saveMachineType', {
  "typeCode": data.partTypeCode,
  "typeName": data.partTypeName,
  "isFlag": data.isFlag
}) */
/* 
// 生产设备类型== 设为有效&设为无效 (0无效，1有效)
export const reqSetValid = (idArr, isFlag) => post('/productType/update/isflag', {
  "idArr": idArr,
  "isFlag": isFlag
}) */