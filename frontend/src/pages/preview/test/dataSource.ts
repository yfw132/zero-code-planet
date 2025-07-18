import { DataSourceSchema } from "../types/dataSource";
// ==================== 数据源实例 ====================

/**
 * 默认数据源配置
 * 包含用户信息管理的完整表单定义
 */
export const testDataSourceSchema: DataSourceSchema = [
  {
    title: "用户信息",
    description: "用户基本信息管理",
    id: "user",
    dataSource: [
      {
        name: "name",
        type: "string",
        label: "姓名",
        control: "input",
        config: {
          placeholder: "请输入您的姓名",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "age",
        type: "number",
        label: "年龄",
        control: "number",
        config: {
          placeholder: "请输入您的年龄",
        },
        validation: {
          required: true,
          min: 0,
          max: 120,
        },
      },
      {
        name: "email",
        type: "string",
        label: "邮箱",
        control: "email",
        config: {
          placeholder: "请输入您的邮箱地址",
        },
        validation: {
          required: true,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
      },
      {
        name: "phone",
        type: "string",
        label: "手机号",
        control: "tel",
        config: {
          placeholder: "请输入您的手机号",
        },
        validation: {
          required: true,
          pattern: "^1[3-9]\\d{9}$",
        },
      },
      {
        name: "gender",
        type: "string",
        label: "性别",
        control: "radio",
        config: {
          options: [
            { value: "male", label: "男" },
            { value: "female", label: "女" },
            { value: "other", label: "其他" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "city",
        type: "string",
        label: "所在城市",
        control: "select",
        config: {
          options: [
            { value: "beijing", label: "北京" },
            { value: "shanghai", label: "上海" },
            { value: "guangzhou", label: "广州" },
            { value: "shenzhen", label: "深圳" },
            { value: "hangzhou", label: "杭州" },
            { value: "chengdu", label: "成都" },
            { value: "other", label: "其他" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "hobbies",
        type: "array",
        label: "兴趣爱好",
        control: "checkbox",
        config: {
          options: [
            { value: "reading", label: "阅读" },
            { value: "music", label: "音乐" },
            { value: "sports", label: "运动" },
            { value: "travel", label: "旅行" },
            { value: "cooking", label: "烹饪" },
            { value: "photography", label: "摄影" },
            { value: "gaming", label: "游戏" },
          ],
        },
      },
      {
        name: "birthday",
        type: "date",
        label: "出生日期",
        control: "date",
      },
      {
        name: "salary",
        type: "number",
        label: "期望薪资",
        control: "number",
        config: {
          placeholder: "请输入期望薪资",
          suffix: "元",
        },
        validation: {
          min: 0,
        },
      },
      {
        name: "experience",
        type: "string",
        label: "工作经验",
        control: "select",
        config: {
          options: [
            { value: "fresh", label: "应届毕业生" },
            { value: "1-3", label: "1-3年" },
            { value: "3-5", label: "3-5年" },
            { value: "5-10", label: "5-10年" },
            { value: "10+", label: "10年以上" },
          ],
        },
      },
      {
        name: "introduction",
        type: "string",
        label: "个人简介",
        control: "textarea",
        config: {
          placeholder: "请简单介绍一下自己",
          rows: 4,
        },
        validation: {
          maxLength: 500,
        },
      },
      {
        name: "agreement",
        type: "boolean",
        label: "我同意用户协议和隐私政策",
        control: "checkbox",
        validation: {
          required: true,
        },
      },
      {
        name: "newsletter",
        type: "boolean",
        label: "订阅产品更新邮件",
        control: "switch",
        config: {
          default: false,
        },
      },
    ],
  },
  {
    title: "产品管理",
    description: "产品信息管理系统",
    id: "product",
    dataSource: [
      {
        name: "productName",
        type: "string",
        label: "产品名称",
        control: "input",
        config: {
          placeholder: "请输入产品名称",
        },
        validation: {
          required: true,
          maxLength: 100,
        },
      },
      {
        name: "productCode",
        type: "string",
        label: "产品编码",
        control: "input",
        config: {
          placeholder: "请输入产品编码",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "category",
        type: "string",
        label: "产品分类",
        control: "select",
        config: {
          options: [
            { value: "electronics", label: "电子产品" },
            { value: "clothing", label: "服装" },
            { value: "books", label: "图书" },
            { value: "food", label: "食品" },
            { value: "sports", label: "运动用品" },
            { value: "beauty", label: "美妆" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "price",
        type: "number",
        label: "价格",
        control: "number",
        config: {
          placeholder: "请输入价格",
          suffix: "元",
        },
        validation: {
          required: true,
          min: 0,
        },
      },
      {
        name: "stock",
        type: "number",
        label: "库存",
        control: "number",
        config: {
          placeholder: "请输入库存数量",
        },
        validation: {
          required: true,
          min: 0,
        },
      },
      {
        name: "brand",
        type: "string",
        label: "品牌",
        control: "input",
        config: {
          placeholder: "请输入品牌名称",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "status",
        type: "string",
        label: "状态",
        control: "radio",
        config: {
          options: [
            { value: "active", label: "上架" },
            { value: "inactive", label: "下架" },
            { value: "draft", label: "草稿" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "tags",
        type: "array",
        label: "标签",
        control: "checkbox",
        config: {
          options: [
            { value: "new", label: "新品" },
            { value: "hot", label: "热销" },
            { value: "sale", label: "促销" },
            { value: "limited", label: "限量" },
            { value: "recommend", label: "推荐" },
          ],
        },
      },
      {
        name: "description",
        type: "string",
        label: "产品描述",
        control: "textarea",
        config: {
          placeholder: "请输入产品描述",
          rows: 5,
        },
        validation: {
          maxLength: 1000,
        },
      },
      {
        name: "launchDate",
        type: "date",
        label: "上架日期",
        control: "date",
      },
      {
        name: "featured",
        type: "boolean",
        label: "精选产品",
        control: "switch",
        config: {
          default: false,
        },
      },
    ],
  },
  {
    title: "订单管理",
    description: "订单信息管理系统",
    id: "order",
    dataSource: [
      {
        name: "orderNumber",
        type: "string",
        label: "订单号",
        control: "input",
        config: {
          placeholder: "请输入订单号",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "customerName",
        type: "string",
        label: "客户姓名",
        control: "input",
        config: {
          placeholder: "请输入客户姓名",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "customerPhone",
        type: "string",
        label: "客户电话",
        control: "tel",
        config: {
          placeholder: "请输入客户电话",
        },
        validation: {
          required: true,
          pattern: "^1[3-9]\\d{9}$",
        },
      },
      {
        name: "totalAmount",
        type: "number",
        label: "订单金额",
        control: "number",
        config: {
          placeholder: "请输入订单金额",
          suffix: "元",
        },
        validation: {
          required: true,
          min: 0,
        },
      },
      {
        name: "orderStatus",
        type: "string",
        label: "订单状态",
        control: "select",
        config: {
          options: [
            { value: "pending", label: "待付款" },
            { value: "paid", label: "已付款" },
            { value: "shipped", label: "已发货" },
            { value: "delivered", label: "已收货" },
            { value: "cancelled", label: "已取消" },
            { value: "refunded", label: "已退款" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "paymentMethod",
        type: "string",
        label: "支付方式",
        control: "radio",
        config: {
          options: [
            { value: "alipay", label: "支付宝" },
            { value: "wechat", label: "微信支付" },
            { value: "bank", label: "银行卡" },
            { value: "cash", label: "现金" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "shippingAddress",
        type: "string",
        label: "收货地址",
        control: "textarea",
        config: {
          placeholder: "请输入收货地址",
          rows: 3,
        },
        validation: {
          required: true,
          maxLength: 200,
        },
      },
      {
        name: "orderDate",
        type: "date",
        label: "下单日期",
        control: "date",
        validation: {
          required: true,
        },
      },
      {
        name: "deliveryDate",
        type: "date",
        label: "预计送达日期",
        control: "date",
      },
      {
        name: "urgent",
        type: "boolean",
        label: "加急订单",
        control: "switch",
        config: {
          default: false,
        },
      },
      {
        name: "notes",
        type: "string",
        label: "备注",
        control: "textarea",
        config: {
          placeholder: "请输入备注信息",
          rows: 3,
        },
        validation: {
          maxLength: 500,
        },
      },
    ],
  },
  {
    title: "文章管理",
    description: "文章内容管理系统",
    id: "article",
    dataSource: [
      {
        name: "title",
        type: "string",
        label: "文章标题",
        control: "input",
        config: {
          placeholder: "请输入文章标题",
        },
        validation: {
          required: true,
          maxLength: 100,
        },
      },
      {
        name: "author",
        type: "string",
        label: "作者",
        control: "input",
        config: {
          placeholder: "请输入作者姓名",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "category",
        type: "string",
        label: "分类",
        control: "select",
        config: {
          options: [
            { value: "tech", label: "技术" },
            { value: "business", label: "商业" },
            { value: "lifestyle", label: "生活" },
            { value: "travel", label: "旅游" },
            { value: "food", label: "美食" },
            { value: "sports", label: "体育" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "tags",
        type: "array",
        label: "标签",
        control: "checkbox",
        config: {
          options: [
            { value: "trending", label: "热门" },
            { value: "featured", label: "精选" },
            { value: "original", label: "原创" },
            { value: "tutorial", label: "教程" },
            { value: "news", label: "资讯" },
          ],
        },
      },
      {
        name: "status",
        type: "string",
        label: "状态",
        control: "radio",
        config: {
          options: [
            { value: "draft", label: "草稿" },
            { value: "published", label: "已发布" },
            { value: "archived", label: "已归档" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "publishDate",
        type: "date",
        label: "发布日期",
        control: "date",
      },
      {
        name: "readTime",
        type: "number",
        label: "阅读时间",
        control: "number",
        config: {
          placeholder: "请输入预计阅读时间",
          suffix: "分钟",
        },
        validation: {
          min: 1,
          max: 999,
        },
      },
      {
        name: "summary",
        type: "string",
        label: "摘要",
        control: "textarea",
        config: {
          placeholder: "请输入文章摘要",
          rows: 3,
        },
        validation: {
          maxLength: 300,
        },
      },
      {
        name: "content",
        type: "string",
        label: "内容",
        control: "textarea",
        config: {
          placeholder: "请输入文章内容",
          rows: 10,
        },
        validation: {
          required: true,
          maxLength: 10000,
        },
      },
      {
        name: "featured",
        type: "boolean",
        label: "推荐文章",
        control: "switch",
        config: {
          default: false,
        },
      },
      {
        name: "allowComments",
        type: "boolean",
        label: "允许评论",
        control: "switch",
        config: {
          default: true,
        },
      },
    ],
  },
  {
    title: "员工管理",
    description: "员工信息管理系统",
    id: "employee",
    dataSource: [
      {
        name: "employeeId",
        type: "string",
        label: "员工编号",
        control: "input",
        config: {
          placeholder: "请输入员工编号",
        },
        validation: {
          required: true,
          maxLength: 20,
        },
      },
      {
        name: "fullName",
        type: "string",
        label: "姓名",
        control: "input",
        config: {
          placeholder: "请输入员工姓名",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "department",
        type: "string",
        label: "部门",
        control: "select",
        config: {
          options: [
            { value: "tech", label: "技术部" },
            { value: "product", label: "产品部" },
            { value: "design", label: "设计部" },
            { value: "marketing", label: "市场部" },
            { value: "sales", label: "销售部" },
            { value: "hr", label: "人事部" },
            { value: "finance", label: "财务部" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "position",
        type: "string",
        label: "职位",
        control: "input",
        config: {
          placeholder: "请输入职位",
        },
        validation: {
          required: true,
          maxLength: 50,
        },
      },
      {
        name: "level",
        type: "string",
        label: "级别",
        control: "select",
        config: {
          options: [
            { value: "intern", label: "实习生" },
            { value: "junior", label: "初级" },
            { value: "middle", label: "中级" },
            { value: "senior", label: "高级" },
            { value: "lead", label: "组长" },
            { value: "manager", label: "经理" },
            { value: "director", label: "总监" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "email",
        type: "string",
        label: "邮箱",
        control: "email",
        config: {
          placeholder: "请输入邮箱地址",
        },
        validation: {
          required: true,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
      },
      {
        name: "phone",
        type: "string",
        label: "手机号",
        control: "tel",
        config: {
          placeholder: "请输入手机号",
        },
        validation: {
          required: true,
          pattern: "^1[3-9]\\d{9}$",
        },
      },
      {
        name: "hireDate",
        type: "date",
        label: "入职日期",
        control: "date",
        validation: {
          required: true,
        },
      },
      {
        name: "salary",
        type: "number",
        label: "薪资",
        control: "number",
        config: {
          placeholder: "请输入薪资",
          suffix: "元",
        },
        validation: {
          required: true,
          min: 0,
        },
      },
      {
        name: "skills",
        type: "array",
        label: "技能",
        control: "checkbox",
        config: {
          options: [
            { value: "javascript", label: "JavaScript" },
            { value: "python", label: "Python" },
            { value: "java", label: "Java" },
            { value: "react", label: "React" },
            { value: "vue", label: "Vue" },
            { value: "nodejs", label: "Node.js" },
            { value: "mysql", label: "MySQL" },
            { value: "mongodb", label: "MongoDB" },
          ],
        },
      },
      {
        name: "status",
        type: "string",
        label: "状态",
        control: "radio",
        config: {
          options: [
            { value: "active", label: "在职" },
            { value: "leave", label: "请假" },
            { value: "resigned", label: "离职" },
          ],
        },
        validation: {
          required: true,
        },
      },
      {
        name: "notes",
        type: "string",
        label: "备注",
        control: "textarea",
        config: {
          placeholder: "请输入备注信息",
          rows: 3,
        },
        validation: {
          maxLength: 500,
        },
      },
      {
        name: "remote",
        type: "boolean",
        label: "远程办公",
        control: "switch",
        config: {
          default: false,
        },
      },
    ],
  },
];
