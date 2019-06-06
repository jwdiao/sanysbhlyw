export const PRIMARY_COLOR = '#48b2f7'
export const SECONDARY_COLOR = '#478EDA'//次要颜色，用于渐变的末端，起始端使用PRIMARY_COLOR
export const TABLE_OPERATION_EDIT = PRIMARY_COLOR// 编辑按钮
export const TABLE_OPERATION_STATUS = '#29ad00' // 状态：启用/停用按钮
export const TABLE_OPERATION_STATUS_INACTIVE = '#828282' //
export const TABLE_OPERATION_DELETE = '#ff404a' // 删除按钮
export const TABLE_OPERATION_DUPLICATE = '#29ad00' // 复制按钮
export const TABLE_OPERATION_REVERSE = 'orange' // 冲销按钮

export const SIDE_BAR_BACKGROUND_COLOR = '#33475d'
export const SIDE_BAR_BACKGROUND_COLOR_DARKER = 'rgb(25,36,51)'

export const PRIMARY_TEXT_COLOR = '#555'


export const TRIPLEDES_KEY = 'sanyznyjzyvmi';//登录密码加密用key


export const menuItems = [
    {
        key: 'baseDataManage',
        title: '基础数据管理',
        icon: 'team',
        subMenu: [
            {
                key: '/admin/ammeterInfo',
                title: '电表信息维护'
            },
            {
                key: '/admin/craftType',
                title: '工艺类型维护'
            },
            {
                key: '/admin/workCenter',
                title: '工作中心维护'
            },
            {
                key: '/admin/deviceType',
                title: '生产设备类型'
            },
            {
                key: '/admin/deviceInfo',
                title: '生产设备信息'
            },
            {
                key: '/admin/partsType',
                title: '加工零件类型'
            },
            {
                key: '/admin/partsInfo',
                title: '加工零件信息'
            },
        ]
    },
    {
        key: 'businessManage',
        title: '业务管理',
        icon: 'team',
        subMenu: [
            {
                key: '/admin/producePaln',
                title: '生产计划排程'
            }
        ]
    }
]

/**
 * 是否有效
 * @type {*[]}
 */
export const validStateList = [
    {
        key:'valid',
        value:1,
        label:'是'
    },
    {
        key:'invalid',
        value:2,
        label:'否'
    }
]