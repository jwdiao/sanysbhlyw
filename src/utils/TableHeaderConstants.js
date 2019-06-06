// 加工零件信息-工序
export const workingProcedureColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: '5%',
        editable: false,
    },
    {
        title: '零件类型名称',
        dataIndex: 'partType',
        width: '20%',
        editable: false,
    },
    {
        title: '零件编号',
        dataIndex: 'partNumber',
        width: '20%',
        editable: true,
    },
    {
        title: '零件名称',
        dataIndex: 'partName',
        width: '25%',
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
        title: '零件名称',
        dataIndex: 'partName',
        width: '15%',
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
        title: '工序生产时间(分)',
        dataIndex: 'procedureProduceDuration',
        width: '10%',
        editable: false,
    },
    {
        title: '工序最短时间(分)',
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
        width: '10%',
        editable: false,
    },
    {
        title: '归属中心',
        dataIndex: 'belongingCenterName',
        width: '10%',
        editable: false,
    },
    {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '10%',
        editable: true,
    },
    {
        title: '设备编号',
        dataIndex: 'deviceNumber',
        width: '10%',
        editable: false,
    },
    {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: '10%',
        editable: false,
    },
    {
        title: '设备型号',
        dataIndex: 'deviceModel',
        width: '10%',
        editable: false,
    },{
        title: '设备单位',
        dataIndex: 'deviceUnit',
        width: '10%',
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