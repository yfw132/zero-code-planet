/**
 * 数据可视化Mock数据
 * 为不同数据源提供模拟数据，用于图表展示
 */

// 用户数据mock
export const userMockData = [
  {
    _id: "1",
    name: "张三",
    age: 28,
    email: "zhangsan@example.com",
    phone: "13800138001",
    gender: "male",
    city: "beijing",
    hobbies: ["reading", "music"],
    birthday: "1995-03-15",
    salary: 15000,
    experience: "3-5",
    introduction: "资深前端开发工程师",
    agreement: true,
    newsletter: true,
  },
  {
    _id: "2",
    name: "李四",
    age: 32,
    email: "lisi@example.com",
    phone: "13800138002",
    gender: "female",
    city: "shanghai",
    hobbies: ["travel", "photography"],
    birthday: "1991-07-22",
    salary: 18000,
    experience: "5-10",
    introduction: "产品经理",
    agreement: true,
    newsletter: false,
  },
  {
    _id: "3",
    name: "王五",
    age: 25,
    email: "wangwu@example.com",
    phone: "13800138003",
    gender: "male",
    city: "guangzhou",
    hobbies: ["sports", "gaming"],
    birthday: "1998-11-10",
    salary: 12000,
    experience: "1-3",
    introduction: "后端开发工程师",
    agreement: true,
    newsletter: true,
  },
  {
    _id: "4",
    name: "赵六",
    age: 35,
    email: "zhaoliu@example.com",
    phone: "13800138004",
    gender: "female",
    city: "shenzhen",
    hobbies: ["cooking", "music"],
    birthday: "1988-05-18",
    salary: 22000,
    experience: "5-10",
    introduction: "技术总监",
    agreement: true,
    newsletter: true,
  },
  {
    _id: "5",
    name: "孙七",
    age: 23,
    email: "sunqi@example.com",
    phone: "13800138005",
    gender: "male",
    city: "hangzhou",
    hobbies: ["reading", "sports"],
    birthday: "2000-02-28",
    salary: 10000,
    experience: "fresh",
    introduction: "前端实习生",
    agreement: true,
    newsletter: false,
  },
  {
    _id: "6",
    name: "周八",
    age: 29,
    email: "zhouba@example.com",
    phone: "13800138006",
    gender: "female",
    city: "chengdu",
    hobbies: ["travel", "cooking"],
    birthday: "1994-09-12",
    salary: 16000,
    experience: "3-5",
    introduction: "UI设计师",
    agreement: true,
    newsletter: true,
  },
  {
    _id: "7",
    name: "吴九",
    age: 40,
    email: "wujiu@example.com",
    phone: "13800138007",
    gender: "male",
    city: "beijing",
    hobbies: ["reading", "photography"],
    birthday: "1983-12-05",
    salary: 30000,
    experience: "10+",
    introduction: "架构师",
    agreement: true,
    newsletter: true,
  },
  {
    _id: "8",
    name: "郑十",
    age: 26,
    email: "zhengshi@example.com",
    phone: "13800138008",
    gender: "female",
    city: "shanghai",
    hobbies: ["music", "gaming"],
    birthday: "1997-08-30",
    salary: 13000,
    experience: "1-3",
    introduction: "测试工程师",
    agreement: true,
    newsletter: false,
  },
];

// 产品数据mock
export const productMockData = [
  {
    _id: "1",
    productName: "iPhone 15 Pro",
    productCode: "IP15P001",
    category: "electronics",
    price: 9999,
    stock: 50,
    brand: "Apple",
    status: "active",
    tags: ["new", "hot"],
    description: "最新款iPhone，配备A17芯片",
    launchDate: "2023-09-15",
    featured: true,
  },
  {
    _id: "2",
    productName: "华为Mate60",
    productCode: "HW60001",
    category: "electronics",
    price: 7999,
    stock: 80,
    brand: "华为",
    status: "active",
    tags: ["hot", "recommend"],
    description: "华为最新旗舰手机",
    launchDate: "2023-08-20",
    featured: true,
  },
  {
    _id: "3",
    productName: "阿迪达斯运动鞋",
    productCode: "AD001",
    category: "sports",
    price: 899,
    stock: 120,
    brand: "Adidas",
    status: "active",
    tags: ["sale"],
    description: "经典三条纹运动鞋",
    launchDate: "2023-06-01",
    featured: false,
  },
  {
    _id: "4",
    productName: "小米电视55寸",
    productCode: "MI55TV001",
    category: "electronics",
    price: 2999,
    stock: 35,
    brand: "小米",
    status: "active",
    tags: ["recommend"],
    description: "55寸4K智能电视",
    launchDate: "2023-07-10",
    featured: true,
  },
  {
    _id: "5",
    productName: "优衣库T恤",
    productCode: "UQ001",
    category: "clothing",
    price: 99,
    stock: 200,
    brand: "优衣库",
    status: "active",
    tags: ["sale", "hot"],
    description: "纯棉基础款T恤",
    launchDate: "2023-05-15",
    featured: false,
  },
];

// 订单数据mock
export const orderMockData = [
  {
    _id: "1",
    orderNumber: "ORD20231201001",
    customerName: "张三",
    customerPhone: "13800138001",
    totalAmount: 9999,
    orderStatus: "delivered",
    paymentMethod: "alipay",
    shippingAddress: "北京市朝阳区xxx街道123号",
    orderDate: "2023-12-01",
    deliveryDate: "2023-12-03",
    urgent: false,
    notes: "包装要仔细",
  },
  {
    _id: "2",
    orderNumber: "ORD20231201002",
    customerName: "李四",
    customerPhone: "13800138002",
    totalAmount: 7999,
    orderStatus: "shipped",
    paymentMethod: "wechat",
    shippingAddress: "上海市浦东新区xxx路456号",
    orderDate: "2023-12-01",
    deliveryDate: "2023-12-04",
    urgent: true,
    notes: "加急处理",
  },
  {
    _id: "3",
    orderNumber: "ORD20231202001",
    customerName: "王五",
    customerPhone: "13800138003",
    totalAmount: 899,
    orderStatus: "paid",
    paymentMethod: "bank",
    shippingAddress: "广州市天河区xxx大道789号",
    orderDate: "2023-12-02",
    deliveryDate: "2023-12-05",
    urgent: false,
    notes: "",
  },
  {
    _id: "4",
    orderNumber: "ORD20231202002",
    customerName: "赵六",
    customerPhone: "13800138004",
    totalAmount: 2999,
    orderStatus: "pending",
    paymentMethod: "alipay",
    shippingAddress: "深圳市南山区xxx街101号",
    orderDate: "2023-12-02",
    deliveryDate: "2023-12-06",
    urgent: false,
    notes: "货到付款",
  },
];

// 文章数据mock
export const articleMockData = [
  {
    _id: "1",
    title: "Vue3实战教程",
    author: "张三",
    category: "tech",
    tags: ["tutorial", "featured"],
    status: "published",
    publishDate: "2023-11-15",
    readTime: 15,
    summary: "Vue3框架的详细使用教程",
    content: "Vue3是一个渐进式JavaScript框架...",
    featured: true,
    allowComments: true,
  },
  {
    _id: "2",
    title: "数字化转型趋势",
    author: "李四",
    category: "business",
    tags: ["trending", "news"],
    status: "published",
    publishDate: "2023-11-20",
    readTime: 8,
    summary: "2024年企业数字化转型的新趋势",
    content: "随着技术的发展，企业数字化转型...",
    featured: true,
    allowComments: true,
  },
  {
    _id: "3",
    title: "健康生活指南",
    author: "王五",
    category: "lifestyle",
    tags: ["original"],
    status: "published",
    publishDate: "2023-11-25",
    readTime: 5,
    summary: "如何保持健康的生活方式",
    content: "健康的生活方式包括合理饮食...",
    featured: false,
    allowComments: true,
  },
];

// 员工数据mock
export const employeeMockData = [
  {
    _id: "1",
    employeeId: "EMP001",
    fullName: "张三",
    department: "tech",
    position: "前端工程师",
    level: "senior",
    email: "zhangsan@company.com",
    phone: "13800138001",
    hireDate: "2020-03-15",
    salary: 15000,
    skills: ["javascript", "react", "vue"],
    status: "active",
    notes: "技术能力突出",
    remote: false,
  },
  {
    _id: "2",
    employeeId: "EMP002",
    fullName: "李四",
    department: "product",
    position: "产品经理",
    level: "manager",
    email: "lisi@company.com",
    phone: "13800138002",
    hireDate: "2019-07-22",
    salary: 18000,
    skills: [],
    status: "active",
    notes: "产品规划能力强",
    remote: true,
  },
  {
    _id: "3",
    employeeId: "EMP003",
    fullName: "王五",
    department: "tech",
    position: "后端工程师",
    level: "middle",
    email: "wangwu@company.com",
    phone: "13800138003",
    hireDate: "2021-11-10",
    salary: 12000,
    skills: ["python", "java", "mysql"],
    status: "active",
    notes: "",
    remote: false,
  },
  {
    _id: "4",
    employeeId: "EMP004",
    fullName: "赵六",
    department: "design",
    position: "UI设计师",
    level: "senior",
    email: "zhaoliu@company.com",
    phone: "13800138004",
    hireDate: "2020-05-18",
    salary: 14000,
    skills: [],
    status: "leave",
    notes: "设计能力优秀",
    remote: false,
  },
];

// 统计数据生成函数
export const generateStatistics = (dataSourceId: string) => {
  switch (dataSourceId) {
    case "user":
      return {
        // 年龄分布
        ageDistribution: [
          { name: "20-25岁", value: 2 },
          { name: "26-30岁", value: 3 },
          { name: "31-35岁", value: 2 },
          { name: "36-40岁", value: 1 },
        ],
        // 城市分布
        cityDistribution: [
          { name: "北京", value: 2 },
          { name: "上海", value: 2 },
          { name: "广州", value: 1 },
          { name: "深圳", value: 1 },
          { name: "杭州", value: 1 },
          { name: "成都", value: 1 },
        ],
        // 薪资分布
        salaryDistribution: [
          { name: "0-10k", value: 1 },
          { name: "10k-15k", value: 3 },
          { name: "15k-20k", value: 2 },
          { name: "20k+", value: 2 },
        ],
        // 性别分布
        genderDistribution: [
          { name: "男", value: 5 },
          { name: "女", value: 3 },
        ],
        // 经验分布
        experienceDistribution: [
          { name: "应届毕业生", value: 1 },
          { name: "1-3年", value: 2 },
          { name: "3-5年", value: 2 },
          { name: "5-10年", value: 2 },
          { name: "10年以上", value: 1 },
        ],
      };

    case "product":
      return {
        // 分类分布
        categoryDistribution: [
          { name: "电子产品", value: 3 },
          { name: "运动用品", value: 1 },
          { name: "服装", value: 1 },
        ],
        // 价格分布
        priceDistribution: [
          { name: "0-500", value: 1 },
          { name: "500-2000", value: 1 },
          { name: "2000-5000", value: 1 },
          { name: "5000+", value: 2 },
        ],
        // 库存分布
        stockDistribution: [
          { name: "0-50", value: 2 },
          { name: "50-100", value: 1 },
          { name: "100+", value: 2 },
        ],
        // 状态分布
        statusDistribution: [
          { name: "上架", value: 5 },
          { name: "下架", value: 0 },
          { name: "草稿", value: 0 },
        ],
      };

    case "order":
      return {
        // 订单状态分布
        statusDistribution: [
          { name: "待付款", value: 1 },
          { name: "已付款", value: 1 },
          { name: "已发货", value: 1 },
          { name: "已收货", value: 1 },
        ],
        // 支付方式分布
        paymentDistribution: [
          { name: "支付宝", value: 2 },
          { name: "微信支付", value: 1 },
          { name: "银行卡", value: 1 },
        ],
        // 金额分布
        amountDistribution: [
          { name: "0-1000", value: 1 },
          { name: "1000-5000", value: 1 },
          { name: "5000-10000", value: 1 },
          { name: "10000+", value: 1 },
        ],
        // 月度订单趋势
        monthlyTrend: [
          { month: "11月", orders: 45, amount: 89000 },
          { month: "12月", orders: 52, amount: 105000 },
        ],
      };

    case "article":
      return {
        // 分类分布
        categoryDistribution: [
          { name: "技术", value: 1 },
          { name: "商业", value: 1 },
          { name: "生活", value: 1 },
        ],
        // 状态分布
        statusDistribution: [
          { name: "已发布", value: 3 },
          { name: "草稿", value: 0 },
          { name: "已归档", value: 0 },
        ],
        // 阅读时间分布
        readTimeDistribution: [
          { name: "0-5分钟", value: 1 },
          { name: "5-10分钟", value: 1 },
          { name: "10-20分钟", value: 1 },
        ],
        // 月度发布趋势
        publishTrend: [
          { month: "10月", count: 8 },
          { month: "11月", count: 12 },
          { month: "12月", count: 15 },
        ],
      };

    case "employee":
      return {
        // 部门分布
        departmentDistribution: [
          { name: "技术部", value: 2 },
          { name: "产品部", value: 1 },
          { name: "设计部", value: 1 },
        ],
        // 职级分布
        levelDistribution: [
          { name: "中级", value: 1 },
          { name: "高级", value: 2 },
          { name: "经理", value: 1 },
        ],
        // 薪资分布
        salaryDistribution: [
          { name: "10k-15k", value: 2 },
          { name: "15k-20k", value: 2 },
        ],
        // 在职状态分布
        statusDistribution: [
          { name: "在职", value: 3 },
          { name: "请假", value: 1 },
          { name: "离职", value: 0 },
        ],
        // 技能分布
        skillsDistribution: [
          { name: "JavaScript", value: 1 },
          { name: "React", value: 1 },
          { name: "Vue", value: 1 },
          { name: "Python", value: 1 },
          { name: "Java", value: 1 },
          { name: "MySQL", value: 1 },
        ],
      };

    default:
      return {};
  }
};

// 获取指定数据源的mock数据
export const getMockData = (dataSourceId: string) => {
  switch (dataSourceId) {
    case "user":
      return userMockData;
    case "product":
      return productMockData;
    case "order":
      return orderMockData;
    case "article":
      return articleMockData;
    case "employee":
      return employeeMockData;
    default:
      return [];
  }
};
