// 加工零件信息-工序
export const workingProcedureColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: '5%',
        editable: false,
    },
    {
        title: '设备编号',
        dataIndex: 'machineNumber',
        width: '10%',
        editable: true,
    },
    {
        title: '设备名称',
        dataIndex: 'machineName',
        width: '15%',
        editable: false,
    },
    {
        title: '零件类型编号',
        dataIndex: 'partTypeCode',
        width: '10%',
        editable: false,
    },
    {
        title: '零件类型名称',
        dataIndex: 'partTypeName',
        width: '15%',
        editable: false,
    },
    {
        title: '零件编号',
        dataIndex: 'partCode',
        width: '10%',
        editable: true,
    },
    {
        title: '零件名称',
        dataIndex: 'partName',
        width: '15%',
        editable: false,
    },
    {
        title: '是否有效',
        dataIndex: 'isValid',
        width: '10%',
        editable: false,
    }
]

// 加工零件信息-工步
export const workingStepColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: '5%',
        editable: false,
    },
    {
        title: '设备名称',
        dataIndex: 'machineName',
        width: '10%',
        editable: false,
    },
    {
        title: '零件类型名称',
        dataIndex: 'partTypeName',
        width: '10%',
        editable: false,
    },
    {
        title: '零件名称',
        dataIndex: 'partName',
        width: '10%',
        editable: false,
    },
    {
        title: '程序名称',
        dataIndex: 'stepName',
        width: '10%',
        editable: false,
    },
    {
        title: '工序号',
        dataIndex: 'procedureNumber',
        width: '10%',
        editable: true,
    },
    {
        title: '工序名称',
        dataIndex: 'procedureName',
        width: '10%',
        editable: false,
    },
    {
        title: '生产时间(分)',
        dataIndex: 'procedureProduceDuration',
        width: '10%',
        editable: false,
    },
    {
        title: '最短时间(分)',
        dataIndex: 'procedureMinimumDuration',
        width: '10%',
        editable: false,
    },{
        title: '是否有效',
        dataIndex: 'isValid',
        width: '10%',
        editable: false,
    }
]

// 生产设备信息-设备
export const deviceInfoColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: '5%',
        editable: false,
    },
    {
        title: '归属工艺',
        dataIndex: 'belongingTechnique',
        width: '9%',
        editable: false,
    },
    {
        title: '归属工作中心',
        dataIndex: 'belongingCenterName',
        width: '9%',
        editable: false,
    },
    {
        title: '设备类型',
        dataIndex: 'deviceTypeName',
        width: '9%',
        editable: true,
    },
    {
        title: '设备编号',
        dataIndex: 'deviceNumber',
        width: '9%',
        editable: false,
    },
    {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: '9%',
        editable: false,
    }, {
        title: '设备型号',
        dataIndex: 'deviceModel',
        width: '9%',
        editable: false,
    }, {
        title: 'plc类型',
        dataIndex: 'plcType',
        width: '9%',
        editable: false,
    },{
        title: '设备单位',
        dataIndex: 'deviceUnit',
        width: '9%',
        editable: false,
    },{
        title: '有效状态',
        dataIndex: 'isValid',
        width: '5%',
        editable: false,
    }
]

// 生产设备信息-电表列表
export const electricityMeterColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: '10%',
        editable: false,
    },
    {
        title: '电表编号',
        dataIndex: 'meterNumber',
        width: '20%',
        editable: false,
    },
]

// 电表信息维护
export const ammeterInfoColumns = [
  {
    title: '序号',
    dataIndex: 'num',
  },
  {
    title: '电表编号',
    dataIndex: 'deviceId',
  },
  {
    title: '是否有效',
    dataIndex: 'isFlag',
    render(text) {
      return text === '1' ? '有效': '无效'
    }
  }
]

// 生产设备类型
export const deviceTypeColumns = [
    {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center'
    },
    {
        title: '设备类型编号',
        dataIndex: 'deviceTypeCode',
        key: 'deviceTypeCode',
        align: 'center'
    },
    {
        title: '设备类型名称',
        dataIndex: 'deviceTypeName',
        key: 'deviceTypeName',
        align: 'center'
    },
    {
        title: '是否有效',
        dataIndex: 'isFlag',
        key: 'isFlag',
        align: 'center',
        render(text) {
            return text === '1' ? '有效': '无效'
        }
    },    
]

// 生产计划排程
export const producePlanColumns = [
    {
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      align: 'center'
    },
    {
      title: '日期',
      dataIndex: 'planDate',
      key: 'planDate',
      align: 'center'
    },
    {
      title: '设备编号',
      dataIndex: 'machineNo',
      key: 'machineNo',
      align: 'center'
    },
    {
      title: '设备名称',
      dataIndex: 'machineName',
      key: 'machineName',
      align: 'center'
    },
    {
        title: '加工零件类型',
        dataIndex: 'partTypeName',
        key: 'partTypeName',
        align: 'center'
    },
    {
        title: '加工零件名称',
        dataIndex: 'partName',
        key: 'partName',
        align: 'center'
    },
    {
      title: '计划生产(白)',
      dataIndex: 'planNumDay',
      key: 'planNumDay',
      align: 'center'
    },
    {
      title: '完成生产(白)',
      dataIndex: 'overNumDay',
      key: 'overNumDay',
      align: 'center'
    },
    {
      title: '计划生产(夜)',
      dataIndex: 'planNumNight',
      key: 'planNumNight',
      align: 'center'
    },
    {
      title: '完成生产(夜)',
      dataIndex: 'overNumNight',
      key: 'overNumNight',
      align: 'center'
    },
    {
      title: '是否有效',
      dataIndex: 'isFlag',
      key: 'isFlag',
      align: 'center',
      render(text) {
        return text == '1' ? '有效': '无效'
      }
    }
  ];
 
// 加工零件类型
export const partTypeColumns = [
    {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center'
    },
    {
        title: '零件类型编号',
        dataIndex: 'partTypeCode',
        key: 'partTypeCode',
        align: 'center'
    },
    {
        title: '零件类型名称',
        dataIndex: 'partTypeName',
        key: 'partTypeName',
        align: 'center'
    },
    {
        title: '是否有效',
        dataIndex: 'isFlag',
        key: 'isFlag',
        align: 'center',
        render(text) {
          return text == '1' ? '有效':'无效'
        }
    },
]

// 工作中心维护
export const workCenterColumns = [
    {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        align: 'center'
      },
      {
        title: '工作中心编号',
        dataIndex: 'workCenterCode',
        key: 'workCenterCode',
        align: 'center'
      },
      {
        title: '工作中心名称',
        dataIndex: 'workCenterName',
        key: 'workCenterName',
        align: 'center'
      },
      {
        title: '是否有效',
        dataIndex: 'isFlag',
        key: 'isFlag',
        align: 'center',
        render (value) {
          return value == '1' ? '有效': '无效'
        }
      },    
]





